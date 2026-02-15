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
import { listKnownUISlotNames } from "@core/extensions/registry";
import { registerDefaultExtensionAdapters } from "@features/extensions/adapters";
import {
  registerCommandExecutionPolicy,
  resetCommandExecutionPolicy,
} from "@features/extensions/commandExecutionPolicy";
import { registerCoreCommands } from "@features/extensions/commands/registerCoreCommands";
import {
  registerToolExecutionPolicy,
  resetToolExecutionPolicy,
} from "@features/extensions/toolExecutionPolicy";

import { registerCoreSlots } from "./registerCoreSlots";
import { registerCoreDeclarativeManifest } from "./registerCoreDeclarativeManifest";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
  useEffect(() => {
    registerCoreSlots();
    registerDefaultExtensionAdapters();
    registerCoreCommands();
    registerCommandExecutionPolicy();
    registerToolExecutionPolicy();
    const enableCoreManifest =
      process.env.NEXT_PUBLIC_CORE_MANIFEST_SHADOW === "1" ||
      process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER === "1";
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
      resetCommandExecutionPolicy();
      resetToolExecutionPolicy();
    };
  }, []);

  return null;
}
