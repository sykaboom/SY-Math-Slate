export const MULTIMODAL_ASSET_PAYLOAD_VERSION = "1.0" as const;

export type MultimodalAssetPayloadVersion =
  typeof MULTIMODAL_ASSET_PAYLOAD_VERSION;

export type MultimodalAssetPayloadType =
  | "ImageAssetPayload"
  | "VideoAssetPayload"
  | "AudioAssetPayload";

export type MultimodalAssetKind = "image" | "video" | "audio";

export type JsonSafeValue =
  | null
  | string
  | number
  | boolean
  | JsonSafeValue[]
  | { [key: string]: JsonSafeValue };

export type JsonSafeMetadata = Record<string, JsonSafeValue>;

type MultimodalAssetBase<TKind extends MultimodalAssetKind> = {
  kind: TKind;
  assetId: string;
  uri: string;
  mimeType?: string;
  metadata?: JsonSafeMetadata;
};

export type ImageAsset = MultimodalAssetBase<"image"> & {
  width?: number;
  height?: number;
  altText?: string;
};

export type VideoAsset = MultimodalAssetBase<"video"> & {
  durationMs?: number;
  width?: number;
  height?: number;
  frameRate?: number;
};

export type AudioAsset = MultimodalAssetBase<"audio"> & {
  durationMs?: number;
  sampleRateHz?: number;
  channels?: number;
  transcriptRef?: string;
};

type AssetPayloadBase<
  TType extends MultimodalAssetPayloadType,
  TAsset extends ImageAsset | VideoAsset | AudioAsset,
> = {
  type: TType;
  version: MultimodalAssetPayloadVersion;
  asset: TAsset;
  metadata?: JsonSafeMetadata;
};

export type ImageAssetPayload = AssetPayloadBase<"ImageAssetPayload", ImageAsset>;

export type VideoAssetPayload = AssetPayloadBase<"VideoAssetPayload", VideoAsset>;

export type AudioAssetPayload = AssetPayloadBase<"AudioAssetPayload", AudioAsset>;

export type MultimodalAssetPayload =
  | ImageAssetPayload
  | VideoAssetPayload
  | AudioAssetPayload;

export type MultimodalAssetValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type MultimodalAssetValidationSuccess<
  TPayload extends MultimodalAssetPayload = MultimodalAssetPayload,
> = {
  ok: true;
  value: TPayload;
};

export type MultimodalAssetValidationResult<
  TPayload extends MultimodalAssetPayload = MultimodalAssetPayload,
> = MultimodalAssetValidationSuccess<TPayload> | MultimodalAssetValidationError;

const MULTIMODAL_PAYLOAD_TYPES = new Set<MultimodalAssetPayloadType>([
  "ImageAssetPayload",
  "VideoAssetPayload",
  "AudioAssetPayload",
]);

const fail = (
  code: string,
  message: string,
  path: string
): MultimodalAssetValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = <
  TPayload extends MultimodalAssetPayload,
>(
  value: TPayload
): MultimodalAssetValidationSuccess<TPayload> => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isJsonSafe = (value: unknown): value is JsonSafeValue => {
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
    return value.every((item) => isJsonSafe(item));
  }
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every((entry) => isJsonSafe(entry));
};

const validateOptionalJsonMetadata = (
  value: unknown,
  path: string
): MultimodalAssetValidationError | null => {
  if (value === undefined) {
    return null;
  }
  if (!isRecord(value)) {
    return fail(
      "invalid-metadata",
      `${path} must be a JSON-safe object when provided.`,
      path
    );
  }
  if (!isJsonSafe(value)) {
    return fail(
      "invalid-metadata-json-safe",
      `${path} must contain JSON-safe values only.`,
      path
    );
  }
  return null;
};

const validateOptionalNonNegativeNumber = (
  value: unknown,
  path: string
): MultimodalAssetValidationError | null => {
  if (value === undefined) {
    return null;
  }
  if (!isFiniteNonNegativeNumber(value)) {
    return fail(
      "invalid-number-field",
      `${path} must be a non-negative finite number when provided.`,
      path
    );
  }
  return null;
};

const validateOptionalString = (
  value: unknown,
  path: string
): MultimodalAssetValidationError | null => {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return fail(
      "invalid-string-field",
      `${path} must be a string when provided.`,
      path
    );
  }
  return null;
};

const validateAssetBase = (
  value: unknown,
  expectedKind: MultimodalAssetKind
): MultimodalAssetValidationError | null => {
  if (!isRecord(value)) {
    return fail("invalid-asset", "asset must be an object.", "asset");
  }
  if (value.kind !== expectedKind) {
    return fail(
      "invalid-asset-kind",
      `asset.kind must be '${expectedKind}'.`,
      "asset.kind"
    );
  }
  if (typeof value.assetId !== "string" || value.assetId.trim() === "") {
    return fail(
      "invalid-asset-id",
      "asset.assetId must be a non-empty string.",
      "asset.assetId"
    );
  }
  if (typeof value.uri !== "string" || value.uri.trim() === "") {
    return fail(
      "invalid-asset-uri",
      "asset.uri must be a non-empty string.",
      "asset.uri"
    );
  }

  const mimeTypeValidation = validateOptionalString(value.mimeType, "asset.mimeType");
  if (mimeTypeValidation) {
    return mimeTypeValidation;
  }

  return validateOptionalJsonMetadata(value.metadata, "asset.metadata");
};

const validateImageAsset = (
  value: unknown
): MultimodalAssetValidationResult<ImageAssetPayload> => {
  const baseValidation = validateAssetBase(value, "image");
  if (baseValidation) {
    return baseValidation;
  }
  if (!isRecord(value)) {
    return fail("invalid-asset", "asset must be an object.", "asset");
  }

  const widthValidation = validateOptionalNonNegativeNumber(value.width, "asset.width");
  if (widthValidation) {
    return widthValidation;
  }
  const heightValidation = validateOptionalNonNegativeNumber(
    value.height,
    "asset.height"
  );
  if (heightValidation) {
    return heightValidation;
  }
  const altTextValidation = validateOptionalString(value.altText, "asset.altText");
  if (altTextValidation) {
    return altTextValidation;
  }
  return ok({
    type: "ImageAssetPayload",
    version: MULTIMODAL_ASSET_PAYLOAD_VERSION,
    asset: value as ImageAsset,
  });
};

const validateVideoAsset = (
  value: unknown
): MultimodalAssetValidationResult<VideoAssetPayload> => {
  const baseValidation = validateAssetBase(value, "video");
  if (baseValidation) {
    return baseValidation;
  }
  if (!isRecord(value)) {
    return fail("invalid-asset", "asset must be an object.", "asset");
  }

  const durationValidation = validateOptionalNonNegativeNumber(
    value.durationMs,
    "asset.durationMs"
  );
  if (durationValidation) {
    return durationValidation;
  }
  const widthValidation = validateOptionalNonNegativeNumber(value.width, "asset.width");
  if (widthValidation) {
    return widthValidation;
  }
  const heightValidation = validateOptionalNonNegativeNumber(
    value.height,
    "asset.height"
  );
  if (heightValidation) {
    return heightValidation;
  }
  const frameRateValidation = validateOptionalNonNegativeNumber(
    value.frameRate,
    "asset.frameRate"
  );
  if (frameRateValidation) {
    return frameRateValidation;
  }

  return ok({
    type: "VideoAssetPayload",
    version: MULTIMODAL_ASSET_PAYLOAD_VERSION,
    asset: value as VideoAsset,
  });
};

const validateAudioAsset = (
  value: unknown
): MultimodalAssetValidationResult<AudioAssetPayload> => {
  const baseValidation = validateAssetBase(value, "audio");
  if (baseValidation) {
    return baseValidation;
  }
  if (!isRecord(value)) {
    return fail("invalid-asset", "asset must be an object.", "asset");
  }

  const durationValidation = validateOptionalNonNegativeNumber(
    value.durationMs,
    "asset.durationMs"
  );
  if (durationValidation) {
    return durationValidation;
  }
  const sampleRateValidation = validateOptionalNonNegativeNumber(
    value.sampleRateHz,
    "asset.sampleRateHz"
  );
  if (sampleRateValidation) {
    return sampleRateValidation;
  }
  const channelsValidation = validateOptionalNonNegativeNumber(
    value.channels,
    "asset.channels"
  );
  if (channelsValidation) {
    return channelsValidation;
  }
  const transcriptValidation = validateOptionalString(
    value.transcriptRef,
    "asset.transcriptRef"
  );
  if (transcriptValidation) {
    return transcriptValidation;
  }

  return ok({
    type: "AudioAssetPayload",
    version: MULTIMODAL_ASSET_PAYLOAD_VERSION,
    asset: value as AudioAsset,
  });
};

const validatePayloadEnvelope = (
  value: unknown,
  expectedType: MultimodalAssetPayloadType
): MultimodalAssetValidationError | null => {
  if (!isRecord(value)) {
    return fail(
      "invalid-multimodal-root",
      "multimodal payload must be an object.",
      "root"
    );
  }
  if (value.type !== expectedType) {
    return fail(
      "invalid-multimodal-type",
      `type must be '${expectedType}'.`,
      "type"
    );
  }
  if (value.version !== MULTIMODAL_ASSET_PAYLOAD_VERSION) {
    return fail(
      "invalid-multimodal-version",
      `version must be '${MULTIMODAL_ASSET_PAYLOAD_VERSION}'.`,
      "version"
    );
  }
  return validateOptionalJsonMetadata(value.metadata, "metadata");
};

export const validateImageAssetPayload = (
  value: unknown
): MultimodalAssetValidationResult<ImageAssetPayload> => {
  const envelopeValidation = validatePayloadEnvelope(value, "ImageAssetPayload");
  if (envelopeValidation) {
    return envelopeValidation;
  }
  if (!isRecord(value)) {
    return fail(
      "invalid-multimodal-root",
      "multimodal payload must be an object.",
      "root"
    );
  }

  const assetValidation = validateImageAsset(value.asset);
  if (!assetValidation.ok) {
    return assetValidation;
  }

  return ok({
    ...(value as Omit<ImageAssetPayload, "asset">),
    asset: assetValidation.value.asset,
  });
};

export const validateVideoAssetPayload = (
  value: unknown
): MultimodalAssetValidationResult<VideoAssetPayload> => {
  const envelopeValidation = validatePayloadEnvelope(value, "VideoAssetPayload");
  if (envelopeValidation) {
    return envelopeValidation;
  }
  if (!isRecord(value)) {
    return fail(
      "invalid-multimodal-root",
      "multimodal payload must be an object.",
      "root"
    );
  }

  const assetValidation = validateVideoAsset(value.asset);
  if (!assetValidation.ok) {
    return assetValidation;
  }

  return ok({
    ...(value as Omit<VideoAssetPayload, "asset">),
    asset: assetValidation.value.asset,
  });
};

export const validateAudioAssetPayload = (
  value: unknown
): MultimodalAssetValidationResult<AudioAssetPayload> => {
  const envelopeValidation = validatePayloadEnvelope(value, "AudioAssetPayload");
  if (envelopeValidation) {
    return envelopeValidation;
  }
  if (!isRecord(value)) {
    return fail(
      "invalid-multimodal-root",
      "multimodal payload must be an object.",
      "root"
    );
  }

  const assetValidation = validateAudioAsset(value.asset);
  if (!assetValidation.ok) {
    return assetValidation;
  }

  return ok({
    ...(value as Omit<AudioAssetPayload, "asset">),
    asset: assetValidation.value.asset,
  });
};

export const validateMultimodalAssetPayload = (
  value: unknown
): MultimodalAssetValidationResult => {
  if (!isRecord(value)) {
    return fail(
      "invalid-multimodal-root",
      "multimodal payload must be an object.",
      "root"
    );
  }
  if (typeof value.type !== "string") {
    return fail(
      "invalid-multimodal-type",
      "type must be a string discriminator.",
      "type"
    );
  }
  if (!MULTIMODAL_PAYLOAD_TYPES.has(value.type as MultimodalAssetPayloadType)) {
    return fail(
      "unsupported-multimodal-type",
      "type must be one of ImageAssetPayload/VideoAssetPayload/AudioAssetPayload.",
      "type"
    );
  }

  if (value.type === "ImageAssetPayload") {
    return validateImageAssetPayload(value);
  }
  if (value.type === "VideoAssetPayload") {
    return validateVideoAssetPayload(value);
  }
  return validateAudioAssetPayload(value);
};

export const isImageAssetPayload = (value: unknown): value is ImageAssetPayload =>
  validateImageAssetPayload(value).ok;

export const isVideoAssetPayload = (value: unknown): value is VideoAssetPayload =>
  validateVideoAssetPayload(value).ok;

export const isAudioAssetPayload = (value: unknown): value is AudioAssetPayload =>
  validateAudioAssetPayload(value).ok;

export const isMultimodalAssetPayload = (
  value: unknown
): value is MultimodalAssetPayload => validateMultimodalAssetPayload(value).ok;
