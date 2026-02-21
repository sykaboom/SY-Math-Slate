export type CommandExecutionRole = "host" | "student";

export type AppCommandMutationScope = "doc" | "sync" | "local";

export type AppCommandSchemaDescriptor = {
  type: "object";
  description?: string;
  required?: string[];
  properties: Record<string, unknown>;
  additionalProperties?: boolean;
};

export type AppCommandPayloadValidationSuccess<TPayload> = {
  ok: true;
  value: TPayload;
};

export type AppCommandPayloadValidationFailure = {
  ok: false;
  code: string;
  error: string;
};

export type AppCommandPayloadValidationResult<TPayload> =
  | AppCommandPayloadValidationSuccess<TPayload>
  | AppCommandPayloadValidationFailure;

export type AppCommandDispatchContext = {
  role?: CommandExecutionRole;
  meta?: Record<string, unknown>;
  idempotencyKey?: string;
  idempotencyTtlMs?: number;
};

export type AppCommandExecutionContext = {
  role: CommandExecutionRole;
  commandId: string;
  auditTag: string;
  mutationScope: AppCommandMutationScope;
  meta: Record<string, unknown> | null;
  idempotencyKey?: string;
  idempotencyTtlMs: number;
};

export type AppCommand<TPayload = unknown, TResult = unknown> = {
  id: string;
  description: string;
  mutationScope: AppCommandMutationScope;
  requiresApproval: boolean;
  auditTag: string;
  schema: AppCommandSchemaDescriptor;
  validatePayload: (payload: unknown) => AppCommandPayloadValidationResult<TPayload>;
  execute: (
    payload: TPayload,
    context: AppCommandExecutionContext
  ) => TResult | Promise<TResult>;
};

export type AppCommandMetadata = Pick<
  AppCommand<unknown, unknown>,
  | "id"
  | "description"
  | "mutationScope"
  | "requiresApproval"
  | "auditTag"
  | "schema"
>;

export type RegisterAppCommandResult =
  | { ok: true; replaced: boolean }
  | { ok: false; code: "invalid-command"; error: string };

export type PendingCommandApprovalEntry = {
  commandId: string;
  payload: unknown;
  mutationScope: AppCommandMutationScope;
  auditTag: string;
  idempotencyKey?: string;
  meta: Record<string, unknown> | null;
};

export type CommandExecutionPolicyHooks = {
  getRole?: () => CommandExecutionRole;
  enqueuePendingCommand?: (entry: PendingCommandApprovalEntry) => void;
  shouldQueue?: (entry: PendingCommandApprovalEntry) => boolean;
};

export type CommandAuditEventType =
  | "dispatch-request"
  | "dispatch-invalid-command"
  | "dispatch-invalid-payload"
  | "dispatch-queued-for-approval"
  | "dispatch-approval-required"
  | "dispatch-executed"
  | "dispatch-execution-failed";

export type CommandAuditEvent = {
  eventType: CommandAuditEventType;
  correlationId: string;
  commandId: string;
  role: CommandExecutionRole;
  auditTag?: string;
  mutationScope?: AppCommandMutationScope;
  meta: Record<string, unknown> | null;
  error?: string;
};

export type CommandAuditHooks = {
  emit?: (event: CommandAuditEvent) => void;
};

export type AppCommandDispatchErrorCode =
  | "unknown-command"
  | "invalid-payload"
  | "approval-required"
  | "approval-policy-missing"
  | "approval-queue-failed"
  | "command-execution-failed";

export type AppCommandDispatchSuccess<TResult = unknown> = {
  ok: true;
  code: "executed";
  commandId: string;
  auditTag: string;
  idempotencyKey?: string;
  deduped?: boolean;
  result: TResult;
};

export type AppCommandDispatchFailure = {
  ok: false;
  code: AppCommandDispatchErrorCode;
  commandId: string;
  auditTag?: string;
  idempotencyKey?: string;
  deduped?: boolean;
  error: string;
};

export type AppCommandDispatchResult<TResult = unknown> =
  | AppCommandDispatchSuccess<TResult>
  | AppCommandDispatchFailure;

type AppCommandRegistry = Map<string, AppCommand<unknown, unknown>>;

type IdempotencyCacheEntry = {
  expiresAt: number;
  result: AppCommandDispatchResult<unknown>;
};

const DEFAULT_IDEMPOTENCY_TTL_MS = 60_000;
const MAX_IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const VALID_MUTATION_SCOPES = new Set<AppCommandMutationScope>([
  "doc",
  "sync",
  "local",
]);
const APPROVAL_REQUIRED_ERROR =
  "approval required: student command execution must be approved by host.";

const appCommandRegistry: AppCommandRegistry = new Map();
const idempotencyCache = new Map<string, IdempotencyCacheEntry>();

let commandExecutionPolicyHooks: CommandExecutionPolicyHooks | null = null;
let commandAuditHooks: CommandAuditHooks | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeCommandId = (commandId: string): string =>
  typeof commandId === "string" ? commandId.trim() : "";

const normalizeIdempotencyKey = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeIdempotencyTtlMs = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_IDEMPOTENCY_TTL_MS;
  }
  return Math.min(Math.floor(value), MAX_IDEMPOTENCY_TTL_MS);
};

const normalizeMeta = (value: unknown): Record<string, unknown> | null => {
  if (!isRecord(value)) return null;
  return { ...value };
};

const toMetadata = (
  command: AppCommand<unknown, unknown>
): AppCommandMetadata => ({
  id: command.id,
  description: command.description,
  mutationScope: command.mutationScope,
  requiresApproval: command.requiresApproval,
  auditTag: command.auditTag,
  schema: command.schema,
});

const buildIdempotencyCacheKey = (
  commandId: string,
  role: CommandExecutionRole,
  idempotencyKey?: string
): string | null => {
  if (!idempotencyKey) return null;
  if (!commandId) return null;
  return `${commandId}:${role}:${idempotencyKey}`;
};

const pruneIdempotencyCache = (now: number): void => {
  for (const [key, entry] of idempotencyCache.entries()) {
    if (entry.expiresAt <= now) {
      idempotencyCache.delete(key);
    }
  }
};

const resolveIdempotencyCache = <TResult>(
  cacheKey: string | null,
  now: number
): AppCommandDispatchResult<TResult> | null => {
  if (!cacheKey) return null;
  const cached = idempotencyCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt <= now) {
    idempotencyCache.delete(cacheKey);
    return null;
  }
  return {
    ...(cached.result as AppCommandDispatchResult<TResult>),
    deduped: true,
  };
};

const storeIdempotencyResult = (
  cacheKey: string | null,
  ttlMs: number,
  now: number,
  result: AppCommandDispatchResult<unknown>
): void => {
  if (!cacheKey) return;
  idempotencyCache.set(cacheKey, {
    expiresAt: now + ttlMs,
    result,
  });
};

const failDispatch = (
  code: AppCommandDispatchErrorCode,
  error: string,
  commandId: string,
  auditTag?: string,
  idempotencyKey?: string
): AppCommandDispatchFailure => ({
  ok: false,
  code,
  error,
  commandId,
  ...(auditTag ? { auditTag } : {}),
  ...(idempotencyKey ? { idempotencyKey } : {}),
});

const resolveRole = (contextRole?: CommandExecutionRole): CommandExecutionRole => {
  if (contextRole === "host" || contextRole === "student") {
    return contextRole;
  }
  const fromHooks = commandExecutionPolicyHooks?.getRole?.();
  if (fromHooks === "host" || fromHooks === "student") {
    return fromHooks;
  }
  return "host";
};

const safeValidatePayload = (
  command: AppCommand<unknown, unknown>,
  payload: unknown
): AppCommandPayloadValidationResult<unknown> => {
  try {
    return command.validatePayload(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "payload validator threw.";
    return {
      ok: false,
      code: "validator-threw",
      error: message,
    };
  }
};

const validateCommandDefinition = (
  command: AppCommand<unknown, unknown>
): string | null => {
  if (!command || typeof command !== "object") {
    return "command definition must be an object.";
  }
  if (typeof command.id !== "string" || command.id.trim().length === 0) {
    return "command.id must be a non-empty string.";
  }
  if (
    typeof command.description !== "string" ||
    command.description.trim().length === 0
  ) {
    return "command.description must be a non-empty string.";
  }
  if (!VALID_MUTATION_SCOPES.has(command.mutationScope)) {
    return "command.mutationScope must be one of doc/sync/local.";
  }
  if (typeof command.requiresApproval !== "boolean") {
    return "command.requiresApproval must be a boolean.";
  }
  if (
    typeof command.auditTag !== "string" ||
    command.auditTag.trim().length === 0
  ) {
    return "command.auditTag must be a non-empty string.";
  }
  if (!isRecord(command.schema) || command.schema.type !== "object") {
    return "command.schema must be an object schema descriptor.";
  }
  if (typeof command.validatePayload !== "function") {
    return "command.validatePayload must be a function.";
  }
  if (typeof command.execute !== "function") {
    return "command.execute must be a function.";
  }
  return null;
};

const maybeQueuePendingApproval = (
  pendingEntry: PendingCommandApprovalEntry,
  commandId: string,
  auditTag: string,
  idempotencyKey?: string
): AppCommandDispatchFailure | null => {
  const hooks = commandExecutionPolicyHooks;
  if (!hooks?.enqueuePendingCommand) {
    return failDispatch(
      "approval-policy-missing",
      "approval policy hook missing: enqueuePendingCommand.",
      commandId,
      auditTag,
      idempotencyKey
    );
  }

  const shouldQueue = hooks.shouldQueue?.(pendingEntry) ?? true;
  if (!shouldQueue) {
    return null;
  }

  try {
    hooks.enqueuePendingCommand(pendingEntry);
    return null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown queueing failure";
    return failDispatch(
      "approval-queue-failed",
      `failed to enqueue pending command approval: ${message}`,
      commandId,
      auditTag,
      idempotencyKey
    );
  }
};

export const configureCommandExecutionPolicyHooks = (
  hooks: CommandExecutionPolicyHooks
): void => {
  commandExecutionPolicyHooks = hooks;
};

export const resetCommandExecutionPolicyHooks = (): void => {
  commandExecutionPolicyHooks = null;
};

export const configureCommandAuditHooks = (hooks: CommandAuditHooks): void => {
  commandAuditHooks = hooks;
};

export const resetCommandAuditHooks = (): void => {
  commandAuditHooks = null;
};

export const registerAppCommand = (
  command: AppCommand<unknown, unknown>
): RegisterAppCommandResult => {
  const validationError = validateCommandDefinition(command);
  if (validationError) {
    return {
      ok: false,
      code: "invalid-command",
      error: validationError,
    };
  }

  const normalized: AppCommand<unknown, unknown> = {
    ...command,
    id: command.id.trim(),
    description: command.description.trim(),
    auditTag: command.auditTag.trim(),
    schema: { ...command.schema },
  };

  const replaced = appCommandRegistry.has(normalized.id);
  appCommandRegistry.set(normalized.id, normalized);
  return { ok: true, replaced };
};

export const listAppCommands = (): AppCommandMetadata[] =>
  Array.from(appCommandRegistry.values())
    .map((command) => toMetadata(command))
    .sort((a, b) => a.id.localeCompare(b.id));

export const getAppCommandById = (
  commandId: string
): AppCommand<unknown, unknown> | null =>
  appCommandRegistry.get(normalizeCommandId(commandId)) ?? null;

export const clearAppCommands = (): void => {
  appCommandRegistry.clear();
  idempotencyCache.clear();
};

export const clearCommandIdempotencyCache = (): void => {
  idempotencyCache.clear();
};

export const dispatchCommand = async <TResult = unknown>(
  commandId: string,
  payload: unknown,
  context: AppCommandDispatchContext = {}
): Promise<AppCommandDispatchResult<TResult>> => {
  const now = Date.now();
  pruneIdempotencyCache(now);

  const normalizedCommandId = normalizeCommandId(commandId);
  const normalizedIdempotencyKey = normalizeIdempotencyKey(context.idempotencyKey);
  const ttlMs = normalizeIdempotencyTtlMs(context.idempotencyTtlMs);
  const role = resolveRole(context.role);
  const correlationId =
    normalizedIdempotencyKey ??
    `cmd-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const emitAudit = (event: Omit<CommandAuditEvent, "correlationId">): void => {
    try {
      commandAuditHooks?.emit?.({
        ...event,
        correlationId,
      });
    } catch {
      return;
    }
  };
  const cacheKey = buildIdempotencyCacheKey(
    normalizedCommandId,
    role,
    normalizedIdempotencyKey
  );

  const cached = resolveIdempotencyCache<TResult>(cacheKey, now);
  if (cached) {
    return cached;
  }

  emitAudit({
    eventType: "dispatch-request",
    commandId: normalizedCommandId || commandId || "(empty)",
    role,
    meta: normalizeMeta(context.meta),
  });

  if (!normalizedCommandId) {
    const failed = failDispatch(
      "unknown-command",
      "commandId must be a non-empty string.",
      commandId || "(empty)",
      undefined,
      normalizedIdempotencyKey
    );
    storeIdempotencyResult(cacheKey, ttlMs, now, failed);
    emitAudit({
      eventType: "dispatch-invalid-command",
      commandId: commandId || "(empty)",
      role,
      meta: normalizeMeta(context.meta),
      error: failed.error,
    });
    return failed;
  }

  const command = getAppCommandById(normalizedCommandId);
  if (!command) {
    const failed = failDispatch(
      "unknown-command",
      `command '${normalizedCommandId}' is not registered.`,
      normalizedCommandId,
      undefined,
      normalizedIdempotencyKey
    );
    storeIdempotencyResult(cacheKey, ttlMs, now, failed);
    emitAudit({
      eventType: "dispatch-invalid-command",
      commandId: normalizedCommandId,
      role,
      meta: normalizeMeta(context.meta),
      error: failed.error,
    });
    return failed;
  }

  const validatedPayload = safeValidatePayload(command, payload);
  if (!validatedPayload.ok) {
    const failed = failDispatch(
      "invalid-payload",
      `payload validation failed: ${validatedPayload.code} (${validatedPayload.error})`,
      normalizedCommandId,
      command.auditTag,
      normalizedIdempotencyKey
    );
    storeIdempotencyResult(cacheKey, ttlMs, now, failed);
    emitAudit({
      eventType: "dispatch-invalid-payload",
      commandId: normalizedCommandId,
      role,
      auditTag: command.auditTag,
      mutationScope: command.mutationScope,
      meta: normalizeMeta(context.meta),
      error: failed.error,
    });
    return failed;
  }

  const normalizedMeta = normalizeMeta(context.meta);
  const executionContext: AppCommandExecutionContext = {
    role,
    commandId: normalizedCommandId,
    auditTag: command.auditTag,
    mutationScope: command.mutationScope,
    meta: normalizedMeta,
    idempotencyKey: normalizedIdempotencyKey,
    idempotencyTtlMs: ttlMs,
  };

  if (role === "student" && command.requiresApproval) {
    const pendingEntry: PendingCommandApprovalEntry = {
      commandId: normalizedCommandId,
      payload: validatedPayload.value,
      mutationScope: command.mutationScope,
      auditTag: command.auditTag,
      idempotencyKey: normalizedIdempotencyKey,
      meta: normalizedMeta,
    };

    const queueFailure = maybeQueuePendingApproval(
      pendingEntry,
      normalizedCommandId,
      command.auditTag,
      normalizedIdempotencyKey
    );
    if (queueFailure) {
      storeIdempotencyResult(cacheKey, ttlMs, now, queueFailure);
      emitAudit({
        eventType: "dispatch-execution-failed",
        commandId: normalizedCommandId,
        role,
        auditTag: command.auditTag,
        mutationScope: command.mutationScope,
        meta: normalizedMeta,
        error: queueFailure.error,
      });
      return queueFailure;
    }

    emitAudit({
      eventType: "dispatch-queued-for-approval",
      commandId: normalizedCommandId,
      role,
      auditTag: command.auditTag,
      mutationScope: command.mutationScope,
      meta: normalizedMeta,
    });

    const approvalRequired = failDispatch(
      "approval-required",
      APPROVAL_REQUIRED_ERROR,
      normalizedCommandId,
      command.auditTag,
      normalizedIdempotencyKey
    );
    storeIdempotencyResult(cacheKey, ttlMs, now, approvalRequired);
    emitAudit({
      eventType: "dispatch-approval-required",
      commandId: normalizedCommandId,
      role,
      auditTag: command.auditTag,
      mutationScope: command.mutationScope,
      meta: normalizedMeta,
      error: approvalRequired.error,
    });
    return approvalRequired;
  }

  try {
    const executionResult = await command.execute(
      validatedPayload.value,
      executionContext
    );
    const succeeded: AppCommandDispatchSuccess<TResult> = {
      ok: true,
      code: "executed",
      commandId: normalizedCommandId,
      auditTag: command.auditTag,
      ...(normalizedIdempotencyKey ? { idempotencyKey: normalizedIdempotencyKey } : {}),
      result: executionResult as TResult,
    };
    storeIdempotencyResult(cacheKey, ttlMs, now, succeeded);
    emitAudit({
      eventType: "dispatch-executed",
      commandId: normalizedCommandId,
      role,
      auditTag: command.auditTag,
      mutationScope: command.mutationScope,
      meta: normalizedMeta,
    });
    return succeeded;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown failure";
    const failed = failDispatch(
      "command-execution-failed",
      `command '${normalizedCommandId}' execution failed: ${message}`,
      normalizedCommandId,
      command.auditTag,
      normalizedIdempotencyKey
    );
    storeIdempotencyResult(cacheKey, ttlMs, now, failed);
    emitAudit({
      eventType: "dispatch-execution-failed",
      commandId: normalizedCommandId,
      role,
      auditTag: command.auditTag,
      mutationScope: command.mutationScope,
      meta: normalizedMeta,
      error: failed.error,
    });
    return failed;
  }
};

export const commandBus = {
  register: registerAppCommand,
  list: listAppCommands,
  get: getAppCommandById,
  clear: clearAppCommands,
  dispatch: dispatchCommand,
  clearIdempotencyCache: clearCommandIdempotencyCache,
};

export const register = registerAppCommand;
export const list = listAppCommands;
export const get = getAppCommandById;
export const clear = clearAppCommands;
export const dispatch = dispatchCommand;
