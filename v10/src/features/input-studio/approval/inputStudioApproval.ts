import type {
  StepBlockKind,
  StepSegment,
  TextSegmentStyle,
} from "@core/types/canvas";
import type { StepBlockDraft } from "@features/layout/dataInput/types";

export const INPUT_STUDIO_DRAFT_QUEUE_TYPE = "input-studio-draft";
export const INPUT_STUDIO_DRAFT_QUEUE_VERSION = 1 as const;

const INPUT_STUDIO_DRAFT_QUEUE_SOURCE = "input-studio" as const;
const INPUT_STUDIO_DRAFT_QUEUE_MODE = "replace-step-blocks" as const;
const INPUT_STUDIO_DEFAULT_REASON = "input-studio-draft";
const VALID_BLOCK_KINDS = new Set<StepBlockKind>([
  "content",
  "line-break",
  "column-break",
  "page-break",
]);
const VALID_TEXT_STYLE_KEYS = new Set<keyof TextSegmentStyle>([
  "fontFamily",
  "fontSize",
  "fontWeight",
  "color",
]);

export type InputStudioDraftQueueMeta = {
  queueType: typeof INPUT_STUDIO_DRAFT_QUEUE_TYPE;
  queueVersion: typeof INPUT_STUDIO_DRAFT_QUEUE_VERSION;
  queueSource: typeof INPUT_STUDIO_DRAFT_QUEUE_SOURCE;
  requestId: string;
  idempotencyKey?: string;
};

export type InputStudioDraftQueuePayload = {
  mode: typeof INPUT_STUDIO_DRAFT_QUEUE_MODE;
  draftBlocks: StepBlockDraft[];
  reason?: string;
};

export type InputStudioDraftQueueEnvelope = {
  meta: InputStudioDraftQueueMeta;
  payload: InputStudioDraftQueuePayload;
};

export type CreateInputStudioDraftQueueMetaInput = {
  requestId: string;
  idempotencyKey?: string;
};

export type CreateInputStudioDraftQueuePayloadInput = {
  draftBlocks: StepBlockDraft[];
  reason?: string;
};

export type CreateInputStudioDraftQueueEnvelopeInput = {
  requestId: string;
  draftBlocks: StepBlockDraft[];
  reason?: string;
  idempotencyKey?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isValidOrderIndex = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  Number.isFinite(value) &&
  value >= 0;

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const createFallbackRequestId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `input-studio-draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const cloneTextSegmentStyle = (
  style: TextSegmentStyle | undefined
): TextSegmentStyle | undefined => (style ? { ...style } : undefined);

const cloneStepSegment = (segment: StepSegment): StepSegment => {
  if (segment.type === "text") {
    return {
      ...segment,
      ...(segment.style ? { style: cloneTextSegmentStyle(segment.style) } : {}),
    };
  }
  return { ...segment };
};

export const cloneInputStudioDraftBlocks = (
  blocks: StepBlockDraft[]
): StepBlockDraft[] =>
  blocks.map((block) => ({
    id: block.id,
    ...(block.kind ? { kind: block.kind } : {}),
    segments: block.segments.map(cloneStepSegment),
  }));

const isTextSegmentStyle = (value: unknown): value is TextSegmentStyle => {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  for (const [styleKey, styleValue] of Object.entries(value)) {
    if (!VALID_TEXT_STYLE_KEYS.has(styleKey as keyof TextSegmentStyle)) return false;
    if (styleValue !== undefined && typeof styleValue !== "string") return false;
  }
  return true;
};

const isStepSegment = (value: unknown): value is StepSegment => {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.id)) return false;
  if (!isValidOrderIndex(value.orderIndex)) return false;

  if (value.type === "text") {
    if (typeof value.html !== "string") return false;
    return isTextSegmentStyle(value.style);
  }

  if (value.type === "image") {
    if (!isNonEmptyString(value.src)) return false;
    return (
      isPositiveFiniteNumber(value.width) && isPositiveFiniteNumber(value.height)
    );
  }

  if (value.type === "video") {
    if (!isNonEmptyString(value.src)) return false;
    const width = value.width;
    const height = value.height;
    if (width !== undefined && !isPositiveFiniteNumber(width)) return false;
    if (height !== undefined && !isPositiveFiniteNumber(height)) return false;
    return true;
  }

  return false;
};

const isStepBlockDraft = (value: unknown): value is StepBlockDraft => {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.id)) return false;
  if (
    value.kind !== undefined &&
    !VALID_BLOCK_KINDS.has(value.kind as StepBlockKind)
  ) {
    return false;
  }
  if (!Array.isArray(value.segments)) return false;
  return value.segments.every((segment) => isStepSegment(segment));
};

export const isInputStudioDraftQueueMeta = (
  value: unknown
): value is InputStudioDraftQueueMeta => {
  if (!isRecord(value)) return false;
  if (value.queueType !== INPUT_STUDIO_DRAFT_QUEUE_TYPE) return false;
  if (value.queueVersion !== INPUT_STUDIO_DRAFT_QUEUE_VERSION) return false;
  if (value.queueSource !== INPUT_STUDIO_DRAFT_QUEUE_SOURCE) return false;
  if (!isNonEmptyString(value.requestId)) return false;
  const idempotencyKey = value.idempotencyKey;
  if (
    idempotencyKey !== undefined &&
    idempotencyKey !== null &&
    !isNonEmptyString(idempotencyKey)
  ) {
    return false;
  }
  return true;
};

export const isInputStudioDraftQueuePayload = (
  value: unknown
): value is InputStudioDraftQueuePayload => {
  if (!isRecord(value)) return false;
  if (value.mode !== INPUT_STUDIO_DRAFT_QUEUE_MODE) return false;
  if (!Array.isArray(value.draftBlocks)) return false;
  if (!value.draftBlocks.every((block) => isStepBlockDraft(block))) return false;
  const reason = value.reason;
  if (reason !== undefined && reason !== null && !isNonEmptyString(reason)) {
    return false;
  }
  return true;
};

export const createInputStudioDraftQueueMeta = (
  input: CreateInputStudioDraftQueueMetaInput
): InputStudioDraftQueueMeta => {
  const requestId = normalizeOptionalString(input.requestId) ?? createFallbackRequestId();
  const idempotencyKey = normalizeOptionalString(input.idempotencyKey);
  return {
    queueType: INPUT_STUDIO_DRAFT_QUEUE_TYPE,
    queueVersion: INPUT_STUDIO_DRAFT_QUEUE_VERSION,
    queueSource: INPUT_STUDIO_DRAFT_QUEUE_SOURCE,
    requestId,
    ...(idempotencyKey ? { idempotencyKey } : {}),
  };
};

export const createInputStudioDraftQueuePayload = (
  input: CreateInputStudioDraftQueuePayloadInput
): InputStudioDraftQueuePayload => {
  const reason = normalizeOptionalString(input.reason);
  return {
    mode: INPUT_STUDIO_DRAFT_QUEUE_MODE,
    draftBlocks: cloneInputStudioDraftBlocks(input.draftBlocks),
    ...(reason ? { reason } : { reason: INPUT_STUDIO_DEFAULT_REASON }),
  };
};

export const createInputStudioDraftQueueEnvelope = (
  input: CreateInputStudioDraftQueueEnvelopeInput
): InputStudioDraftQueueEnvelope => ({
  meta: createInputStudioDraftQueueMeta({
    requestId: input.requestId,
    idempotencyKey: input.idempotencyKey,
  }),
  payload: createInputStudioDraftQueuePayload({
    draftBlocks: input.draftBlocks,
    reason: input.reason,
  }),
});

export const parseInputStudioDraftQueueEnvelope = (
  meta: unknown,
  payload: unknown
): InputStudioDraftQueueEnvelope | null => {
  if (!isInputStudioDraftQueueMeta(meta)) return null;
  if (!isInputStudioDraftQueuePayload(payload)) return null;
  return { meta, payload };
};
