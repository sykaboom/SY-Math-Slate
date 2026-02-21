"use client";

import { useEffect } from "react";

import { dispatchCommand, listAppCommands } from "@core/runtime/command/commandBus";
import {
  configureToolExecutionPreflightHook,
  resetToolExecutionPreflightHook,
} from "@core/runtime/plugin-runtime/connectors";
import { evaluateLocalAiSandboxPolicy } from "@core/runtime/plugin-runtime/localAiSandboxPolicy";
import {
  createLocalRuntimeSessionEnvelope,
  type LocalRuntimeHandshakeRole,
} from "@core/runtime/plugin-runtime/localRuntimeHandshake";
import {
  initializeMcpGatewayRuntime,
  type McpGatewayDispatchRequest,
  type McpGatewayDispatchResponse,
  type McpGatewayMessageRuntime,
} from "@core/runtime/plugin-runtime/mcpGateway";
import { registerDeclarativePluginManifest } from "@core/runtime/plugin-runtime/pluginLoader";
import {
  getToolRegistryEntryById,
  listKnownUISlotNames,
  registerToolRegistryEntry,
} from "@core/runtime/plugin-runtime/registry";
import type { ToolRegistryCategory } from "@core/foundation/schemas";
import {
  getAdapterInvokerById,
  listExtensionAdapters,
  registerDefaultExtensionAdapters,
  registerExtensionAdapter,
  type ExtensionAdapter,
} from "@features/extensions/adapters";
import {
  registerCommandExecutionPolicy,
  resetCommandExecutionPolicy,
} from "@features/extensions/commandExecutionPolicy";
import { registerCoreCommands } from "@features/extensions/commands/registerCoreCommands";
import {
  routeAdapterByCapabilityCostLatency,
  resolveLocalCloudFallbackChain,
  toCapabilityRouterAuditSummary,
  toLocalCloudFallbackAuditSummary,
  type CapabilityRouterRequestShape,
  type LocalCloudFallbackChainEntry,
  type LocalCloudFallbackHealthHint,
  type LocalCloudFallbackHealthState,
} from "@features/extensions/routing";
import {
  registerToolExecutionPolicy,
  resetToolExecutionPolicy,
} from "@features/extensions/toolExecutionPolicy";
import {
  emitAdapterExecutionResultAuditEvent,
  emitAdapterRegistrationAuditEvent,
  emitAdapterRoutingDecisionAuditEvent,
  emitAdapterSandboxDecisionAuditEvent,
  registerObservabilityRuntime,
  resetObservabilityRuntime,
} from "@features/observability/auditLogger";
import { INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY } from "@features/input-studio/llm/types";
import { useLocalStore } from "@features/store/useLocalStore";
import ErrorBoundary from "@ui/components/ErrorBoundary";

import { registerCoreSlots } from "./registerCoreSlots";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

const readStringFromRecord = (
  value: Record<string, unknown> | null,
  key: string
): string | undefined => {
  if (!value) return undefined;
  const candidate = value[key];
  if (typeof candidate !== "string") return undefined;
  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
};

const readNumberFromRecord = (
  value: Record<string, unknown> | null,
  key: string
): number | undefined => {
  if (!value) return undefined;
  const candidate = value[key];
  if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < 0) {
    return undefined;
  }
  return candidate;
};

const pickRoutingRequestShape = (
  payload: unknown,
  meta: Record<string, unknown> | undefined
): CapabilityRouterRequestShape => {
  const payloadRecord = isRecord(payload) ? payload : null;
  const metaRecord = isRecord(meta) ? meta : null;

  const locale =
    readStringFromRecord(payloadRecord, "locale") ??
    readStringFromRecord(metaRecord, "locale");
  const mediaType =
    readStringFromRecord(payloadRecord, "mediaType") ??
    readStringFromRecord(payloadRecord, "mimeType") ??
    readStringFromRecord(metaRecord, "mediaType");
  const inputTokens =
    readNumberFromRecord(payloadRecord, "inputTokens") ??
    readNumberFromRecord(metaRecord, "inputTokens");
  const outputTokens =
    readNumberFromRecord(payloadRecord, "outputTokens") ??
    readNumberFromRecord(metaRecord, "outputTokens");
  const assetBytes =
    readNumberFromRecord(payloadRecord, "assetBytes") ??
    readNumberFromRecord(metaRecord, "assetBytes");

  return {
    ...(locale ? { locale } : {}),
    ...(mediaType ? { mediaType } : {}),
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
    ...(assetBytes !== undefined ? { assetBytes } : {}),
  };
};

const appendUniqueAdapterId = (
  target: string[],
  seen: Set<string>,
  value: unknown
): void => {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (trimmed === "" || seen.has(trimmed)) return;
  seen.add(trimmed);
  target.push(trimmed);
};

const appendAdapterIds = (
  target: string[],
  seen: Set<string>,
  value: unknown
): void => {
  if (typeof value === "string") {
    appendUniqueAdapterId(target, seen, value);
    return;
  }

  if (!Array.isArray(value)) return;
  value.forEach((entry) => {
    appendUniqueAdapterId(target, seen, entry);
  });
};

const pickPreferredLocalAdapterIds = (
  meta: Record<string, unknown> | undefined,
  fallbackAdapterId: string
): string[] => {
  const preferred: string[] = [];
  const seen = new Set<string>();
  appendUniqueAdapterId(preferred, seen, fallbackAdapterId);

  const metaRecord = isRecord(meta) ? meta : null;
  if (!metaRecord) return preferred;

  appendAdapterIds(preferred, seen, metaRecord.preferredLocalAdapterIds);
  appendAdapterIds(preferred, seen, metaRecord.localPreferredAdapterIds);
  appendAdapterIds(preferred, seen, metaRecord.localAdapterIds);

  return preferred;
};

const parseLocalHealthState = (
  value: unknown
): LocalCloudFallbackHealthState | undefined => {
  if (typeof value !== "string") return undefined;
  const token = value.trim().toLowerCase();
  if (
    token === "healthy" ||
    token === "degraded" ||
    token === "unhealthy" ||
    token === "unknown"
  ) {
    return token;
  }
  return undefined;
};

const normalizeHealthHint = (
  hint: LocalCloudFallbackHealthHint
): LocalCloudFallbackHealthHint | null => {
  const adapterId = hint.adapterId.trim();
  if (adapterId === "") return null;

  const normalizedState = parseLocalHealthState(hint.state);
  const normalizedHealthy =
    typeof hint.healthy === "boolean" ? hint.healthy : undefined;

  return {
    adapterId,
    ...(normalizedState ? { state: normalizedState } : {}),
    ...(normalizedHealthy !== undefined ? { healthy: normalizedHealthy } : {}),
  };
};

const toHealthHintFromRecord = (value: unknown): LocalCloudFallbackHealthHint | null => {
  if (!isRecord(value)) return null;
  const adapterId =
    readStringFromRecord(value, "adapterId") ?? readStringFromRecord(value, "id");
  if (!adapterId) return null;
  const hint: LocalCloudFallbackHealthHint = {
    adapterId,
    ...(parseLocalHealthState(value.state)
      ? { state: parseLocalHealthState(value.state) }
      : {}),
    ...(typeof value.healthy === "boolean" ? { healthy: value.healthy } : {}),
  };
  return normalizeHealthHint(hint);
};

const toHealthHintFromMapValue = (
  adapterId: string,
  value: unknown
): LocalCloudFallbackHealthHint | null => {
  const trimmedAdapterId = adapterId.trim();
  if (trimmedAdapterId === "") return null;

  if (typeof value === "boolean") {
    return {
      adapterId: trimmedAdapterId,
      healthy: value,
    };
  }

  const state = parseLocalHealthState(value);
  if (state) {
    return {
      adapterId: trimmedAdapterId,
      state,
    };
  }

  if (!isRecord(value)) return null;
  const recordState = parseLocalHealthState(value.state);
  const recordHealthy = typeof value.healthy === "boolean" ? value.healthy : undefined;
  return normalizeHealthHint({
    adapterId: trimmedAdapterId,
    ...(recordState ? { state: recordState } : {}),
    ...(recordHealthy !== undefined ? { healthy: recordHealthy } : {}),
  });
};

const appendUniqueHealthHint = (
  target: LocalCloudFallbackHealthHint[],
  seen: Set<string>,
  hint: LocalCloudFallbackHealthHint | null
): void => {
  if (!hint) return;
  const normalized = normalizeHealthHint(hint);
  if (!normalized) return;
  if (seen.has(normalized.adapterId)) return;
  seen.add(normalized.adapterId);
  target.push(normalized);
};

const appendHealthHintsFromArray = (
  target: LocalCloudFallbackHealthHint[],
  seen: Set<string>,
  value: unknown
): void => {
  if (!Array.isArray(value)) return;
  value.forEach((entry) => {
    appendUniqueHealthHint(target, seen, toHealthHintFromRecord(entry));
  });
};

const appendHealthHintsFromMap = (
  target: LocalCloudFallbackHealthHint[],
  seen: Set<string>,
  value: unknown
): void => {
  if (!isRecord(value)) return;
  Object.entries(value).forEach(([adapterId, entry]) => {
    appendUniqueHealthHint(target, seen, toHealthHintFromMapValue(adapterId, entry));
  });
};

const pickLocalHealthHints = (
  meta: Record<string, unknown> | undefined
): LocalCloudFallbackHealthHint[] => {
  const metaRecord = isRecord(meta) ? meta : null;
  if (!metaRecord) return [];

  const hints: LocalCloudFallbackHealthHint[] = [];
  const seen = new Set<string>();

  appendHealthHintsFromArray(hints, seen, metaRecord.adapterHealthHints);
  appendHealthHintsFromArray(hints, seen, metaRecord.localAdapterHealthHints);
  appendHealthHintsFromArray(hints, seen, metaRecord.healthHints);
  appendHealthHintsFromMap(hints, seen, metaRecord.adapterHealthById);
  appendHealthHintsFromMap(hints, seen, metaRecord.localAdapterHealthById);

  return hints;
};

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

const LOCAL_SENSITIVE_ADAPTER_IDS = [
  "local.ollama",
  "local.lmstudio",
  "local.webgpu-onnx",
] as const;

const resolveHandshakeRole = (role: "host" | "student"): LocalRuntimeHandshakeRole =>
  role === "host" ? "host" : "student";

const createRuntimeHandshakeSession = (
  role: LocalRuntimeHandshakeRole,
  adapterId: string
) =>
  createLocalRuntimeSessionEnvelope({
    sessionId: `local-runtime:${adapterId}:${role}:${Date.now()}`,
    adapterId,
    role,
    meta: {
      source: "extension-runtime-bootstrap",
      channel: "local-ai-preflight",
    },
  });

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

type AdapterDelegate = {
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

const createRoutedAdapter = ({
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

const isPostMessageSource = (
  value: unknown
): value is { postMessage: (...args: unknown[]) => void } =>
  isRecord(value) && typeof value.postMessage === "function";

const replyToSource = (
  source: unknown,
  origin: string,
  fallbackOrigin: string,
  payload: unknown
): void => {
  if (!isPostMessageSource(source)) return;
  const targetOrigin =
    typeof origin === "string" && origin !== "" && origin !== "null"
      ? origin
      : fallbackOrigin;

  try {
    source.postMessage(payload, targetOrigin);
    return;
  } catch {
    try {
      source.postMessage(payload);
    } catch {
      return;
    }
  }
};

const createBrowserMcpRuntime = (): McpGatewayMessageRuntime | null => {
  if (typeof window === "undefined") return null;

  return {
    getCurrentOrigin: () => window.location.origin,
    subscribe: (listener) => {
      const onMessage = (event: MessageEvent<unknown>) => {
        listener({
          data: event.data,
          origin: event.origin,
          source: event.source,
          respond: (message) => {
            replyToSource(event.source, event.origin, window.location.origin, message);
          },
        });
      };

      window.addEventListener("message", onMessage);
      return () => {
        window.removeEventListener("message", onMessage);
      };
    },
  };
};

const parseSessionTtlMs = (): number | undefined => {
  const rawValue = process.env.NEXT_PUBLIC_MCP_SESSION_TTL_MS;
  if (!rawValue) return undefined;
  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return undefined;
  }
  return parsedValue;
};

const listGatewayCommandMetadata = () =>
  listAppCommands().map((command) => ({
    commandId: command.id,
    title: command.id,
    description: command.description,
    mutationScope: command.mutationScope,
    requiresApproval: command.requiresApproval,
    auditTag: command.auditTag,
    schema: command.schema,
  }));

const dispatchGatewayCommand = async (
  request: McpGatewayDispatchRequest
): Promise<McpGatewayDispatchResponse> => {
  const idempotencyKey =
    typeof request.meta?.idempotencyKey === "string"
      ? request.meta.idempotencyKey
      : undefined;
  const resolved = await dispatchCommand(request.type, request.payload, {
    role: request.role,
    meta: request.meta,
    idempotencyKey,
  });

  if (!resolved.ok) {
    return {
      ok: false,
      code: resolved.code,
      message: resolved.error,
    };
  }

  return {
    ok: true,
    result: {
      commandId: resolved.commandId,
      status: resolved.code,
      result: resolved.result,
    },
  };
};

const registerGatewayPlugin = async (
  plugin: unknown
): Promise<McpGatewayDispatchResponse> => {
  const registration = registerDeclarativePluginManifest(plugin);
  if (!registration.ok) {
    return {
      ok: false,
      code: registration.code,
      message: registration.message,
    };
  }
  return {
    ok: true,
    result: {
      pluginId: registration.value.pluginId,
      replaced: registration.replaced,
    },
  };
};

export function ExtensionRuntimeBootstrap() {
  const role = useLocalStore((state) => state.role);
  const setTrustedRoleClaim = useLocalStore((state) => state.setTrustedRoleClaim);
  const clearTrustedRoleClaim = useLocalStore(
    (state) => state.clearTrustedRoleClaim
  );

  useEffect(() => {
    const verifyTrustedRole = async () => {
      if (typeof window === "undefined") return;
      if (role === "student") {
        setTrustedRoleClaim("student");
        return;
      }
      const roleToken = process.env.NEXT_PUBLIC_ROLE_TRUST_TOKEN;
      if (!roleToken) {
        clearTrustedRoleClaim();
        return;
      }
      try {
        const response = await fetch("/api/trust/role", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            requestedRole: role,
            roleToken,
          }),
        });
        if (!response.ok) {
          clearTrustedRoleClaim();
          return;
        }
        const body = (await response.json()) as { role?: unknown };
        if (body.role === "host" || body.role === "student") {
          setTrustedRoleClaim(body.role);
          return;
        }
        clearTrustedRoleClaim();
      } catch {
        clearTrustedRoleClaim();
      }
    };
    void verifyTrustedRole();

    registerCoreSlots();
    registerDefaultExtensionAdapters();
    const adapterSnapshot = listExtensionAdapters();
    const baselineDelegates = new Map<string, AdapterDelegate>();
    adapterSnapshot.forEach((adapter) => {
      emitAdapterRegistrationAuditEvent({
        adapterId: adapter.adapterId,
        supports: adapter.supports,
        source: "runtime-bootstrap-default",
      });
      const invoker = getAdapterInvokerById(adapter.adapterId);
      if (!invoker) return;
      baselineDelegates.set(adapter.adapterId, {
        adapterId: adapter.adapterId,
        supports: [...adapter.supports],
        invoke: invoker,
      });
    });

    const routedAdapterId = INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY.execution.localRuntimeId;
    if (typeof routedAdapterId === "string" && routedAdapterId.trim() !== "") {
      registerExtensionAdapter(
        createRoutedAdapter({
          routedAdapterId,
          defaultCategory: INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY.category,
          baselineDelegates,
        })
      );
      emitAdapterRegistrationAuditEvent({
        adapterId: routedAdapterId,
        supports: [INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY.category],
        source: "runtime-bootstrap-routing-resolver",
      });
    }
    registerToolRegistryEntry(INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY);
    registerCoreCommands();
    registerCommandExecutionPolicy();
    registerToolExecutionPolicy();
    const handshakeRole = resolveHandshakeRole(role);
    const handshakeByAdapterId = new Map<string, unknown>();
    LOCAL_SENSITIVE_ADAPTER_IDS.forEach((adapterId) => {
      handshakeByAdapterId.set(
        adapterId,
        createRuntimeHandshakeSession(handshakeRole, adapterId)
      );
    });
    configureToolExecutionPreflightHook((context) => {
      const decision = evaluateLocalAiSandboxPolicy(
        {
          adapterId: context.adapterId,
          toolId: context.registeredTool.toolId,
          role: handshakeRole,
          meta: context.request.meta,
          handshakeSession: handshakeByAdapterId.get(context.adapterId),
        },
        {
          localAdapterPrefixes: LOCAL_SENSITIVE_ADAPTER_IDS,
        }
      );

      emitAdapterSandboxDecisionAuditEvent({
        toolId: context.registeredTool.toolId,
        adapterId: context.adapterId,
        role: handshakeRole,
        decision: decision.ok ? "allow" : "deny",
        code: decision.code,
        reason: decision.ok ? "sandbox-allow" : decision.error,
        handshakeSessionId: decision.handshakeSessionId,
        handshakeValid: decision.ok,
        meta: {
          requiresHandshake: decision.requiresHandshake,
          fallbackAdapterId: context.fallbackAdapterId,
        },
      });

      if (decision.ok) {
        return { ok: true };
      }
      return {
        ok: false,
        code: decision.code,
        error: decision.error,
      };
    });
    registerObservabilityRuntime();
    const runtime = createBrowserMcpRuntime();
    const gateway = runtime
      ? initializeMcpGatewayRuntime({
          runtime,
          commandBus: {
            listCommands: listGatewayCommandMetadata,
            dispatch: dispatchGatewayCommand,
          },
          pluginLoader: {
            register: registerGatewayPlugin,
          },
          listUISlots: listKnownUISlotNames,
          allowedOriginEnv: process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
          capabilityTokenEnv: process.env.NEXT_PUBLIC_MCP_CAPABILITY_TOKEN,
          sessionTtlMs: parseSessionTtlMs(),
        })
      : null;

    return () => {
      gateway?.stop();
      resetObservabilityRuntime();
      resetCommandExecutionPolicy();
      resetToolExecutionPolicy();
      resetToolExecutionPreflightHook();
    };
  }, [clearTrustedRoleClaim, role, setTrustedRoleClaim]);

  return <ErrorBoundary fallback={null}>{null}</ErrorBoundary>;
}
