import {
  configureCommandAuditHooks,
  resetCommandAuditHooks,
  type CommandAuditEvent,
} from "@core/engine/commandBus";

export type AuditEvent = {
  timestamp: number;
  channel: "command" | "policy" | "approval" | "publish";
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
