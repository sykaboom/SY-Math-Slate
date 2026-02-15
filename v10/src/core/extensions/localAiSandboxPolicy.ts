import {
  isLocalRuntimeSessionEnvelopeExpired,
  type LocalRuntimeHandshakeRole,
  type LocalRuntimeSessionEnvelope,
  validateLocalRuntimeSessionEnvelope,
} from "./localRuntimeHandshake";

export const DEFAULT_LOCAL_AI_SANDBOX_ADAPTER_PREFIXES = [
  "local.",
  "local:",
  "local/",
] as const;

export type LocalAiSandboxAllowCode =
  | "sandbox-allowed"
  | "sandbox-allowed-non-local-adapter";

export type LocalAiSandboxDenyCode =
  | "sandbox-denied-invalid-adapter-id"
  | "sandbox-denied-invalid-tool-id"
  | "sandbox-denied-missing-handshake"
  | "sandbox-denied-invalid-handshake"
  | "sandbox-denied-expired-handshake"
  | "sandbox-denied-adapter-mismatch"
  | "sandbox-denied-tool-mismatch"
  | "sandbox-denied-role-mismatch";

export type LocalAiSandboxDecisionCode =
  | LocalAiSandboxAllowCode
  | LocalAiSandboxDenyCode;

export type LocalAiSandboxAllowDecision = {
  ok: true;
  decision: "allow";
  code: LocalAiSandboxAllowCode;
  adapterId: string;
  toolId: string;
  requiresHandshake: boolean;
  handshakeSessionId: string | null;
};

export type LocalAiSandboxDenyDecision = {
  ok: false;
  decision: "deny";
  code: LocalAiSandboxDenyCode;
  adapterId: string;
  toolId: string;
  requiresHandshake: true;
  handshakeSessionId: string | null;
  error: string;
};

export type LocalAiSandboxDecision =
  | LocalAiSandboxAllowDecision
  | LocalAiSandboxDenyDecision;

export type EvaluateLocalAiSandboxPolicyInput = {
  adapterId: string;
  toolId: string;
  role?: LocalRuntimeHandshakeRole;
  meta?: Record<string, unknown>;
  handshakeSession?: unknown;
};

export type EvaluateLocalAiSandboxPolicyOptions = {
  now?: number;
  localAdapterPrefixes?: readonly string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeNonEmptyString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const resolveLocalAdapterPrefixes = (
  customPrefixes?: readonly string[]
): string[] => {
  const source = customPrefixes ?? DEFAULT_LOCAL_AI_SANDBOX_ADAPTER_PREFIXES;
  const normalized = source
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
  if (normalized.length > 0) {
    return normalized;
  }
  return [...DEFAULT_LOCAL_AI_SANDBOX_ADAPTER_PREFIXES];
};

const normalizeTimestamp = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.floor(value)
    : Date.now();

const allow = (
  code: LocalAiSandboxAllowCode,
  adapterId: string,
  toolId: string,
  requiresHandshake: boolean,
  handshakeSessionId: string | null
): LocalAiSandboxAllowDecision => ({
  ok: true,
  decision: "allow",
  code,
  adapterId,
  toolId,
  requiresHandshake,
  handshakeSessionId,
});

const deny = (
  code: LocalAiSandboxDenyCode,
  adapterId: string,
  toolId: string,
  message: string,
  handshakeSessionId: string | null = null
): LocalAiSandboxDenyDecision => ({
  ok: false,
  decision: "deny",
  code,
  adapterId,
  toolId,
  requiresHandshake: true,
  handshakeSessionId,
  error: message,
});

const resolveHandshakeCandidate = (
  input: EvaluateLocalAiSandboxPolicyInput
): unknown => {
  if (input.handshakeSession !== undefined) {
    return input.handshakeSession;
  }
  if (!isRecord(input.meta)) {
    return undefined;
  }

  if ("localRuntimeHandshake" in input.meta) {
    return input.meta.localRuntimeHandshake;
  }
  if ("localRuntimeSession" in input.meta) {
    return input.meta.localRuntimeSession;
  }
  if ("handshakeSession" in input.meta) {
    return input.meta.handshakeSession;
  }
  return undefined;
};

const ensureRoleMatch = (
  expectedRole: LocalRuntimeHandshakeRole | undefined,
  session: LocalRuntimeSessionEnvelope
): LocalAiSandboxDenyDecision | null => {
  if (!expectedRole) return null;
  if (session.role === expectedRole) return null;
  return deny(
    "sandbox-denied-role-mismatch",
    session.adapterId,
    session.toolId ?? "unknown-tool",
    `handshake role '${session.role}' does not match request role '${expectedRole}'.`,
    session.sessionId
  );
};

export const isLocalAiSandboxAdapterId = (
  adapterId: string,
  localAdapterPrefixes?: readonly string[]
): boolean => {
  const normalizedAdapterId = normalizeNonEmptyString(adapterId);
  if (normalizedAdapterId === "") {
    return false;
  }
  const prefixes = resolveLocalAdapterPrefixes(localAdapterPrefixes);
  return prefixes.some((prefix) => normalizedAdapterId.startsWith(prefix));
};

export const evaluateLocalAiSandboxPolicy = (
  input: EvaluateLocalAiSandboxPolicyInput,
  options: EvaluateLocalAiSandboxPolicyOptions = {}
): LocalAiSandboxDecision => {
  const adapterId = normalizeNonEmptyString(input.adapterId);
  const toolId = normalizeNonEmptyString(input.toolId);

  if (adapterId === "") {
    return deny(
      "sandbox-denied-invalid-adapter-id",
      adapterId,
      toolId,
      "adapterId must be a non-empty string."
    );
  }
  if (toolId === "") {
    return deny(
      "sandbox-denied-invalid-tool-id",
      adapterId,
      toolId,
      "toolId must be a non-empty string."
    );
  }

  const requiresHandshake = isLocalAiSandboxAdapterId(
    adapterId,
    options.localAdapterPrefixes
  );
  if (!requiresHandshake) {
    return allow(
      "sandbox-allowed-non-local-adapter",
      adapterId,
      toolId,
      false,
      null
    );
  }

  const handshakeCandidate = resolveHandshakeCandidate(input);
  if (handshakeCandidate === undefined || handshakeCandidate === null) {
    return deny(
      "sandbox-denied-missing-handshake",
      adapterId,
      toolId,
      "local adapter execution requires a valid local runtime handshake."
    );
  }

  const validated = validateLocalRuntimeSessionEnvelope(handshakeCandidate);
  if (!validated.ok) {
    return deny(
      "sandbox-denied-invalid-handshake",
      adapterId,
      toolId,
      `invalid local runtime handshake envelope: ${validated.code} (${validated.path}).`
    );
  }

  const handshakeSessionId = validated.value.sessionId;
  const now = normalizeTimestamp(options.now);
  if (isLocalRuntimeSessionEnvelopeExpired(validated.value, now)) {
    return deny(
      "sandbox-denied-expired-handshake",
      adapterId,
      toolId,
      "local runtime handshake session is expired.",
      handshakeSessionId
    );
  }

  if (validated.value.adapterId !== adapterId) {
    return deny(
      "sandbox-denied-adapter-mismatch",
      adapterId,
      toolId,
      `handshake adapterId '${validated.value.adapterId}' does not match requested adapter '${adapterId}'.`,
      handshakeSessionId
    );
  }

  if (
    validated.value.toolId !== undefined &&
    validated.value.toolId !== toolId
  ) {
    return deny(
      "sandbox-denied-tool-mismatch",
      adapterId,
      toolId,
      `handshake toolId '${validated.value.toolId}' does not match requested tool '${toolId}'.`,
      handshakeSessionId
    );
  }

  const roleMismatch = ensureRoleMatch(input.role, validated.value);
  if (roleMismatch) {
    return {
      ...roleMismatch,
      adapterId,
      toolId,
      handshakeSessionId,
    };
  }

  return allow("sandbox-allowed", adapterId, toolId, true, handshakeSessionId);
};
