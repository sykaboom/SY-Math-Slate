import type {
  AudioAssetPayload,
  ImageAssetPayload,
  JsonSafeMetadata,
  JsonSafeValue,
  MultimodalAssetPayload,
  MultimodalAssetPayloadType,
  MultimodalAssetValidationError,
  VideoAssetPayload,
} from "@core/foundation/schemas";
import { validateMultimodalAssetPayload } from "@core/foundation/schemas";

export const AI_OUTPUT_ASSET_PIPELINE_VERSION = "ai-output-asset-pipeline.v1" as const;

export const AI_OUTPUT_ASSET_VALIDATION_ERROR_CODES = [
  "asset-payload-invalid-root",
  "asset-payload-unsupported-type",
  "asset-payload-invalid-contract",
  "asset-payload-validation-exception",
  "asset-payload-list-invalid",
  "asset-payload-list-item-invalid",
] as const;

export type AiOutputAssetValidationErrorCode =
  (typeof AI_OUTPUT_ASSET_VALIDATION_ERROR_CODES)[number];

export type AiOutputAssetDescriptor = {
  descriptorId: string;
  pipelineVersion: typeof AI_OUTPUT_ASSET_PIPELINE_VERSION;
  payloadType: MultimodalAssetPayloadType;
  payloadVersion: MultimodalAssetPayload["version"];
  kind: "image" | "video" | "audio";
  assetId: string;
  uri: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  frameRate: number | null;
  sampleRateHz: number | null;
  channels: number | null;
  altText: string | null;
  transcriptRef: string | null;
  metadata: JsonSafeMetadata;
  assetMetadata: JsonSafeMetadata;
};

export type AiOutputAssetValidationError = {
  ok: false;
  code: AiOutputAssetValidationErrorCode;
  message: string;
  path: string;
  sourceCode?: string;
};

export type AiOutputAssetValidationSuccess<TValue> = {
  ok: true;
  value: TValue;
};

export type AiOutputAssetValidationResult<TValue> =
  | AiOutputAssetValidationError
  | AiOutputAssetValidationSuccess<TValue>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hashFnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const fail = <TValue>(
  code: AiOutputAssetValidationErrorCode,
  message: string,
  path: string,
  sourceCode?: string
): AiOutputAssetValidationResult<TValue> => ({
  ok: false,
  code,
  message,
  path,
  ...(sourceCode ? { sourceCode } : {}),
});

const ok = <TValue>(value: TValue): AiOutputAssetValidationResult<TValue> => ({
  ok: true,
  value,
});

const toJsonSafeValueInternal = (
  value: unknown,
  visited: WeakSet<object>
): JsonSafeValue => {
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
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }
  if (Array.isArray(value)) {
    if (visited.has(value)) return "[Circular]";
    visited.add(value);
    const normalized = value.map((entry) =>
      toJsonSafeValueInternal(entry, visited)
    );
    visited.delete(value);
    return normalized;
  }
  if (isRecord(value)) {
    if (visited.has(value)) return "[Circular]";
    visited.add(value);
    const normalized: Record<string, JsonSafeValue> = {};
    const entries = Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    for (const [key, entry] of entries) {
      normalized[key] = toJsonSafeValueInternal(entry, visited);
    }
    visited.delete(value);
    return normalized;
  }
  return null;
};

const toCanonicalJsonSafeValue = (value: unknown): JsonSafeValue =>
  toJsonSafeValueInternal(value, new WeakSet<object>());

const toCanonicalMetadata = (value: unknown): JsonSafeMetadata => {
  const normalized = toCanonicalJsonSafeValue(value);
  return isRecord(normalized) ? (normalized as JsonSafeMetadata) : {};
};

const stableStringify = (value: unknown): string =>
  JSON.stringify(toCanonicalJsonSafeValue(value));

const normalizeOptionalString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
};

const normalizeOptionalFiniteNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toValidationError = (
  error: MultimodalAssetValidationError
): AiOutputAssetValidationError => {
  if (error.code === "invalid-multimodal-root") {
    return {
      ok: false,
      code: "asset-payload-invalid-root",
      message: "Asset payload must be an object.",
      path: error.path,
      sourceCode: error.code,
    };
  }
  if (error.code === "unsupported-multimodal-type") {
    return {
      ok: false,
      code: "asset-payload-unsupported-type",
      message:
        "Asset payload type must be ImageAssetPayload, VideoAssetPayload, or AudioAssetPayload.",
      path: error.path,
      sourceCode: error.code,
    };
  }
  return {
    ok: false,
    code: "asset-payload-invalid-contract",
    message: error.message,
    path: error.path,
    sourceCode: error.code,
  };
};

const createDescriptorBody = (
  payload: MultimodalAssetPayload
): Omit<AiOutputAssetDescriptor, "descriptorId"> => {
  if (payload.type === "ImageAssetPayload") {
    return createImageDescriptorBody(payload);
  }
  if (payload.type === "VideoAssetPayload") {
    return createVideoDescriptorBody(payload);
  }
  return createAudioDescriptorBody(payload);
};

const createImageDescriptorBody = (
  payload: ImageAssetPayload
): Omit<AiOutputAssetDescriptor, "descriptorId"> => ({
  pipelineVersion: AI_OUTPUT_ASSET_PIPELINE_VERSION,
  payloadType: payload.type,
  payloadVersion: payload.version,
  kind: payload.asset.kind,
  assetId: payload.asset.assetId,
  uri: payload.asset.uri,
  mimeType: normalizeOptionalString(payload.asset.mimeType),
  width: normalizeOptionalFiniteNumber(payload.asset.width),
  height: normalizeOptionalFiniteNumber(payload.asset.height),
  durationMs: null,
  frameRate: null,
  sampleRateHz: null,
  channels: null,
  altText: normalizeOptionalString(payload.asset.altText),
  transcriptRef: null,
  metadata: toCanonicalMetadata(payload.metadata),
  assetMetadata: toCanonicalMetadata(payload.asset.metadata),
});

const createVideoDescriptorBody = (
  payload: VideoAssetPayload
): Omit<AiOutputAssetDescriptor, "descriptorId"> => ({
  pipelineVersion: AI_OUTPUT_ASSET_PIPELINE_VERSION,
  payloadType: payload.type,
  payloadVersion: payload.version,
  kind: payload.asset.kind,
  assetId: payload.asset.assetId,
  uri: payload.asset.uri,
  mimeType: normalizeOptionalString(payload.asset.mimeType),
  width: normalizeOptionalFiniteNumber(payload.asset.width),
  height: normalizeOptionalFiniteNumber(payload.asset.height),
  durationMs: normalizeOptionalFiniteNumber(payload.asset.durationMs),
  frameRate: normalizeOptionalFiniteNumber(payload.asset.frameRate),
  sampleRateHz: null,
  channels: null,
  altText: null,
  transcriptRef: null,
  metadata: toCanonicalMetadata(payload.metadata),
  assetMetadata: toCanonicalMetadata(payload.asset.metadata),
});

const createAudioDescriptorBody = (
  payload: AudioAssetPayload
): Omit<AiOutputAssetDescriptor, "descriptorId"> => ({
  pipelineVersion: AI_OUTPUT_ASSET_PIPELINE_VERSION,
  payloadType: payload.type,
  payloadVersion: payload.version,
  kind: payload.asset.kind,
  assetId: payload.asset.assetId,
  uri: payload.asset.uri,
  mimeType: normalizeOptionalString(payload.asset.mimeType),
  width: null,
  height: null,
  durationMs: normalizeOptionalFiniteNumber(payload.asset.durationMs),
  frameRate: null,
  sampleRateHz: normalizeOptionalFiniteNumber(payload.asset.sampleRateHz),
  channels: normalizeOptionalFiniteNumber(payload.asset.channels),
  altText: null,
  transcriptRef: normalizeOptionalString(payload.asset.transcriptRef),
  metadata: toCanonicalMetadata(payload.metadata),
  assetMetadata: toCanonicalMetadata(payload.asset.metadata),
});

const createDescriptorId = (
  descriptorBody: Omit<AiOutputAssetDescriptor, "descriptorId">
): string => `asset_${hashFnv1a(stableStringify(descriptorBody))}`;

export const createDeterministicAssetDescriptor = (
  payload: MultimodalAssetPayload
): AiOutputAssetDescriptor => {
  const descriptorBody = createDescriptorBody(payload);
  return {
    descriptorId: createDescriptorId(descriptorBody),
    ...descriptorBody,
  };
};

export const validateAiOutputAssetPayload = (
  value: unknown
): AiOutputAssetValidationResult<MultimodalAssetPayload> => {
  try {
    const validation = validateMultimodalAssetPayload(value);
    if (!validation.ok) {
      return toValidationError(validation);
    }
    return ok(validation.value);
  } catch {
    return fail(
      "asset-payload-validation-exception",
      "Unexpected error while validating asset payload.",
      "root"
    );
  }
};

export const normalizeAiOutputAssetPayload = (
  value: unknown
): AiOutputAssetValidationResult<AiOutputAssetDescriptor> => {
  const validation = validateAiOutputAssetPayload(value);
  if (!validation.ok) {
    return validation;
  }
  return ok(createDeterministicAssetDescriptor(validation.value));
};

export const normalizeAiOutputAssetPayloads = (
  value: unknown
): AiOutputAssetValidationResult<AiOutputAssetDescriptor[]> => {
  if (!Array.isArray(value)) {
    return fail(
      "asset-payload-list-invalid",
      "Asset payload list must be an array.",
      "root"
    );
  }

  const descriptors: AiOutputAssetDescriptor[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const normalized = normalizeAiOutputAssetPayload(value[index]);
    if (!normalized.ok) {
      return fail(
        "asset-payload-list-item-invalid",
        normalized.message,
        `items[${index}].${normalized.path}`,
        normalized.code
      );
    }
    descriptors.push(normalized.value);
  }

  descriptors.sort((left, right) =>
    left.descriptorId.localeCompare(right.descriptorId)
  );

  return ok(descriptors);
};
