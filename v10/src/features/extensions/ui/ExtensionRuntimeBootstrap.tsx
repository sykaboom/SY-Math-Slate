"use client";

import { useEffect } from "react";

import { dispatchCommand, listAppCommands } from "@core/engine/commandBus";
import {
  initializeMcpGatewayRuntime,
  type McpGatewayDispatchRequest,
  type McpGatewayDispatchResponse,
  type McpGatewayMessageRuntime,
} from "@core/extensions/mcpGateway";
import { registerDeclarativePluginManifest } from "@core/extensions/pluginLoader";
import {
  getToolRegistryEntryById,
  listKnownUISlotNames,
  registerToolRegistryEntry,
} from "@core/extensions/registry";
import type { ToolRegistryCategory } from "@core/contracts";
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
  toCapabilityRouterAuditSummary,
  type CapabilityRouterRequestShape,
} from "@features/extensions/routing";
import {
  registerToolExecutionPolicy,
  resetToolExecutionPolicy,
} from "@features/extensions/toolExecutionPolicy";
import {
  emitAdapterExecutionResultAuditEvent,
  emitAdapterRegistrationAuditEvent,
  emitAdapterRoutingDecisionAuditEvent,
  registerObservabilityRuntime,
  resetObservabilityRuntime,
} from "@features/observability/auditLogger";
import { INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY } from "@features/input-studio/llm/types";
import { useLocalStore } from "@features/store/useLocalStore";

import { registerCoreSlots } from "./registerCoreSlots";
import { registerCoreDeclarativeManifest } from "./registerCoreDeclarativeManifest";

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
    emitAdapterRoutingDecisionAuditEvent({
      toolId,
      selectedAdapterId: decisionSummary.selectedAdapterId,
      fallbackUsed: decisionSummary.fallbackUsed,
      reason: decisionSummary.reason,
      candidateCount: decisionSummary.candidateCount,
      rankedCandidates: decisionSummary.rankedCandidates,
    });

    const selectedAdapterId = decision.selectedAdapterId ?? routedAdapterId;
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
    registerObservabilityRuntime();
    const enableCoreManifest =
      process.env.NEXT_PUBLIC_CORE_MANIFEST_SHADOW === "1" ||
      process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";
    if (enableCoreManifest) {
      registerCoreDeclarativeManifest();
    }

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
    };
  }, [clearTrustedRoleClaim, role, setTrustedRoleClaim]);

  return null;
}
