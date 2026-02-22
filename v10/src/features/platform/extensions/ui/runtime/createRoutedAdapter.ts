import type { ToolRegistryCategory } from "@core/foundation/schemas";
import { getToolRegistryEntryById } from "@core/runtime/plugin-runtime/registry";
import {
  getAdapterInvokerById,
  listExtensionAdapters,
  type ExtensionAdapter,
} from "@features/platform/extensions/adapters";
import {
  routeAdapterByCapabilityCostLatency,
  resolveLocalCloudFallbackChain,
  toCapabilityRouterAuditSummary,
  toLocalCloudFallbackAuditSummary,
  type LocalCloudFallbackChainEntry,
} from "@features/platform/extensions/routing";
import {
  emitAdapterExecutionResultAuditEvent,
  emitAdapterRoutingDecisionAuditEvent,
} from "@features/platform/observability/auditLogger";

import { pickLocalHealthHints } from "./bootstrapHealthHints";
import {
  isRecord,
  isStringArray,
  pickPreferredLocalAdapterIds,
  pickRoutingRequestShape,
  readNumberFromRecord,
} from "./bootstrapParsers";

const toFallbackAuditReason = (
  fallbackReason: string,
  baselineReason: string
): string => `local-cloud-fallback:${fallbackReason}:baseline=${baselineReason}`;

const toFallbackAuditRankedCandidates = (orderedChain: LocalCloudFallbackChainEntry[]) =>
  orderedChain.map((entry) => {
    const healthSelectable = entry.healthState !== "unhealthy";
    const eligible = entry.eligible && healthSelectable;
    const capabilityScore =
      (entry.isLocal ? 2_000 : 1_000) +
      (entry.preferredLocal ? 200 : 0) +
      (entry.healthState === "healthy"
        ? 80
        : entry.healthState === "degraded"
          ? 40
          : entry.healthState === "unknown"
            ? 20
            : 0);

    return {
      adapterId: entry.adapterId,
      eligible,
      capabilityScore,
      estimatedCostUsd: entry.estimatedCostUsd,
      estimatedLatencyMs: entry.estimatedLatencyMs,
      rejectionReason: !entry.eligible
        ? "router-ineligible"
        : !healthSelectable
          ? "health-unhealthy"
          : undefined,
    };
  });

type AdapterRoutingHint = {
  estimatedCostUsd?: number;
  estimatedLatencyMs?: number;
  costTier?: string;
  latencyTier?: "low" | "medium" | "high";
};

const ADAPTER_ROUTING_HINTS: Record<string, AdapterRoutingHint> = {
  "local.mock": {
    estimatedCostUsd: 0,
    estimatedLatencyMs: 0,
    costTier: "local-mock",
    latencyTier: "low",
  },
};

const resolveAdapterRoutingHint = (
  adapterId: string,
  toolCostTier: string | undefined
): AdapterRoutingHint => {
  const hint = ADAPTER_ROUTING_HINTS[adapterId];
  if (hint) {
    return {
      ...hint,
      costTier: hint.costTier ?? toolCostTier,
    };
  }
  return {
    costTier: toolCostTier,
  };
};

type AdapterInvoker = NonNullable<ReturnType<typeof getAdapterInvokerById>>;

export type AdapterDelegate = {
  adapterId: string;
  supports: ToolRegistryCategory[];
  invoke: AdapterInvoker;
};

type RoutedAdapterConfig = {
  routedAdapterId: string;
  defaultCategory: ToolRegistryCategory;
  baselineDelegates: Map<string, AdapterDelegate>;
};

const collectRoutingDelegates = ({
  routedAdapterId,
  baselineDelegates,
}: RoutedAdapterConfig): Map<string, AdapterDelegate> => {
  const delegates = new Map<string, AdapterDelegate>();

  baselineDelegates.forEach((entry, adapterId) => {
    delegates.set(adapterId, entry);
  });

  listExtensionAdapters().forEach((adapter) => {
    if (adapter.adapterId === routedAdapterId) return;
    const invoker = getAdapterInvokerById(adapter.adapterId);
    if (!invoker) return;
    delegates.set(adapter.adapterId, {
      adapterId: adapter.adapterId,
      supports: [...adapter.supports],
      invoke: invoker,
    });
  });

  return delegates;
};

const toSafeWarnings = (diagnostics: unknown): string[] => {
  if (!isRecord(diagnostics)) return [];
  const warnings = diagnostics.warnings;
  return isStringArray(warnings) ? warnings.slice(0, 24) : [];
};

export const createRoutedAdapter = ({
  routedAdapterId,
  defaultCategory,
  baselineDelegates,
}: RoutedAdapterConfig): ExtensionAdapter => ({
  adapterId: routedAdapterId,
  supports: [defaultCategory],
  invoke: async (request) => {
    const toolId = request.toolId ?? request.type;
    const requestedAdapterId =
      typeof request.adapterId === "string" && request.adapterId.trim() !== ""
        ? request.adapterId
        : routedAdapterId;
    if (typeof toolId !== "string" || toolId.trim() === "") {
      emitAdapterExecutionResultAuditEvent({
        toolId: "unknown",
        requestedAdapterId,
        selectedAdapterId: null,
        ok: false,
        code: "invalid-tool-id",
        error: "router adapter request missing toolId/type string.",
      });
      return {
        ok: false,
        error: "router adapter request missing toolId/type string.",
      };
    }

    const toolEntry = getToolRegistryEntryById(toolId);
    const delegates = collectRoutingDelegates({
      routedAdapterId,
      defaultCategory,
      baselineDelegates,
    });

    if (!toolEntry) {
      const fallback = delegates.get(routedAdapterId);
      if (!fallback) {
        emitAdapterExecutionResultAuditEvent({
          toolId,
          requestedAdapterId,
          selectedAdapterId: null,
          ok: false,
          code: "unregistered-tool",
          error: `tool '${toolId}' is not registered in tool registry.`,
        });
        return {
          ok: false,
          error: `tool '${toolId}' is not registered in tool registry.`,
        };
      }
      const startedAt = Date.now();
      try {
        const response = await fallback.invoke({
          ...request,
          toolId,
          adapterId: fallback.adapterId,
        });
        emitAdapterExecutionResultAuditEvent({
          toolId,
          requestedAdapterId,
          selectedAdapterId: fallback.adapterId,
          ok: response.ok,
          status: response.toolResult?.status,
          code: response.ok ? undefined : "connector-failed",
          error: response.error,
          latencyMs: Date.now() - startedAt,
          warnings: toSafeWarnings(response.toolResult?.diagnostics),
        });
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        emitAdapterExecutionResultAuditEvent({
          toolId,
          requestedAdapterId,
          selectedAdapterId: fallback.adapterId,
          ok: false,
          code: "adapter-invoke-failed",
          error: message,
          latencyMs: Date.now() - startedAt,
        });
        return {
          ok: false,
          error: message,
        };
      }
    }

    const candidates = Array.from(delegates.values()).map((entry) => ({
      adapterId: entry.adapterId,
      supports: entry.supports,
      hints: resolveAdapterRoutingHint(entry.adapterId, toolEntry.policy.costTier),
    }));

    const decision = routeAdapterByCapabilityCostLatency({
      tool: {
        toolId: toolEntry.toolId,
        category: toolEntry.category,
        capabilities: toolEntry.capabilities,
        policy: toolEntry.policy,
      },
      candidates,
      request: pickRoutingRequestShape(request.payload, request.meta),
      fallbackAdapterId: routedAdapterId,
    });

    const decisionSummary = toCapabilityRouterAuditSummary(decision);
    const baselineSelectedAdapterId = decision.selectedAdapterId ?? routedAdapterId;
    const fallbackDecision = resolveLocalCloudFallbackChain({
      candidates: decision.rankedCandidates.map((candidate) => ({
        adapterId: candidate.adapterId,
        eligible: candidate.eligible,
        estimatedCostUsd: candidate.estimatedCostUsd,
        estimatedLatencyMs: candidate.estimatedLatencyMs,
      })),
      preferredLocalAdapterIds: pickPreferredLocalAdapterIds(
        request.meta,
        toolEntry.execution.localRuntimeId ?? routedAdapterId
      ),
      healthHints: pickLocalHealthHints(request.meta),
      fallbackAdapterId: baselineSelectedAdapterId,
    });
    const fallbackSummary = toLocalCloudFallbackAuditSummary(fallbackDecision);
    const selectedAdapterId =
      fallbackDecision.selectedAdapterId ?? baselineSelectedAdapterId;

    const fallbackPathUsed =
      selectedAdapterId !== baselineSelectedAdapterId || fallbackSummary.fallbackUsed;

    if (fallbackPathUsed) {
      emitAdapterRoutingDecisionAuditEvent({
        toolId,
        selectedAdapterId,
        fallbackUsed: true,
        reason: toFallbackAuditReason(fallbackSummary.reason, decisionSummary.reason),
        candidateCount: fallbackSummary.chainCount,
        rankedCandidates: toFallbackAuditRankedCandidates(
          fallbackSummary.orderedChain
        ),
      });
    } else {
      emitAdapterRoutingDecisionAuditEvent({
        toolId,
        selectedAdapterId: decisionSummary.selectedAdapterId,
        fallbackUsed: decisionSummary.fallbackUsed,
        reason: decisionSummary.reason,
        candidateCount: decisionSummary.candidateCount,
        rankedCandidates: decisionSummary.rankedCandidates,
      });
    }

    const selectedDelegate =
      delegates.get(selectedAdapterId) ?? delegates.get(routedAdapterId);

    if (!selectedDelegate) {
      emitAdapterExecutionResultAuditEvent({
        toolId,
        requestedAdapterId,
        selectedAdapterId,
        ok: false,
        code: "unknown-adapter",
        error: `no adapter delegate found for '${selectedAdapterId}'.`,
      });
      return {
        ok: false,
        error: `no adapter delegate found for '${selectedAdapterId}'.`,
      };
    }

    const startedAt = Date.now();
    try {
      const response = await selectedDelegate.invoke({
        ...request,
        toolId,
        adapterId: selectedDelegate.adapterId,
      });

      const diagnostics = response.toolResult?.diagnostics;
      const latencyMs =
        readNumberFromRecord(isRecord(diagnostics) ? diagnostics : null, "latencyMs") ??
        Date.now() - startedAt;
      const costUsd = readNumberFromRecord(
        isRecord(diagnostics) ? diagnostics : null,
        "costUsd"
      );
      emitAdapterExecutionResultAuditEvent({
        toolId,
        requestedAdapterId,
        selectedAdapterId: selectedDelegate.adapterId,
        ok: response.ok,
        status: response.toolResult?.status,
        code: response.ok ? undefined : "connector-failed",
        error: response.error,
        latencyMs,
        costUsd,
        warnings: toSafeWarnings(diagnostics),
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      emitAdapterExecutionResultAuditEvent({
        toolId,
        requestedAdapterId,
        selectedAdapterId: selectedDelegate.adapterId,
        ok: false,
        code: "adapter-invoke-failed",
        error: message,
        latencyMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        error: message,
      };
    }
  },
});
