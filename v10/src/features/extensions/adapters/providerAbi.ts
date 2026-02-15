import type {
  KnownNormalizedPayload,
  ToolResult,
  ToolResultDiagnostics,
  ToolResultStatus,
} from "@core/contracts";
import type { ConnectorResponse } from "@core/extensions/connectors";
import type { AdapterInvokeRequest } from "./types";

export const PROVIDER_ADAPTER_ABI_V1 = "provider-adapter-abi.v1" as const;

export type ProviderAdapterAbiVersion = typeof PROVIDER_ADAPTER_ABI_V1;
export type ProviderAdapterKind = "llm" | "image" | "video" | "audio";

export type ProviderAbiJsonPrimitive = string | number | boolean | null;
export type ProviderAbiJsonValue =
  | ProviderAbiJsonPrimitive
  | ProviderAbiJsonValue[]
  | ProviderAbiJsonObject;

export type ProviderAbiJsonObject = {
  [key: string]: ProviderAbiJsonValue;
};

export type ProviderAdapterAbiMetadata = {
  abiVersion: ProviderAdapterAbiVersion;
  kind: ProviderAdapterKind;
  provider: string;
  deterministicEnvelope: true;
};

export type ProviderAdapterRequestEnvelope = {
  abiVersion: ProviderAdapterAbiVersion;
  requestId: string;
  adapterId: string;
  toolId: string;
  kind: ProviderAdapterKind;
  payload: ProviderAbiJsonValue;
  meta: ProviderAbiJsonObject;
};

export type ProviderAdapterResponseEnvelope = {
  abiVersion: ProviderAdapterAbiVersion;
  requestId: string;
  responseId: string;
  adapterId: string;
  toolId: string;
  kind: ProviderAdapterKind;
  status: ToolResultStatus;
  normalizedType: KnownNormalizedPayload["type"];
};

export type ProviderAdapterToolResultRawEnvelope = {
  request: ProviderAdapterRequestEnvelope;
  response: ProviderAdapterResponseEnvelope;
};

export type ProviderAbiValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type ProviderAbiValidationSuccess<TValue> = {
  ok: true;
  value: TValue;
};

export type ProviderAbiValidationResult<TValue> =
  | ProviderAbiValidationError
  | ProviderAbiValidationSuccess<TValue>;

type ProviderToolResultOptions<TNormalized extends KnownNormalizedPayload> = {
  request: ProviderAdapterRequestEnvelope;
  normalized: TNormalized;
  toolVersion: string;
  status?: ToolResultStatus;
  warnings?: string[];
  diagnostics?: ToolResultDiagnostics;
};

const PROVIDER_ADAPTER_KINDS = new Set<ProviderAdapterKind>([
  "llm",
  "image",
  "video",
  "audio",
]);

const TOOL_RESULT_STATUSES = new Set<ToolResultStatus>([
  "ok",
  "error",
  "partial",
]);

const KNOWN_NORMALIZED_TYPES = new Set<KnownNormalizedPayload["type"]>([
  "NormalizedContent",
  "RenderPlan",
  "TTSScript",
  "ImageAssetPayload",
  "VideoAssetPayload",
  "AudioAssetPayload",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const fail = (
  code: string,
  message: string,
  path: string
): ProviderAbiValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = <TValue>(value: TValue): ProviderAbiValidationSuccess<TValue> => ({
  ok: true,
  value,
});

const normalizeNonEmptyString = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized === "" ? fallback : normalized;
};

const normalizeFiniteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeWarnings = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
};

const isProviderAbiJsonValueInternal = (
  value: unknown,
  visited: WeakSet<object>
): value is ProviderAbiJsonValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    if (visited.has(value)) return false;
    visited.add(value);
    const valid = value.every((entry) =>
      isProviderAbiJsonValueInternal(entry, visited)
    );
    visited.delete(value);
    return valid;
  }
  if (isRecord(value)) {
    if (visited.has(value)) return false;
    visited.add(value);
    const valid = Object.values(value).every((entry) =>
      isProviderAbiJsonValueInternal(entry, visited)
    );
    visited.delete(value);
    return valid;
  }
  return false;
};

export const isProviderAbiJsonValue = (
  value: unknown
): value is ProviderAbiJsonValue =>
  isProviderAbiJsonValueInternal(value, new WeakSet<object>());

const toCanonicalJsonValueInternal = (
  value: unknown,
  visited: WeakSet<object>
): ProviderAbiJsonValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (Array.isArray(value)) {
    if (visited.has(value)) return "[Circular]";
    visited.add(value);
    const normalized = value.map((entry) =>
      toCanonicalJsonValueInternal(entry, visited)
    );
    visited.delete(value);
    return normalized;
  }
  if (isRecord(value)) {
    if (visited.has(value)) return "[Circular]";
    visited.add(value);
    const normalized: ProviderAbiJsonObject = {};
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right)
    );
    for (const [key, entry] of entries) {
      normalized[key] = toCanonicalJsonValueInternal(entry, visited);
    }
    visited.delete(value);
    return normalized;
  }
  return null;
};

export const toCanonicalProviderAbiJson = (
  value: unknown
): ProviderAbiJsonValue =>
  toCanonicalJsonValueInternal(value, new WeakSet<object>());

const toCanonicalProviderAbiJsonObject = (
  value: unknown
): ProviderAbiJsonObject => {
  const normalized = toCanonicalProviderAbiJson(value);
  if (!isRecord(normalized)) return {};
  return normalized as ProviderAbiJsonObject;
};

const toStableString = (value: ProviderAbiJsonValue): string =>
  JSON.stringify(value);

const hashFnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const buildDeterministicId = (prefix: string, ...parts: string[]): string =>
  `${prefix}_${hashFnv1a(parts.join("|"))}`;

export const createProviderAdapterAbiMetadata = (
  kind: ProviderAdapterKind,
  provider: string
): ProviderAdapterAbiMetadata => ({
  abiVersion: PROVIDER_ADAPTER_ABI_V1,
  kind,
  provider: normalizeNonEmptyString(provider, "provider.reference"),
  deterministicEnvelope: true,
});

export const createProviderAdapterRequestEnvelope = (
  request: Pick<AdapterInvokeRequest, "adapterId" | "toolId" | "payload" | "meta">,
  kind: ProviderAdapterKind
): ProviderAdapterRequestEnvelope => {
  const adapterId = normalizeNonEmptyString(request.adapterId, "unknown-adapter");
  const toolId = normalizeNonEmptyString(request.toolId, "unknown-tool");
  const payload = toCanonicalProviderAbiJson(request.payload);
  const meta = toCanonicalProviderAbiJsonObject(request.meta);
  const requestId = buildDeterministicId(
    "req",
    adapterId,
    toolId,
    kind,
    toStableString(payload),
    toStableString(meta)
  );

  return {
    abiVersion: PROVIDER_ADAPTER_ABI_V1,
    requestId,
    adapterId,
    toolId,
    kind,
    payload,
    meta,
  };
};

export const createProviderAdapterResponseEnvelope = (
  request: ProviderAdapterRequestEnvelope,
  status: ToolResultStatus,
  normalizedType: KnownNormalizedPayload["type"]
): ProviderAdapterResponseEnvelope => ({
  abiVersion: PROVIDER_ADAPTER_ABI_V1,
  requestId: request.requestId,
  responseId: buildDeterministicId(
    "res",
    request.requestId,
    status,
    normalizedType
  ),
  adapterId: request.adapterId,
  toolId: request.toolId,
  kind: request.kind,
  status,
  normalizedType,
});

export const createProviderDiagnostics = (
  request: ProviderAdapterRequestEnvelope,
  options?: {
    warnings?: string[];
    latencyMs?: number;
    costUsd?: number;
    extras?: Record<string, unknown>;
  }
): ToolResultDiagnostics => {
  const warnings = Array.from(
    new Set<string>([
      `provider-abi:${request.kind}`,
      ...normalizeWarnings(options?.warnings),
    ])
  );

  const diagnostics: ToolResultDiagnostics = {
    latencyMs: normalizeFiniteNumber(options?.latencyMs, 0),
    costUsd: normalizeFiniteNumber(options?.costUsd, 0),
    warnings,
    requestId: request.requestId,
    adapterId: request.adapterId,
    abiVersion: request.abiVersion,
  };

  const extras = toCanonicalProviderAbiJsonObject(options?.extras);
  for (const [key, value] of Object.entries(extras)) {
    diagnostics[key] = value;
  }

  return diagnostics;
};

const mergeDiagnostics = (
  request: ProviderAdapterRequestEnvelope,
  warnings: string[] | undefined,
  diagnostics: ToolResultDiagnostics | undefined
): ToolResultDiagnostics => {
  const baseDiagnostics = createProviderDiagnostics(request, { warnings });
  if (!diagnostics) return baseDiagnostics;

  return {
    ...baseDiagnostics,
    ...diagnostics,
    warnings: Array.from(
      new Set<string>([
        ...normalizeWarnings(baseDiagnostics.warnings),
        ...normalizeWarnings(diagnostics.warnings),
      ])
    ),
  };
};

export const createProviderToolResult = <
  TNormalized extends KnownNormalizedPayload,
>({
  request,
  normalized,
  toolVersion,
  status = "ok",
  warnings,
  diagnostics,
}: ProviderToolResultOptions<TNormalized>): ToolResult<TNormalized> => {
  const response = createProviderAdapterResponseEnvelope(
    request,
    status,
    normalized.type
  );

  return {
    toolId: request.toolId,
    toolVersion: normalizeNonEmptyString(toolVersion, "provider-abi-v1"),
    status,
    raw: {
      request,
      response,
    } satisfies ProviderAdapterToolResultRawEnvelope,
    normalized,
    diagnostics: mergeDiagnostics(request, warnings, diagnostics),
  };
};

export const toProviderConnectorSuccessResponse = <
  TNormalized extends KnownNormalizedPayload,
>(
  toolResult: ToolResult<TNormalized>
): ConnectorResponse => ({
  ok: true,
  toolResult,
});

export const validateProviderAdapterAbiMetadata = (
  value: unknown
): ProviderAbiValidationResult<ProviderAdapterAbiMetadata> => {
  if (!isRecord(value)) {
    return fail("invalid-root", "metadata must be an object.", "root");
  }
  if (value.abiVersion !== PROVIDER_ADAPTER_ABI_V1) {
    return fail(
      "invalid-abi-version",
      `abiVersion must be '${PROVIDER_ADAPTER_ABI_V1}'.`,
      "abiVersion"
    );
  }
  if (
    typeof value.kind !== "string" ||
    !PROVIDER_ADAPTER_KINDS.has(value.kind as ProviderAdapterKind)
  ) {
    return fail(
      "invalid-kind",
      "kind must be one of llm/image/video/audio.",
      "kind"
    );
  }
  if (typeof value.provider !== "string" || value.provider.trim() === "") {
    return fail(
      "invalid-provider",
      "provider must be a non-empty string.",
      "provider"
    );
  }
  if (value.deterministicEnvelope !== true) {
    return fail(
      "invalid-deterministic-envelope",
      "deterministicEnvelope must be true.",
      "deterministicEnvelope"
    );
  }
  return ok(value as ProviderAdapterAbiMetadata);
};

export const isProviderAdapterAbiMetadata = (
  value: unknown
): value is ProviderAdapterAbiMetadata =>
  validateProviderAdapterAbiMetadata(value).ok;

export const validateProviderAdapterRequestEnvelope = (
  value: unknown
): ProviderAbiValidationResult<ProviderAdapterRequestEnvelope> => {
  if (!isRecord(value)) {
    return fail("invalid-root", "request envelope must be an object.", "root");
  }
  if (value.abiVersion !== PROVIDER_ADAPTER_ABI_V1) {
    return fail(
      "invalid-abi-version",
      `abiVersion must be '${PROVIDER_ADAPTER_ABI_V1}'.`,
      "abiVersion"
    );
  }
  if (typeof value.requestId !== "string" || value.requestId.trim() === "") {
    return fail(
      "invalid-request-id",
      "requestId must be a non-empty string.",
      "requestId"
    );
  }
  if (typeof value.adapterId !== "string" || value.adapterId.trim() === "") {
    return fail(
      "invalid-adapter-id",
      "adapterId must be a non-empty string.",
      "adapterId"
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
    typeof value.kind !== "string" ||
    !PROVIDER_ADAPTER_KINDS.has(value.kind as ProviderAdapterKind)
  ) {
    return fail(
      "invalid-kind",
      "kind must be one of llm/image/video/audio.",
      "kind"
    );
  }
  if (!isProviderAbiJsonValue(value.payload)) {
    return fail(
      "invalid-payload",
      "payload must be JSON-safe.",
      "payload"
    );
  }
  if (!isRecord(value.meta) || !isProviderAbiJsonValue(value.meta)) {
    return fail("invalid-meta", "meta must be a JSON-safe object.", "meta");
  }
  return ok(value as ProviderAdapterRequestEnvelope);
};

export const isProviderAdapterRequestEnvelope = (
  value: unknown
): value is ProviderAdapterRequestEnvelope =>
  validateProviderAdapterRequestEnvelope(value).ok;

export const validateProviderAdapterResponseEnvelope = (
  value: unknown
): ProviderAbiValidationResult<ProviderAdapterResponseEnvelope> => {
  if (!isRecord(value)) {
    return fail("invalid-root", "response envelope must be an object.", "root");
  }
  if (value.abiVersion !== PROVIDER_ADAPTER_ABI_V1) {
    return fail(
      "invalid-abi-version",
      `abiVersion must be '${PROVIDER_ADAPTER_ABI_V1}'.`,
      "abiVersion"
    );
  }
  if (typeof value.requestId !== "string" || value.requestId.trim() === "") {
    return fail(
      "invalid-request-id",
      "requestId must be a non-empty string.",
      "requestId"
    );
  }
  if (typeof value.responseId !== "string" || value.responseId.trim() === "") {
    return fail(
      "invalid-response-id",
      "responseId must be a non-empty string.",
      "responseId"
    );
  }
  if (typeof value.adapterId !== "string" || value.adapterId.trim() === "") {
    return fail(
      "invalid-adapter-id",
      "adapterId must be a non-empty string.",
      "adapterId"
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
    typeof value.kind !== "string" ||
    !PROVIDER_ADAPTER_KINDS.has(value.kind as ProviderAdapterKind)
  ) {
    return fail(
      "invalid-kind",
      "kind must be one of llm/image/video/audio.",
      "kind"
    );
  }
  if (
    typeof value.status !== "string" ||
    !TOOL_RESULT_STATUSES.has(value.status as ToolResultStatus)
  ) {
    return fail(
      "invalid-status",
      "status must be one of ok/error/partial.",
      "status"
    );
  }
  if (
    typeof value.normalizedType !== "string" ||
    !KNOWN_NORMALIZED_TYPES.has(
      value.normalizedType as KnownNormalizedPayload["type"]
    )
  ) {
    return fail(
      "invalid-normalized-type",
      "normalizedType must be one of NormalizedContent/RenderPlan/TTSScript/ImageAssetPayload/VideoAssetPayload/AudioAssetPayload.",
      "normalizedType"
    );
  }
  return ok(value as ProviderAdapterResponseEnvelope);
};

export const isProviderAdapterResponseEnvelope = (
  value: unknown
): value is ProviderAdapterResponseEnvelope =>
  validateProviderAdapterResponseEnvelope(value).ok;

export const validateProviderAdapterToolResultRawEnvelope = (
  value: unknown
): ProviderAbiValidationResult<ProviderAdapterToolResultRawEnvelope> => {
  if (!isRecord(value)) {
    return fail("invalid-root", "raw envelope must be an object.", "root");
  }
  const request = validateProviderAdapterRequestEnvelope(value.request);
  if (!request.ok) {
    return fail(request.code, request.message, `request.${request.path}`);
  }
  const response = validateProviderAdapterResponseEnvelope(value.response);
  if (!response.ok) {
    return fail(response.code, response.message, `response.${response.path}`);
  }
  if (request.value.requestId !== response.value.requestId) {
    return fail(
      "request-response-mismatch",
      "response.requestId must match request.requestId.",
      "response.requestId"
    );
  }
  if (request.value.toolId !== response.value.toolId) {
    return fail(
      "tool-id-mismatch",
      "response.toolId must match request.toolId.",
      "response.toolId"
    );
  }
  if (request.value.adapterId !== response.value.adapterId) {
    return fail(
      "adapter-id-mismatch",
      "response.adapterId must match request.adapterId.",
      "response.adapterId"
    );
  }
  if (request.value.kind !== response.value.kind) {
    return fail(
      "kind-mismatch",
      "response.kind must match request.kind.",
      "response.kind"
    );
  }
  return ok({
    request: request.value,
    response: response.value,
  });
};

export const isProviderAdapterToolResultRawEnvelope = (
  value: unknown
): value is ProviderAdapterToolResultRawEnvelope =>
  validateProviderAdapterToolResultRawEnvelope(value).ok;
