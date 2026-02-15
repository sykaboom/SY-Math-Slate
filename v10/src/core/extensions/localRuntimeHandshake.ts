export const LOCAL_RUNTIME_HANDSHAKE_PROTOCOL =
  "sy-math-slate:local-runtime-handshake.v1";

export const DEFAULT_LOCAL_RUNTIME_HANDSHAKE_TTL_MS = 5 * 60 * 1000;

const MAX_LOCAL_RUNTIME_HANDSHAKE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_JSON_DEPTH = 8;
const MAX_JSON_NODES = 1024;

type JsonPrimitive = string | number | boolean | null;

export type LocalRuntimeHandshakeJsonValue =
  | JsonPrimitive
  | LocalRuntimeHandshakeJsonValue[]
  | {
      [key: string]: LocalRuntimeHandshakeJsonValue;
    };

export type LocalRuntimeHandshakeJsonObject = {
  [key: string]: LocalRuntimeHandshakeJsonValue;
};

export type LocalRuntimeHandshakeRole = "host" | "student";

export type LocalRuntimeSessionEnvelope = {
  protocol: typeof LOCAL_RUNTIME_HANDSHAKE_PROTOCOL;
  sessionId: string;
  adapterId: string;
  toolId?: string;
  role: LocalRuntimeHandshakeRole;
  issuedAt: number;
  expiresAt: number;
  meta?: LocalRuntimeHandshakeJsonObject;
};

export type CreateLocalRuntimeSessionEnvelopeInput = {
  sessionId: string;
  adapterId: string;
  toolId?: string;
  role: LocalRuntimeHandshakeRole;
  issuedAt?: number;
  ttlMs?: number;
  meta?: Record<string, unknown>;
};

export type LocalRuntimeSessionEnvelopeValidationErrorCode =
  | "invalid-envelope-root"
  | "invalid-envelope-protocol"
  | "invalid-envelope-session-id"
  | "invalid-envelope-adapter-id"
  | "invalid-envelope-tool-id"
  | "invalid-envelope-role"
  | "invalid-envelope-issued-at"
  | "invalid-envelope-expires-at"
  | "invalid-envelope-expiry-window"
  | "invalid-envelope-meta";

export type LocalRuntimeSessionEnvelopeValidationError = {
  ok: false;
  code: LocalRuntimeSessionEnvelopeValidationErrorCode;
  message: string;
  path: string;
};

export type LocalRuntimeSessionEnvelopeValidationSuccess = {
  ok: true;
  value: LocalRuntimeSessionEnvelope;
};

export type LocalRuntimeSessionEnvelopeValidationResult =
  | LocalRuntimeSessionEnvelopeValidationSuccess
  | LocalRuntimeSessionEnvelopeValidationError;

type JsonTraversalState = {
  depth: number;
  nodes: number;
  seen: WeakSet<object>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeNonEmptyString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeTimestamp = (value: unknown, fallback: number): number => {
  if (isFiniteNumber(value)) {
    return Math.floor(value);
  }
  return Math.floor(fallback);
};

const normalizeTtlMs = (value: unknown): number => {
  if (!isFiniteNumber(value)) {
    return DEFAULT_LOCAL_RUNTIME_HANDSHAKE_TTL_MS;
  }
  if (value <= 0) {
    return DEFAULT_LOCAL_RUNTIME_HANDSHAKE_TTL_MS;
  }
  return Math.min(Math.floor(value), MAX_LOCAL_RUNTIME_HANDSHAKE_TTL_MS);
};

const isJsonSafe = (
  value: unknown,
  state: JsonTraversalState = {
    depth: 0,
    nodes: 0,
    seen: new WeakSet<object>(),
  }
): value is LocalRuntimeHandshakeJsonValue => {
  if (state.depth > MAX_JSON_DEPTH || state.nodes > MAX_JSON_NODES) {
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
    for (let index = 0; index < value.length; index += 1) {
      const nextState: JsonTraversalState = {
        depth: state.depth + 1,
        nodes: state.nodes + 1,
        seen: state.seen,
      };
      if (!isJsonSafe(value[index], nextState)) {
        return false;
      }
      state.nodes = nextState.nodes;
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

  for (const entry of Object.values(value)) {
    const nextState: JsonTraversalState = {
      depth: state.depth + 1,
      nodes: state.nodes + 1,
      seen: state.seen,
    };
    if (!isJsonSafe(entry, nextState)) {
      state.seen.delete(value);
      return false;
    }
    state.nodes = nextState.nodes;
  }

  state.seen.delete(value);
  return true;
};

const toJsonSafeValue = (
  value: unknown,
  state: JsonTraversalState
): LocalRuntimeHandshakeJsonValue | undefined => {
  if (state.depth > MAX_JSON_DEPTH || state.nodes > MAX_JSON_NODES) {
    return undefined;
  }

  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (isFiniteNumber(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const next: LocalRuntimeHandshakeJsonValue[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const converted = toJsonSafeValue(value[index], {
        depth: state.depth + 1,
        nodes: state.nodes + 1,
        seen: state.seen,
      });
      next.push(converted ?? null);
    }
    return next;
  }

  if (!isRecord(value)) {
    return undefined;
  }
  if (state.seen.has(value)) {
    return undefined;
  }
  state.seen.add(value);

  const next: LocalRuntimeHandshakeJsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    const converted = toJsonSafeValue(entry, {
      depth: state.depth + 1,
      nodes: state.nodes + 1,
      seen: state.seen,
    });
    if (converted !== undefined) {
      next[key] = converted;
    }
  }

  state.seen.delete(value);
  return next;
};

const toJsonSafeMeta = (
  meta: Record<string, unknown> | undefined
): LocalRuntimeHandshakeJsonObject | undefined => {
  if (!isRecord(meta)) {
    return undefined;
  }
  const converted = toJsonSafeValue(meta, {
    depth: 0,
    nodes: 0,
    seen: new WeakSet<object>(),
  });
  if (!converted || Array.isArray(converted) || !isRecord(converted)) {
    return undefined;
  }
  if (Object.keys(converted).length === 0) {
    return undefined;
  }
  return converted as LocalRuntimeHandshakeJsonObject;
};

const fail = (
  code: LocalRuntimeSessionEnvelopeValidationErrorCode,
  message: string,
  path: string
): LocalRuntimeSessionEnvelopeValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (
  value: LocalRuntimeSessionEnvelope
): LocalRuntimeSessionEnvelopeValidationSuccess => ({
  ok: true,
  value,
});

export const createLocalRuntimeSessionEnvelope = (
  input: CreateLocalRuntimeSessionEnvelopeInput,
  now = Date.now()
): LocalRuntimeSessionEnvelope => {
  const issuedAt = normalizeTimestamp(input.issuedAt, now);
  const ttlMs = normalizeTtlMs(input.ttlMs);
  const expiresAt = issuedAt + ttlMs;
  const normalizedToolId = normalizeNonEmptyString(input.toolId);

  return {
    protocol: LOCAL_RUNTIME_HANDSHAKE_PROTOCOL,
    sessionId: normalizeNonEmptyString(input.sessionId),
    adapterId: normalizeNonEmptyString(input.adapterId),
    toolId: normalizedToolId === "" ? undefined : normalizedToolId,
    role: input.role,
    issuedAt,
    expiresAt,
    meta: toJsonSafeMeta(input.meta),
  };
};

export const validateLocalRuntimeSessionEnvelope = (
  value: unknown
): LocalRuntimeSessionEnvelopeValidationResult => {
  if (!isRecord(value)) {
    return fail(
      "invalid-envelope-root",
      "local runtime session envelope must be an object.",
      "root"
    );
  }
  if (value.protocol !== LOCAL_RUNTIME_HANDSHAKE_PROTOCOL) {
    return fail(
      "invalid-envelope-protocol",
      `protocol must equal '${LOCAL_RUNTIME_HANDSHAKE_PROTOCOL}'.`,
      "protocol"
    );
  }

  const sessionId = normalizeNonEmptyString(value.sessionId);
  if (sessionId === "") {
    return fail(
      "invalid-envelope-session-id",
      "sessionId must be a non-empty string.",
      "sessionId"
    );
  }

  const adapterId = normalizeNonEmptyString(value.adapterId);
  if (adapterId === "") {
    return fail(
      "invalid-envelope-adapter-id",
      "adapterId must be a non-empty string.",
      "adapterId"
    );
  }

  let toolId: string | undefined;
  if ("toolId" in value && value.toolId !== undefined) {
    toolId = normalizeNonEmptyString(value.toolId);
    if (toolId === "") {
      return fail(
        "invalid-envelope-tool-id",
        "toolId must be a non-empty string when provided.",
        "toolId"
      );
    }
  }

  if (value.role !== "host" && value.role !== "student") {
    return fail(
      "invalid-envelope-role",
      "role must be either 'host' or 'student'.",
      "role"
    );
  }

  if (!isFiniteNumber(value.issuedAt)) {
    return fail(
      "invalid-envelope-issued-at",
      "issuedAt must be a finite number.",
      "issuedAt"
    );
  }

  if (!isFiniteNumber(value.expiresAt)) {
    return fail(
      "invalid-envelope-expires-at",
      "expiresAt must be a finite number.",
      "expiresAt"
    );
  }

  const issuedAt = Math.floor(value.issuedAt);
  const expiresAt = Math.floor(value.expiresAt);
  if (expiresAt <= issuedAt) {
    return fail(
      "invalid-envelope-expiry-window",
      "expiresAt must be greater than issuedAt.",
      "expiresAt"
    );
  }

  let meta: LocalRuntimeHandshakeJsonObject | undefined;
  if ("meta" in value && value.meta !== undefined) {
    if (!isRecord(value.meta) || !isJsonSafe(value.meta)) {
      return fail(
        "invalid-envelope-meta",
        "meta must be a JSON-safe object when provided.",
        "meta"
      );
    }
    meta = value.meta as LocalRuntimeHandshakeJsonObject;
  }

  return ok({
    protocol: LOCAL_RUNTIME_HANDSHAKE_PROTOCOL,
    sessionId,
    adapterId,
    toolId,
    role: value.role,
    issuedAt,
    expiresAt,
    meta,
  });
};

export const getLocalRuntimeSessionExpiry = (
  envelope: Pick<LocalRuntimeSessionEnvelope, "expiresAt">,
  now = Date.now()
): { expired: boolean; remainingMs: number } => {
  const current = normalizeTimestamp(now, Date.now());
  const remainingMs = envelope.expiresAt - current;
  return {
    expired: remainingMs <= 0,
    remainingMs: remainingMs > 0 ? remainingMs : 0,
  };
};

export const isLocalRuntimeSessionEnvelopeExpired = (
  envelope: Pick<LocalRuntimeSessionEnvelope, "expiresAt">,
  now = Date.now()
): boolean => getLocalRuntimeSessionExpiry(envelope, now).expired;
