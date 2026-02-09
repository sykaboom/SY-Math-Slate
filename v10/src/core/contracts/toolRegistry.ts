export type ToolRegistryCategory =
  | "llm"
  | "tts"
  | "renderer"
  | "transformer"
  | "validator";

export type ToolSchemaDescriptor = Record<string, unknown>;

export type ToolRegistryCapabilities = {
  locales?: string[];
  mediaTypes?: string[];
  maxInputTokens?: number;
  maxOutputTokens?: number;
  maxAssetBytes?: number;
  [key: string]: unknown;
};

export type ToolRegistryExecution = {
  mcpServerId?: string;
  endpointRef?: string;
  localRuntimeId?: string;
};

export type ToolRegistryPolicy = {
  timeoutMs: number;
  rateLimitPerMin?: number;
  costTier?: string;
  trustLevel: string;
  [key: string]: unknown;
};

export type ToolRegistryEntry = {
  toolId: string;
  category: ToolRegistryCategory;
  inputSchema: ToolSchemaDescriptor;
  outputSchema: ToolSchemaDescriptor;
  capabilities: ToolRegistryCapabilities;
  execution: ToolRegistryExecution;
  policy: ToolRegistryPolicy;
};

export type ToolRegistryValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type ToolRegistryValidationSuccess = {
  ok: true;
  value: ToolRegistryEntry;
};

export type ToolRegistryValidationResult =
  | ToolRegistryValidationError
  | ToolRegistryValidationSuccess;

const TOOL_CATEGORIES = new Set<ToolRegistryCategory>([
  "llm",
  "tts",
  "renderer",
  "transformer",
  "validator",
]);

const SECRET_LIKE_KEYS = new Set([
  "apikey",
  "api_key",
  "secret",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "token",
]);

const fail = (
  code: string,
  message: string,
  path: string
): ToolRegistryValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (value: ToolRegistryEntry): ToolRegistryValidationSuccess => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isJsonSafe = (value: unknown): boolean => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return Number.isFinite(value as number) || typeof value !== "number";
  }
  if (Array.isArray(value)) {
    return value.every((item) => isJsonSafe(item));
  }
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every((entry) => isJsonSafe(entry));
};

const findForbiddenSecretKeyPath = (
  value: unknown,
  path = "root"
): string | null => {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const childPath = findForbiddenSecretKeyPath(value[index], `${path}[${index}]`);
      if (childPath) return childPath;
    }
    return null;
  }
  if (!isRecord(value)) return null;

  for (const [key, child] of Object.entries(value)) {
    const normalizedKey = key.replace(/[\s-]/g, "").toLowerCase();
    if (SECRET_LIKE_KEYS.has(normalizedKey)) {
      return `${path}.${key}`;
    }
    const childPath = findForbiddenSecretKeyPath(child, `${path}.${key}`);
    if (childPath) return childPath;
  }
  return null;
};

const validateExecution = (
  value: unknown
): ToolRegistryValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-execution", "execution must be an object.", "execution");
  }

  const executionKeyValues: Array<[keyof ToolRegistryExecution, unknown]> = [
    ["mcpServerId", value.mcpServerId],
    ["endpointRef", value.endpointRef],
    ["localRuntimeId", value.localRuntimeId],
  ];

  let definedCount = 0;
  for (const [key, candidate] of executionKeyValues) {
    if (candidate === undefined) continue;
    definedCount += 1;
    if (typeof candidate !== "string" || candidate.trim() === "") {
      return fail(
        "invalid-execution-field",
        `${key} must be a non-empty string when provided.`,
        `execution.${key}`
      );
    }
  }

  if (definedCount < 1) {
    return fail(
      "missing-execution-target",
      "execution must define at least one of mcpServerId/endpointRef/localRuntimeId.",
      "execution"
    );
  }

  return ok({
    toolId: "tmp",
    category: "validator",
    inputSchema: {},
    outputSchema: {},
    capabilities: {},
    execution: value as ToolRegistryExecution,
    policy: { timeoutMs: 1000, trustLevel: "sandbox" },
  });
};

const validatePolicy = (value: unknown): ToolRegistryValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-policy", "policy must be an object.", "policy");
  }

  if (!isFiniteNonNegativeNumber(value.timeoutMs) || value.timeoutMs === 0) {
    return fail(
      "invalid-policy-timeout",
      "policy.timeoutMs must be a positive number.",
      "policy.timeoutMs"
    );
  }

  if (
    value.rateLimitPerMin !== undefined &&
    !isFiniteNonNegativeNumber(value.rateLimitPerMin)
  ) {
    return fail(
      "invalid-policy-rate-limit",
      "policy.rateLimitPerMin must be a non-negative number when provided.",
      "policy.rateLimitPerMin"
    );
  }

  if (value.costTier !== undefined && typeof value.costTier !== "string") {
    return fail(
      "invalid-policy-cost-tier",
      "policy.costTier must be a string when provided.",
      "policy.costTier"
    );
  }

  if (typeof value.trustLevel !== "string" || value.trustLevel.trim() === "") {
    return fail(
      "invalid-policy-trust-level",
      "policy.trustLevel must be a non-empty string.",
      "policy.trustLevel"
    );
  }

  if (!isJsonSafe(value)) {
    return fail(
      "invalid-policy-json-safe",
      "policy must contain JSON-safe values only.",
      "policy"
    );
  }

  return ok({
    toolId: "tmp",
    category: "validator",
    inputSchema: {},
    outputSchema: {},
    capabilities: {},
    execution: { localRuntimeId: "tmp" },
    policy: value as ToolRegistryPolicy,
  });
};

export const validateToolRegistryEntry = (
  value: unknown
): ToolRegistryValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-root", "Tool registry entry must be an object.", "root");
  }

  const forbiddenPath = findForbiddenSecretKeyPath(value);
  if (forbiddenPath) {
    return fail(
      "forbidden-secret-field",
      "Secrets/tokens must not be stored in tool registry entries.",
      forbiddenPath
    );
  }

  if (typeof value.toolId !== "string" || value.toolId.trim() === "") {
    return fail(
      "invalid-tool-id",
      "toolId must be a non-empty string.",
      "toolId"
    );
  }

  if (
    typeof value.category !== "string" ||
    !TOOL_CATEGORIES.has(value.category as ToolRegistryCategory)
  ) {
    return fail(
      "invalid-category",
      "category must be one of llm/tts/renderer/transformer/validator.",
      "category"
    );
  }

  if (!isRecord(value.inputSchema) || !isJsonSafe(value.inputSchema)) {
    return fail(
      "invalid-input-schema",
      "inputSchema must be a JSON-safe object.",
      "inputSchema"
    );
  }

  if (!isRecord(value.outputSchema) || !isJsonSafe(value.outputSchema)) {
    return fail(
      "invalid-output-schema",
      "outputSchema must be a JSON-safe object.",
      "outputSchema"
    );
  }

  if (!isRecord(value.capabilities) || !isJsonSafe(value.capabilities)) {
    return fail(
      "invalid-capabilities",
      "capabilities must be a JSON-safe object.",
      "capabilities"
    );
  }

  if (
    value.capabilities.locales !== undefined &&
    !isStringArray(value.capabilities.locales)
  ) {
    return fail(
      "invalid-capabilities-locales",
      "capabilities.locales must be string[] when provided.",
      "capabilities.locales"
    );
  }

  if (
    value.capabilities.mediaTypes !== undefined &&
    !isStringArray(value.capabilities.mediaTypes)
  ) {
    return fail(
      "invalid-capabilities-media-types",
      "capabilities.mediaTypes must be string[] when provided.",
      "capabilities.mediaTypes"
    );
  }

  const numericCapabilityKeys = [
    "maxInputTokens",
    "maxOutputTokens",
    "maxAssetBytes",
  ] as const;
  for (const key of numericCapabilityKeys) {
    if (
      value.capabilities[key] !== undefined &&
      !isFiniteNonNegativeNumber(value.capabilities[key])
    ) {
      return fail(
        "invalid-capabilities-limit",
        `capabilities.${key} must be a non-negative number when provided.`,
        `capabilities.${key}`
      );
    }
  }

  const executionValidation = validateExecution(value.execution);
  if (!executionValidation.ok) {
    return executionValidation;
  }

  const policyValidation = validatePolicy(value.policy);
  if (!policyValidation.ok) {
    return policyValidation;
  }

  return ok(value as ToolRegistryEntry);
};

export const isToolRegistryEntry = (value: unknown): value is ToolRegistryEntry =>
  validateToolRegistryEntry(value).ok;
