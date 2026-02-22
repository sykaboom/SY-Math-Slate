import type { McpGatewayMessageRuntime } from "@core/runtime/plugin-runtime/mcpGateway";

import { isRecord } from "./bootstrapParsers";

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

export const createBrowserMcpRuntime = (): McpGatewayMessageRuntime | null => {
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
