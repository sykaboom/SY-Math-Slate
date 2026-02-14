import type { ToolExecutionRole } from "./connectors";

export const MCP_GATEWAY_PROTOCOL = "sy-math-slate:mcp-gateway.v1";

const DEFAULT_SESSION_TTL_MS = 5 * 60 * 1000;
const MAX_JSON_DEPTH = 8;
const MAX_JSON_NODES = 1024;

const SECRET_LIKE_KEYS = new Set([
  "apikey",
  "api_key",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "password",
  "credentials",
]);

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type JsonTraversalState = {
  depth: number;
  nodes: number;
  seen: WeakSet<object>;
};

type GatewayError = {
  code: string;
  message: string;
};

type GatewaySuccessEnvelope = {
  channel: string;
  id: string | number | null;
  method: string;
  ok: true;
  result: JsonValue;
};

type GatewayErrorEnvelope = {
  channel: string;
  id: string | number | null;
  method: string;
  ok: false;
  error: GatewayError;
};

type GatewayResponseEnvelope = GatewaySuccessEnvelope | GatewayErrorEnvelope;

export type McpGatewayMessageEvent = {
  data: unknown;
  origin: string;
  source: unknown;
  respond: (message: GatewayResponseEnvelope) => void;
};

export type McpGatewayMessageRuntime = {
  subscribe: (listener: (event: McpGatewayMessageEvent) => void) => () => void;
  getCurrentOrigin: () => string | null;
  now?: () => number;
  randomToken?: () => string;
};

export type McpGatewayCommandMetadata = {
  commandId: string;
  [key: string]: unknown;
};

export type McpGatewayDispatchRequest = {
  type: string;
  payload?: JsonValue;
  meta?: JsonObject;
  role: ToolExecutionRole;
};

export type McpGatewayDispatchResponse =
  | { ok: true; result: unknown }
  | { ok: false; code: string; message: string };

export type McpGatewayCommandBus = {
  listCommands: () => McpGatewayCommandMetadata[];
  dispatch: (
    request: McpGatewayDispatchRequest
  ) => Promise<McpGatewayDispatchResponse> | McpGatewayDispatchResponse;
};

export type McpGatewayPluginContext = {
  role: ToolExecutionRole;
  origin: string;
};

export type McpGatewayPluginLoader = {
  register: (
    plugin: JsonValue,
    context: McpGatewayPluginContext
  ) => Promise<McpGatewayDispatchResponse> | McpGatewayDispatchResponse;
};

export type McpGatewaySession = {
  source: unknown;
  origin: string;
  token: string;
  role: ToolExecutionRole;
  expiry: number;
};

export type InitializeMcpGatewayOptions = {
  runtime: McpGatewayMessageRuntime;
  commandBus: McpGatewayCommandBus;
  listUISlots: () => string[];
  pluginLoader?: McpGatewayPluginLoader;
  allowedOriginEnv?: string;
  capabilityTokenEnv?: string;
  sessionTtlMs?: number;
  protocol?: string;
};

export type McpGatewayController = {
  stop: () => void;
  getActiveSessions: () => McpGatewaySession[];
};

type ParsedCallToolRequest =
  | {
      ok: true;
      value: {
        route: "command";
        commandId: string;
        payload: JsonValue | undefined;
        meta: JsonObject | undefined;
      };
    }
  | {
      ok: true;
      value: {
        route: "plugin.register";
        plugin: JsonValue;
      };
    }
  | {
      ok: false;
      error: GatewayError;
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isJsonSafe = (
  value: unknown,
  state: JsonTraversalState = {
    depth: 0,
    nodes: 0,
    seen: new WeakSet<object>(),
  }
): value is JsonValue => {
  if (state.depth > MAX_JSON_DEPTH) {
    return false;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    isFiniteNumber(value)
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    if (state.nodes > MAX_JSON_NODES) return false;
    for (let index = 0; index < value.length; index += 1) {
      const nestedState: JsonTraversalState = {
        depth: state.depth + 1,
        nodes: state.nodes + 1,
        seen: state.seen,
      };
      if (!isJsonSafe(value[index], nestedState)) {
        return false;
      }
      state.nodes = nestedState.nodes;
    }
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  if (state.seen.has(value)) {
    return false;
  }
  state.seen.add(value);

  const nextNodes = state.nodes + 1;
  if (nextNodes > MAX_JSON_NODES) {
    state.seen.delete(value);
    return false;
  }
  state.nodes = nextNodes;

  const entries = Object.values(value);
  for (let index = 0; index < entries.length; index += 1) {
    const nestedState: JsonTraversalState = {
      depth: state.depth + 1,
      nodes: state.nodes,
      seen: state.seen,
    };
    if (!isJsonSafe(entries[index], nestedState)) {
      state.seen.delete(value);
      return false;
    }
    state.nodes = nestedState.nodes;
  }

  state.seen.delete(value);
  return true;
};

const normalizeId = (value: unknown): string | number | null => {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return null;
};

const normalizeMethod = (request: Record<string, unknown>): string | null => {
  const candidate =
    typeof request.method === "string"
      ? request.method
      : typeof request.type === "string"
        ? request.type
        : null;

  if (!candidate) return null;
  return candidate.toLowerCase();
};

const normalizeRole = (value: unknown): ToolExecutionRole | null => {
  if (value === "host" || value === "student") {
    return value;
  }
  return null;
};

const isSecretLikeKey = (key: string): boolean =>
  SECRET_LIKE_KEYS.has(key.replace(/[\s-]/g, "").toLowerCase());

const sanitizeJsonValue = (
  value: unknown,
  path: string,
  scrubbedPaths: string[],
  state: JsonTraversalState
): JsonValue | undefined => {
  if (state.depth > MAX_JSON_DEPTH) {
    scrubbedPaths.push(path);
    return undefined;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    isFiniteNumber(value)
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    if (state.nodes > MAX_JSON_NODES) {
      scrubbedPaths.push(path);
      return undefined;
    }
    const sanitizedArray = value.map((entry, index) => {
      const sanitized = sanitizeJsonValue(entry, `${path}[${index}]`, scrubbedPaths, {
        depth: state.depth + 1,
        nodes: state.nodes + 1,
        seen: state.seen,
      });
      return sanitized === undefined ? null : sanitized;
    });
    return sanitizedArray;
  }

  if (!isRecord(value)) {
    scrubbedPaths.push(path);
    return undefined;
  }

  if (state.seen.has(value)) {
    scrubbedPaths.push(path);
    return undefined;
  }
  state.seen.add(value);

  const nextNodes = state.nodes + 1;
  if (nextNodes > MAX_JSON_NODES) {
    state.seen.delete(value);
    scrubbedPaths.push(path);
    return undefined;
  }

  const sanitizedRecord: JsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    const keyPath = path === "root" ? key : `${path}.${key}`;
    if (isSecretLikeKey(key)) {
      scrubbedPaths.push(keyPath);
      continue;
    }

    const sanitizedEntry = sanitizeJsonValue(entry, keyPath, scrubbedPaths, {
      depth: state.depth + 1,
      nodes: nextNodes,
      seen: state.seen,
    });
    if (sanitizedEntry !== undefined) {
      sanitizedRecord[key] = sanitizedEntry;
    }
  }

  state.seen.delete(value);
  return sanitizedRecord;
};

const sanitizeJsonObject = (
  value: unknown
): { value: JsonObject | undefined; scrubbedPaths: string[] } => {
  if (value === undefined) {
    return { value: undefined, scrubbedPaths: [] };
  }
  if (!isRecord(value)) {
    return { value: undefined, scrubbedPaths: ["root"] };
  }

  const scrubbedPaths: string[] = [];
  const sanitized = sanitizeJsonValue(value, "root", scrubbedPaths, {
    depth: 0,
    nodes: 0,
    seen: new WeakSet<object>(),
  });
  if (!sanitized || Array.isArray(sanitized) || !isRecord(sanitized)) {
    return { value: undefined, scrubbedPaths };
  }

  return { value: sanitized, scrubbedPaths };
};

const parseAllowedOrigins = (
  allowedOriginEnv: string | undefined,
  currentOrigin: string | null
): Set<string> => {
  const configuredOrigins = (allowedOriginEnv ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (configuredOrigins.length > 0) {
    return new Set(configuredOrigins);
  }

  if (currentOrigin && currentOrigin.trim() !== "") {
    return new Set([currentOrigin]);
  }

  return new Set();
};

const isOriginAllowed = (origin: string, allowlist: Set<string>): boolean => {
  if (allowlist.has("*")) return true;
  return allowlist.has(origin);
};

const createSessionToken = (runtime: McpGatewayMessageRuntime): string => {
  if (runtime.randomToken) {
    return runtime.randomToken();
  }
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mcp-session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getNow = (runtime: McpGatewayMessageRuntime): number =>
  runtime.now ? runtime.now() : Date.now();

const normalizeCommandMetadata = (
  metadata: McpGatewayCommandMetadata[]
): JsonObject[] => {
  const normalized: JsonObject[] = [];
  for (const entry of metadata) {
    const commandIdCandidate = entry.commandId;
    if (typeof commandIdCandidate !== "string" || commandIdCandidate.trim() === "") {
      continue;
    }

    const scrubbedPaths: string[] = [];
    const sanitized = sanitizeJsonValue(entry, "root", scrubbedPaths, {
      depth: 0,
      nodes: 0,
      seen: new WeakSet<object>(),
    });
    if (!sanitized || Array.isArray(sanitized) || !isRecord(sanitized)) {
      normalized.push({ commandId: commandIdCandidate });
      continue;
    }

    normalized.push({ ...sanitized, commandId: commandIdCandidate });
  }
  return normalized;
};

const normalizeSlotNames = (slotNames: string[]): string[] => {
  const deduped = new Set<string>();
  for (const entry of slotNames) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (trimmed === "") continue;
    deduped.add(trimmed);
  }
  return Array.from(deduped.values());
};

const resolveSessionToken = (
  request: Record<string, unknown>,
  params: Record<string, unknown>
): string | null => {
  if (typeof request.sessionToken === "string" && request.sessionToken.trim() !== "") {
    return request.sessionToken;
  }
  if (typeof params.sessionToken === "string" && params.sessionToken.trim() !== "") {
    return params.sessionToken;
  }
  return null;
};

const parseCallToolRequest = (
  params: Record<string, unknown>
): ParsedCallToolRequest => {
  const routeName =
    typeof params.name === "string"
      ? params.name
      : typeof params.tool === "string"
        ? params.tool
        : typeof params.target === "string"
          ? params.target
          : "";

  const argumentsPayload = isRecord(params.arguments) ? params.arguments : {};
  const payloadSource = params.payload;

  if (routeName === "plugin.register" || routeName === "register_plugin") {
    const pluginCandidate =
      argumentsPayload.plugin ??
      argumentsPayload.manifest ??
      params.plugin ??
      params.manifest;
    if (!isJsonSafe(pluginCandidate)) {
      return {
        ok: false,
        error: {
          code: "invalid-plugin-payload",
          message: "call_tool plugin payload must be JSON-safe.",
        },
      };
    }
    return {
      ok: true,
      value: {
        route: "plugin.register",
        plugin: pluginCandidate,
      },
    };
  }

  const commandIdFromRoute = routeName.startsWith("command:")
    ? routeName.slice("command:".length)
    : null;

  const commandIdCandidate =
    commandIdFromRoute ??
    (typeof argumentsPayload.command === "string"
      ? argumentsPayload.command
      : typeof argumentsPayload.type === "string"
        ? argumentsPayload.type
        : typeof argumentsPayload.toolId === "string"
          ? argumentsPayload.toolId
          : typeof params.command === "string"
            ? params.command
            : typeof params.toolId === "string"
              ? params.toolId
              : null);

  if (
    routeName === "command.dispatch" ||
    routeName === "command" ||
    routeName.startsWith("command:") ||
    typeof commandIdCandidate === "string"
  ) {
    if (typeof commandIdCandidate !== "string" || commandIdCandidate.trim() === "") {
      return {
        ok: false,
        error: {
          code: "invalid-command-id",
          message: "call_tool command route requires a non-empty command identifier.",
        },
      };
    }

    const payloadCandidate =
      argumentsPayload.payload ??
      argumentsPayload.input ??
      (isRecord(payloadSource) ? payloadSource.payload : payloadSource);
    if (payloadCandidate !== undefined && !isJsonSafe(payloadCandidate)) {
      return {
        ok: false,
        error: {
          code: "invalid-command-payload",
          message: "call_tool command payload must be JSON-safe.",
        },
      };
    }

    const metaCandidate = argumentsPayload.meta ?? params.meta;
    const sanitizedMeta = sanitizeJsonObject(metaCandidate);
    if (metaCandidate !== undefined && !sanitizedMeta.value) {
      return {
        ok: false,
        error: {
          code: "invalid-command-meta",
          message: "call_tool command meta must be a JSON-safe object.",
        },
      };
    }

    return {
      ok: true,
      value: {
        route: "command",
        commandId: commandIdCandidate,
        payload: payloadCandidate as JsonValue | undefined,
        meta: sanitizedMeta.value,
      },
    };
  }

  return {
    ok: false,
    error: {
      code: "unsupported-tool-route",
      message: `unsupported call_tool route '${routeName || "unknown"}'.`,
    },
  };
};

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "unexpected gateway runtime error";

export const initializeMcpGatewayRuntime = (
  options: InitializeMcpGatewayOptions
): McpGatewayController => {
  const protocol = options.protocol ?? MCP_GATEWAY_PROTOCOL;
  const sessionTtlMs =
    typeof options.sessionTtlMs === "number" && options.sessionTtlMs > 0
      ? options.sessionTtlMs
      : DEFAULT_SESSION_TTL_MS;
  const allowedOrigins = parseAllowedOrigins(
    options.allowedOriginEnv,
    options.runtime.getCurrentOrigin()
  );

  const sessions = new Map<string, McpGatewaySession>();

  const respond = (
    event: McpGatewayMessageEvent,
    payload: GatewayResponseEnvelope
  ): void => {
    event.respond(payload);
  };

  const respondError = (
    event: McpGatewayMessageEvent,
    id: string | number | null,
    method: string,
    error: GatewayError
  ): void => {
    respond(event, {
      channel: protocol,
      id,
      method,
      ok: false,
      error,
    });
  };

  const respondSuccess = (
    event: McpGatewayMessageEvent,
    id: string | number | null,
    method: string,
    result: JsonValue
  ): void => {
    respond(event, {
      channel: protocol,
      id,
      method,
      ok: true,
      result,
    });
  };

  const pruneExpiredSessions = (now: number): void => {
    for (const [token, session] of sessions.entries()) {
      if (session.expiry <= now) {
        sessions.delete(token);
      }
    }
  };

  const resolveAuthenticatedSession = (
    event: McpGatewayMessageEvent,
    id: string | number | null,
    method: string,
    request: Record<string, unknown>,
    params: Record<string, unknown>
  ): McpGatewaySession | null => {
    if (!isOriginAllowed(event.origin, allowedOrigins)) {
      respondError(event, id, method, {
        code: "origin-denied",
        message: `origin '${event.origin}' is not allowlisted.`,
      });
      return null;
    }

    const token = resolveSessionToken(request, params);
    if (!token) {
      respondError(event, id, method, {
        code: "session-token-missing",
        message: "sessionToken is required.",
      });
      return null;
    }

    const session = sessions.get(token);
    if (!session) {
      respondError(event, id, method, {
        code: "session-invalid",
        message: "session token is invalid.",
      });
      return null;
    }

    const now = getNow(options.runtime);
    if (session.expiry <= now) {
      sessions.delete(token);
      respondError(event, id, method, {
        code: "session-expired",
        message: "session token has expired.",
      });
      return null;
    }

    if (session.origin !== event.origin) {
      respondError(event, id, method, {
        code: "session-origin-mismatch",
        message: "session origin does not match request origin.",
      });
      return null;
    }

    if (session.source !== event.source) {
      respondError(event, id, method, {
        code: "session-source-mismatch",
        message: "session source does not match request source.",
      });
      return null;
    }

    return session;
  };

  const unsubscribe = options.runtime.subscribe((event) => {
    void (async () => {
      try {
      if (!isRecord(event.data)) return;
      if (event.data.channel !== protocol) return;

      const request = event.data;
      const method = normalizeMethod(request);
      const id = normalizeId(request.id);

      if (!method) {
        respondError(event, id, "unknown", {
          code: "invalid-method",
          message: "message method/type must be a non-empty string.",
        });
        return;
      }

      pruneExpiredSessions(getNow(options.runtime));

      const params = isRecord(request.params)
        ? request.params
        : isRecord(request.payload)
          ? request.payload
          : request;

      if (method === "init") {
        if (!isOriginAllowed(event.origin, allowedOrigins)) {
          respondError(event, id, method, {
            code: "origin-denied",
            message: `origin '${event.origin}' is not allowlisted.`,
          });
          return;
        }

        const requiredCapabilityToken = (options.capabilityTokenEnv ?? "").trim();
        if (requiredCapabilityToken === "") {
          respondError(event, id, method, {
            code: "capability-token-not-configured",
            message: "gateway capability token is not configured.",
          });
          return;
        }

        const providedCapabilityToken =
          typeof params.capabilityToken === "string"
            ? params.capabilityToken
            : typeof request.capabilityToken === "string"
              ? request.capabilityToken
              : "";

        if (providedCapabilityToken !== requiredCapabilityToken) {
          respondError(event, id, method, {
            code: "capability-token-invalid",
            message: "capability token is invalid.",
          });
          return;
        }

        const requestedRoleCandidate = params.role ?? params.requestedRole;
        const requestedRole = normalizeRole(requestedRoleCandidate);
        if (requestedRoleCandidate !== undefined && !requestedRole) {
          respondError(event, id, method, {
            code: "invalid-role",
            message: "role must be either 'host' or 'student'.",
          });
          return;
        }

        const resolvedRole = requestedRole ?? "host";
        const token = createSessionToken(options.runtime);
        const expiry = getNow(options.runtime) + sessionTtlMs;
        sessions.set(token, {
          source: event.source,
          origin: event.origin,
          token,
          role: resolvedRole,
          expiry,
        });

        respondSuccess(event, id, method, {
          sessionToken: token,
          role: resolvedRole,
          expiry,
        });
        return;
      }

      if (method === "list_tools") {
        const session = resolveAuthenticatedSession(event, id, method, request, params);
        if (!session) return;

        let commandMetadata: JsonObject[] = [];
        try {
          commandMetadata = normalizeCommandMetadata(options.commandBus.listCommands());
        } catch (error) {
          respondError(event, id, method, {
            code: "command-metadata-failed",
            message:
              error instanceof Error
                ? error.message
                : "failed to read command metadata from command bus.",
          });
          return;
        }

        const uiSlots = normalizeSlotNames(options.listUISlots());
        respondSuccess(event, id, method, {
          role: session.role,
          tools: [
            {
              name: "command.dispatch",
              description: "Dispatch a registered command with authenticated session role.",
            },
            {
              name: "plugin.register",
              description: "Register an extension/plugin manifest through plugin loader.",
            },
          ],
          commands: commandMetadata,
          uiSlots,
        });
        return;
      }

      if (method === "call_tool") {
        const session = resolveAuthenticatedSession(event, id, method, request, params);
        if (!session) return;

        const parsedRequest = parseCallToolRequest(params);
        if (!parsedRequest.ok) {
          respondError(event, id, method, parsedRequest.error);
          return;
        }

        if (parsedRequest.value.route === "command") {
          try {
            const dispatchResult = await options.commandBus.dispatch({
              type: parsedRequest.value.commandId,
              payload: parsedRequest.value.payload,
              meta: parsedRequest.value.meta,
              role: session.role,
            });

            if (!dispatchResult.ok) {
              respondError(event, id, method, {
                code: dispatchResult.code,
                message: dispatchResult.message,
              });
              return;
            }

            const dispatchScrubbedPaths: string[] = [];
            const sanitizedDispatchResult = sanitizeJsonValue(
              dispatchResult.result,
              "result",
              dispatchScrubbedPaths,
              {
                depth: 0,
                nodes: 0,
                seen: new WeakSet<object>(),
              }
            );
            if (sanitizedDispatchResult === undefined) {
              respondError(event, id, method, {
                code: "non-json-safe-command-result",
                message: "command result is not JSON-safe.",
              });
              return;
            }

            respondSuccess(event, id, method, {
              route: "command",
              commandId: parsedRequest.value.commandId,
              result: sanitizedDispatchResult,
            });
            return;
          } catch (error) {
            respondError(event, id, method, {
              code: "command-dispatch-failed",
              message:
                error instanceof Error
                  ? error.message
                  : "command dispatch failed unexpectedly.",
            });
            return;
          }
        }

        if (!options.pluginLoader) {
          respondError(event, id, method, {
            code: "plugin-loader-unavailable",
            message: "plugin loader is not configured.",
          });
          return;
        }

        if (session.role !== "host") {
          respondError(event, id, method, {
            code: "plugin-register-forbidden-role",
            message: "only host role can register plugins.",
          });
          return;
        }

        try {
          const registerResult = await options.pluginLoader.register(
            parsedRequest.value.plugin,
            {
              role: session.role,
              origin: event.origin,
            }
          );

          if (!registerResult.ok) {
            respondError(event, id, method, {
              code: registerResult.code,
              message: registerResult.message,
            });
            return;
          }

          const registerScrubbedPaths: string[] = [];
          const sanitizedRegisterResult = sanitizeJsonValue(
            registerResult.result,
            "result",
            registerScrubbedPaths,
            {
              depth: 0,
              nodes: 0,
              seen: new WeakSet<object>(),
            }
          );
          if (sanitizedRegisterResult === undefined) {
            respondError(event, id, method, {
              code: "non-json-safe-plugin-result",
              message: "plugin registration result is not JSON-safe.",
            });
            return;
          }

          respondSuccess(event, id, method, {
            route: "plugin.register",
            result: sanitizedRegisterResult,
          });
          return;
        } catch (error) {
          respondError(event, id, method, {
            code: "plugin-register-failed",
            message:
              error instanceof Error
                ? error.message
                : "plugin registration failed unexpectedly.",
          });
          return;
        }
      }

      respondError(event, id, method, {
        code: "unsupported-method",
        message: `unsupported method '${method}'.`,
      });
      } catch (error) {
        respondError(event, null, "unknown", {
          code: "gateway-runtime-error",
          message: toErrorMessage(error),
        });
      }
    })();
  });

  return {
    stop: () => {
      unsubscribe();
      sessions.clear();
    },
    getActiveSessions: () => Array.from(sessions.values()),
  };
};
