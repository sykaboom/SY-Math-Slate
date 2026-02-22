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
} from "@core/runtime/plugin-runtime/mcpGateway";
import { registerDeclarativePluginManifest } from "@core/runtime/plugin-runtime/pluginLoader";
import {
  listKnownUISlotNames,
  registerToolRegistryEntry,
} from "@core/runtime/plugin-runtime/registry";
import {
  getAdapterInvokerById,
  listExtensionAdapters,
  registerDefaultExtensionAdapters,
  registerExtensionAdapter,
} from "@features/platform/extensions/adapters";
import {
  registerCommandExecutionPolicy,
  resetCommandExecutionPolicy,
} from "@features/platform/extensions/commandExecutionPolicy";
import { registerCoreCommands } from "@features/platform/extensions/commands/registerCoreCommands";
import {
  registerToolExecutionPolicy,
  resetToolExecutionPolicy,
} from "@features/platform/extensions/toolExecutionPolicy";
import {
  emitAdapterRegistrationAuditEvent,
  emitAdapterSandboxDecisionAuditEvent,
  registerObservabilityRuntime,
  resetObservabilityRuntime,
} from "@features/platform/observability/auditLogger";
import { INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY } from "@features/editor/input-studio/llm/types";

import { registerCoreSlots } from "../registerCoreSlots";
import { createBrowserMcpRuntime } from "./createBrowserMcpRuntime";
import { createRoutedAdapter, type AdapterDelegate } from "./createRoutedAdapter";

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

type BootstrapOrchestratorOptions = {
  role: "host" | "student";
};

export const createBootstrapOrchestrator = ({
  role,
}: BootstrapOrchestratorOptions): (() => void) => {
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
};
