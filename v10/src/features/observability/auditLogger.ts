import {
  configureCommandAuditHooks,
  resetCommandAuditHooks,
  type CommandAuditEvent,
} from "@core/runtime/command/commandBus";

export type AuditEvent = {
  timestamp: number;
  channel:
    | "command"
    | "policy"
    | "approval"
    | "publish"
    | "extension"
    | "moderation";
  eventType: string;
  correlationId: string;
  payload: Record<string, unknown>;
};

const SECRET_LIKE_KEYS = new Set([
  "token",
  "password",
  "secret",
  "authorization",
  "cookie",
  "credentials",
]);

const auditEventBuffer: AuditEvent[] = [];
const auditEventListeners = new Set<(event: AuditEvent) => void>();
const MAX_AUDIT_EVENTS = 500;
const MAX_JSON_DEPTH = 6;
const MAX_JSON_ARRAY_LENGTH = 24;
const MAX_JSON_OBJECT_KEYS = 40;
const MAX_JSON_STRING_LENGTH = 400;

const shouldEnableAuditLog = (): boolean =>
  process.env.NEXT_PUBLIC_AUDIT_LOG === "1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const redactObject = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((entry) => redactObject(entry));
  if (!isRecord(value)) return value;
  const next: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, entry]) => {
    const normalized = key.toLowerCase();
    if (SECRET_LIKE_KEYS.has(normalized)) {
      next[key] = "[REDACTED]";
      return;
    }
    next[key] = redactObject(entry);
  });
  return next;
};

const toJsonSafeAuditValue = (value: unknown, depth = 0): unknown => {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number"
  ) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      return null;
    }
    if (typeof value === "string" && value.length > MAX_JSON_STRING_LENGTH) {
      return `${value.slice(0, MAX_JSON_STRING_LENGTH)}...[TRUNCATED]`;
    }
    return value;
  }

  if (depth >= MAX_JSON_DEPTH) {
    return "[TRUNCATED_DEPTH]";
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_JSON_ARRAY_LENGTH)
      .map((entry) => toJsonSafeAuditValue(entry, depth + 1));
  }

  if (!isRecord(value)) {
    return String(value);
  }

  const next: Record<string, unknown> = {};
  const entries = Object.entries(value).slice(0, MAX_JSON_OBJECT_KEYS);
  entries.forEach(([key, entry]) => {
    next[key] = toJsonSafeAuditValue(entry, depth + 1);
  });
  return next;
};

const toJsonSafeAuditPayload = (
  payload: Record<string, unknown>
): Record<string, unknown> =>
  toJsonSafeAuditValue(payload) as Record<string, unknown>;

const pushAuditEvent = (event: AuditEvent): void => {
  auditEventBuffer.push(event);
  while (auditEventBuffer.length > MAX_AUDIT_EVENTS) {
    auditEventBuffer.shift();
  }
  auditEventListeners.forEach((listener) => listener(event));
};

export const emitAuditEvent = (
  channel: AuditEvent["channel"],
  eventType: string,
  correlationId: string,
  payload: Record<string, unknown>
): void => {
  if (!shouldEnableAuditLog()) return;
  const event: AuditEvent = {
    timestamp: Date.now(),
    channel,
    eventType,
    correlationId,
    payload: redactObject(payload) as Record<string, unknown>,
  };
  pushAuditEvent(event);
};

export type AdapterRegistrationAuditPayload = {
  adapterId: string;
  supports: string[];
  source: string;
};

export type AdapterRoutingDecisionAuditPayload = {
  toolId: string;
  selectedAdapterId: string | null;
  fallbackUsed: boolean;
  reason: string;
  candidateCount: number;
  rankedCandidates: Array<{
    adapterId: string;
    eligible: boolean;
    capabilityScore: number;
    estimatedCostUsd: number;
    estimatedLatencyMs: number;
    rejectionReason?: string;
  }>;
};

export type AdapterExecutionResultAuditPayload = {
  toolId: string;
  requestedAdapterId: string;
  selectedAdapterId: string | null;
  ok: boolean;
  status?: string;
  code?: string;
  error?: string;
  latencyMs?: number;
  costUsd?: number;
  warnings?: string[];
};

export type AdapterSandboxDecisionAuditPayload = {
  toolId: string;
  adapterId: string;
  role?: string;
  decision: "allow" | "deny";
  code: string;
  reason: string;
  handshakeSessionId?: string | null;
  handshakeValid?: boolean | null;
  meta?: Record<string, unknown> | null;
};

export type ModerationDecisionAuditPayload = {
  reportId: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  reporterId: string;
  decision: "approve" | "reject";
  status: "approved" | "rejected";
  moderatorId: string;
  moderationNote?: string | null;
};

const toSafeSupports = (supports: string[]): string[] =>
  supports
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item !== "");

export const emitAdapterRegistrationAuditEvent = (
  payload: AdapterRegistrationAuditPayload
): void => {
  emitAuditEvent(
    "extension",
    "adapter-registration",
    `adapter-registration:${payload.adapterId}:${Date.now()}`,
    toJsonSafeAuditPayload({
      adapterId: payload.adapterId,
      supports: toSafeSupports(payload.supports),
      source: payload.source,
    })
  );
};

export const emitAdapterRoutingDecisionAuditEvent = (
  payload: AdapterRoutingDecisionAuditPayload
): void => {
  emitAuditEvent(
    "extension",
    "adapter-routing-decision",
    `adapter-routing:${payload.toolId}:${Date.now()}`,
    toJsonSafeAuditPayload({
      toolId: payload.toolId,
      selectedAdapterId: payload.selectedAdapterId,
      fallbackUsed: payload.fallbackUsed,
      reason: payload.reason,
      candidateCount: payload.candidateCount,
      rankedCandidates: payload.rankedCandidates,
    })
  );
};

export const emitAdapterExecutionResultAuditEvent = (
  payload: AdapterExecutionResultAuditPayload
): void => {
  emitAuditEvent(
    "extension",
    "adapter-execution-result",
    `adapter-execution:${payload.toolId}:${Date.now()}`,
    toJsonSafeAuditPayload({
      toolId: payload.toolId,
      requestedAdapterId: payload.requestedAdapterId,
      selectedAdapterId: payload.selectedAdapterId,
      ok: payload.ok,
      status: payload.status ?? null,
      code: payload.code ?? null,
      error: payload.error ?? null,
      latencyMs: payload.latencyMs ?? null,
      costUsd: payload.costUsd ?? null,
      warnings: payload.warnings ?? [],
    })
  );
};

export const emitAdapterSandboxDecisionAuditEvent = (
  payload: AdapterSandboxDecisionAuditPayload
): void => {
  emitAuditEvent(
    "extension",
    "adapter-sandbox-decision",
    `adapter-sandbox:${payload.toolId}:${payload.adapterId}:${Date.now()}`,
    toJsonSafeAuditPayload({
      toolId: payload.toolId,
      adapterId: payload.adapterId,
      role: payload.role ?? null,
      decision: payload.decision,
      code: payload.code,
      reason: payload.reason,
      handshakeSessionId: payload.handshakeSessionId ?? null,
      handshakeValid: payload.handshakeValid ?? null,
      meta: payload.meta ?? null,
    })
  );
};

export const emitModerationDecisionAuditEvent = (
  payload: ModerationDecisionAuditPayload
): void => {
  emitAuditEvent(
    "moderation",
    "moderation-decision",
    `moderation:${payload.reportId}:${payload.decision}:${Date.now()}`,
    toJsonSafeAuditPayload({
      reportId: payload.reportId,
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: payload.reason,
      reporterId: payload.reporterId,
      decision: payload.decision,
      status: payload.status,
      moderatorId: payload.moderatorId,
      moderationNote: payload.moderationNote ?? null,
    })
  );
};

export const listAuditEvents = (): AuditEvent[] => [...auditEventBuffer];

export const subscribeAuditEvents = (
  listener: (event: AuditEvent) => void
): (() => void) => {
  auditEventListeners.add(listener);
  return () => {
    auditEventListeners.delete(listener);
  };
};

const toCommandAuditPayload = (event: CommandAuditEvent): Record<string, unknown> => ({
  commandId: event.commandId,
  role: event.role,
  auditTag: event.auditTag ?? null,
  mutationScope: event.mutationScope ?? null,
  meta: event.meta ?? null,
  error: event.error ?? null,
});

export const registerObservabilityRuntime = (): void => {
  configureCommandAuditHooks({
    emit: (event) => {
      emitAuditEvent(
        "command",
        event.eventType,
        event.correlationId,
        toCommandAuditPayload(event)
      );
    },
  });
};

export const resetObservabilityRuntime = (): void => {
  resetCommandAuditHooks();
};
