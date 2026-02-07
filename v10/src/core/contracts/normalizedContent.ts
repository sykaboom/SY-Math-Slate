export type NormalizedContentType = "NormalizedContent";
export type DraftNormalizedContentVersion = "0.3.0-draft";
export type NormalizedBlockKind = "text" | "math" | "media" | "break";
export type NormalizedBreakKind = "line-break" | "column-break" | "page-break";
export type NormalizedMediaType = "image" | "video";

export type NormalizedContentMetadata = {
  locale: string;
  title?: string;
  subject?: string;
  grade?: string;
  tags?: string[];
};

export type NormalizedContentStyle = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
};

export type NormalizedContentAudioCue = {
  scriptId: string;
  blockIds: string[];
};

export type NormalizedTextBlock = {
  id: string;
  kind: "text";
  text: string;
};

export type NormalizedMathBlock = {
  id: string;
  kind: "math";
  latex: string;
};

export type NormalizedMediaBlock = {
  id: string;
  kind: "media";
  mediaRef: string;
  mediaType?: NormalizedMediaType;
};

export type NormalizedBreakBlock = {
  id: string;
  kind: "break";
  breakKind?: NormalizedBreakKind;
};

export type NormalizedBlock =
  | NormalizedTextBlock
  | NormalizedMathBlock
  | NormalizedMediaBlock
  | NormalizedBreakBlock;

export type NormalizedContent = {
  type: NormalizedContentType;
  version: DraftNormalizedContentVersion;
  metadata: NormalizedContentMetadata;
  blocks: NormalizedBlock[];
  style?: NormalizedContentStyle;
  audio?: NormalizedContentAudioCue[];
  renderHints?: Record<string, unknown>;
};

export type NormalizedContentValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type NormalizedContentValidationSuccess = {
  ok: true;
  value: NormalizedContent;
};

export type NormalizedContentValidationResult =
  | NormalizedContentValidationSuccess
  | NormalizedContentValidationError;

const VALID_MEDIA_TYPES = new Set<NormalizedMediaType>(["image", "video"]);
const VALID_BREAK_KINDS = new Set<NormalizedBreakKind>([
  "line-break",
  "column-break",
  "page-break",
]);

const fail = (
  code: string,
  message: string,
  path: string
): NormalizedContentValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (value: NormalizedContent): NormalizedContentValidationSuccess => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const validateMetadata = (
  value: unknown,
  path: string
): NormalizedContentValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-metadata", "metadata must be an object.", path);
  }
  if (typeof value.locale !== "string" || value.locale.trim() === "") {
    return fail(
      "invalid-metadata-locale",
      "metadata.locale must be a non-empty string.",
      `${path}.locale`
    );
  }
  const optionalStringFields = ["title", "subject", "grade"] as const;
  for (const field of optionalStringFields) {
    const candidate = value[field];
    if (candidate !== undefined && typeof candidate !== "string") {
      return fail(
        "invalid-metadata-field",
        `${field} must be a string when provided.`,
        `${path}.${field}`
      );
    }
  }
  if (value.tags !== undefined && !isStringArray(value.tags)) {
    return fail(
      "invalid-metadata-tags",
      "metadata.tags must be an array of strings when provided.",
      `${path}.tags`
    );
  }
  return ok({
    type: "NormalizedContent",
    version: "0.3.0-draft",
    metadata: value as NormalizedContentMetadata,
    blocks: [],
  });
};

const validateStyle = (
  value: unknown,
  path: string
): NormalizedContentValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-style", "style must be an object.", path);
  }
  const optionalStringFields = ["fontFamily", "fontSize", "fontWeight", "color"] as const;
  for (const field of optionalStringFields) {
    const candidate = value[field];
    if (candidate !== undefined && typeof candidate !== "string") {
      return fail(
        "invalid-style-field",
        `${field} must be a string when provided.`,
        `${path}.${field}`
      );
    }
  }
  return ok({
    type: "NormalizedContent",
    version: "0.3.0-draft",
    metadata: { locale: "ko-KR" },
    blocks: [],
    style: value as NormalizedContentStyle,
  });
};

const validateAudio = (
  value: unknown,
  path: string
): NormalizedContentValidationResult => {
  if (!Array.isArray(value)) {
    return fail("invalid-audio", "audio must be an array.", path);
  }
  for (let index = 0; index < value.length; index += 1) {
    const cue = value[index];
    if (!isRecord(cue)) {
      return fail(
        "invalid-audio-item",
        "audio item must be an object.",
        `${path}[${index}]`
      );
    }
    if (typeof cue.scriptId !== "string" || cue.scriptId.trim() === "") {
      return fail(
        "invalid-audio-script-id",
        "audio.scriptId must be a non-empty string.",
        `${path}[${index}].scriptId`
      );
    }
    if (!isStringArray(cue.blockIds)) {
      return fail(
        "invalid-audio-block-ids",
        "audio.blockIds must be an array of strings.",
        `${path}[${index}].blockIds`
      );
    }
  }
  return ok({
    type: "NormalizedContent",
    version: "0.3.0-draft",
    metadata: { locale: "ko-KR" },
    blocks: [],
    audio: value as NormalizedContentAudioCue[],
  });
};

const validateBlock = (
  value: unknown,
  index: number
): NormalizedContentValidationResult => {
  const path = `blocks[${index}]`;
  if (!isRecord(value)) {
    return fail("invalid-block", "block must be an object.", path);
  }
  if (typeof value.id !== "string" || value.id.trim() === "") {
    return fail(
      "invalid-block-id",
      "block.id must be a non-empty string.",
      `${path}.id`
    );
  }
  if (value.kind !== "text" && value.kind !== "math" && value.kind !== "media" && value.kind !== "break") {
    return fail(
      "invalid-block-kind",
      "block.kind must be one of text/math/media/break.",
      `${path}.kind`
    );
  }

  if (value.kind === "text") {
    if (typeof value.text !== "string") {
      return fail(
        "invalid-block-text",
        "text block must include text:string.",
        `${path}.text`
      );
    }
    return ok({
      type: "NormalizedContent",
      version: "0.3.0-draft",
      metadata: { locale: "ko-KR" },
      blocks: [value as NormalizedTextBlock],
    });
  }

  if (value.kind === "math") {
    if (typeof value.latex !== "string" || value.latex.trim() === "") {
      return fail(
        "invalid-block-math",
        "math block must include non-empty latex:string.",
        `${path}.latex`
      );
    }
    return ok({
      type: "NormalizedContent",
      version: "0.3.0-draft",
      metadata: { locale: "ko-KR" },
      blocks: [value as NormalizedMathBlock],
    });
  }

  if (value.kind === "media") {
    if (typeof value.mediaRef !== "string" || value.mediaRef.trim() === "") {
      return fail(
        "invalid-block-media-ref",
        "media block must include non-empty mediaRef:string.",
        `${path}.mediaRef`
      );
    }
    if (
      value.mediaType !== undefined &&
      (typeof value.mediaType !== "string" ||
        !VALID_MEDIA_TYPES.has(value.mediaType as NormalizedMediaType))
    ) {
      return fail(
        "invalid-block-media-type",
        "mediaType must be image or video when provided.",
        `${path}.mediaType`
      );
    }
    return ok({
      type: "NormalizedContent",
      version: "0.3.0-draft",
      metadata: { locale: "ko-KR" },
      blocks: [value as NormalizedMediaBlock],
    });
  }

  if (
    value.breakKind !== undefined &&
    (typeof value.breakKind !== "string" ||
      !VALID_BREAK_KINDS.has(value.breakKind as NormalizedBreakKind))
  ) {
    return fail(
      "invalid-block-break-kind",
      "breakKind must be line-break/column-break/page-break when provided.",
      `${path}.breakKind`
    );
  }
  return ok({
    type: "NormalizedContent",
    version: "0.3.0-draft",
    metadata: { locale: "ko-KR" },
    blocks: [value as NormalizedBreakBlock],
  });
};

export const validateNormalizedContent = (
  value: unknown
): NormalizedContentValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-root", "NormalizedContent must be an object.", "root");
  }
  if (value.type !== "NormalizedContent") {
    return fail(
      "invalid-type",
      "type must be 'NormalizedContent'.",
      "type"
    );
  }
  if (value.version !== "0.3.0-draft") {
    return fail(
      "invalid-version",
      "version must be '0.3.0-draft' for provisional slice-1.",
      "version"
    );
  }

  const metadataResult = validateMetadata(value.metadata, "metadata");
  if (!metadataResult.ok) return metadataResult;

  if (!Array.isArray(value.blocks)) {
    return fail("invalid-blocks", "blocks must be an array.", "blocks");
  }
  for (let index = 0; index < value.blocks.length; index += 1) {
    const blockResult = validateBlock(value.blocks[index], index);
    if (!blockResult.ok) return blockResult;
  }

  if (value.style !== undefined) {
    const styleResult = validateStyle(value.style, "style");
    if (!styleResult.ok) return styleResult;
  }
  if (value.audio !== undefined) {
    const audioResult = validateAudio(value.audio, "audio");
    if (!audioResult.ok) return audioResult;
  }
  if (value.renderHints !== undefined && !isRecord(value.renderHints)) {
    return fail(
      "invalid-render-hints",
      "renderHints must be an object when provided.",
      "renderHints"
    );
  }

  return ok(value as NormalizedContent);
};

export const isNormalizedContent = (value: unknown): value is NormalizedContent =>
  validateNormalizedContent(value).ok;
