import {
  registerAppCommand,
  type AppCommand,
  type AppCommandPayloadValidationResult,
} from "@core/engine/commandBus";
import type {
  ModInput,
  StepBlock,
  StepBlockKind,
  StepSegment,
  TextSegmentStyle,
} from "@core/types/canvas";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useDocStore } from "@features/store/useDocStore";
import {
  useUIStore,
  type LaserType,
  type PenType,
  type Tool,
} from "@features/store/useUIStoreBridge";

export type CommandMigrationDomain =
  | "doc-core"
  | "tooling"
  | "playback-page"
  | "data-input";

export const COMMAND_MIGRATION_MAP: Record<
  CommandMigrationDomain,
  readonly string[]
> = {
  "doc-core": ["insertBlock", "updateBlock", "deleteBlock"],
  tooling: [
    "setTool",
    "setPenType",
    "setPenColor",
    "setPenWidth",
    "setPenOpacity",
    "setLaserType",
    "setLaserColor",
    "setLaserWidth",
  ],
  "playback-page": [
    "setPlaybackSpeed",
    "setAutoPlayDelay",
    "toggleAutoPlay",
    "togglePause",
    "triggerPlay",
    "triggerStop",
    "triggerSkip",
    "nextStep",
    "prevStep",
    "goToStep",
    "nextPage",
    "prevPage",
    "goToPage",
  ],
  "data-input": [
    "insertBreak",
    "importStepBlocks",
    "setInsertionIndex",
    "setAnimationModInput",
    "clearAllAudio",
  ],
};

type InsertBlockPayload = {
  block: StepBlock;
  index?: number;
};

type UpdateBlockPayload = {
  blockId: string;
  block: StepBlock;
};

type DeleteBlockPayload = {
  blockId: string;
};

type SetToolPayload = {
  tool: Tool;
};

type SetPenTypePayload = {
  penType: PenType;
};

type SetPenColorPayload = {
  color: string;
};

type SetPenWidthPayload = {
  width: number;
};

type SetPenOpacityPayload = {
  opacity: number;
};

type SetLaserTypePayload = {
  laserType: LaserType;
};

type SetLaserColorPayload = {
  color: string;
};

type SetLaserWidthPayload = {
  width: number;
};

type SetPlaybackSpeedPayload = {
  speed: number;
};

type SetAutoPlayDelayPayload = {
  delayMs: number;
};

type ToggleAutoPlayPayload = {
  value?: boolean;
};

type TogglePausePayload = {
  value?: boolean;
};

type EmptyPayload = Record<string, never>;

type GoToStepPayload = {
  step: number;
};

type GoToPagePayload = {
  pageId: string;
};

type InsertBreakPayload = {
  type: "line" | "column" | "page";
  panelOpen?: boolean;
};

type ImportStepBlocksPayload = {
  blocks: StepBlock[];
};

type SetInsertionIndexPayload = {
  index: number;
};

type SetAnimationModInputPayload = {
  input: ModInput | null;
};

const VALID_BLOCK_KINDS = new Set<StepBlockKind>([
  "content",
  "line-break",
  "column-break",
  "page-break",
]);
const VALID_SEGMENT_TYPES = new Set<StepSegment["type"]>([
  "text",
  "image",
  "video",
]);
const STYLE_KEYS: Array<keyof TextSegmentStyle> = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "color",
];
const STYLE_KEY_SET = new Set<string>(STYLE_KEYS);
const VALID_TOOLS = new Set<Tool>(["pen", "eraser", "laser", "hand", "text"]);
const VALID_PEN_TYPES = new Set<PenType>(["ink", "pencil", "highlighter"]);
const VALID_LASER_TYPES = new Set<LaserType>(["standard", "highlighter"]);
const VALID_INSERT_BREAK_TYPES = new Set<InsertBreakPayload["type"]>([
  "line",
  "column",
  "page",
]);
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const PEN_WIDTH_MIN = 0.5;
const PEN_WIDTH_MAX = 200;
const PEN_OPACITY_MIN = 0;
const PEN_OPACITY_MAX = 100;
const LASER_WIDTH_MIN = 0.5;
const LASER_WIDTH_MAX = 200;
const PLAYBACK_SPEED_MIN = 0.1;
const PLAYBACK_SPEED_MAX = 2;
const AUTO_PLAY_DELAY_MIN_MS = 300;
const AUTO_PLAY_DELAY_MAX_MS = 3000;

const failValidation = <TPayload>(
  code: string,
  error: string
): AppCommandPayloadValidationResult<TPayload> => ({
  ok: false,
  code,
  error,
});

const okValidation = <TPayload>(
  value: TPayload
): AppCommandPayloadValidationResult<TPayload> => ({
  ok: true,
  value,
});

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value >= 0;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const isJsonSafe = (value: unknown, seen = new WeakSet<object>()): boolean => {
  if (value === null) return true;
  if (typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);

  if (Array.isArray(value)) {
    return value.every((item) => isJsonSafe(item, seen));
  }

  if (!isPlainRecord(value)) return false;
  if (seen.has(value)) return false;
  seen.add(value);

  for (const nestedValue of Object.values(value)) {
    if (nestedValue === undefined) {
      seen.delete(value);
      return false;
    }
    if (!isJsonSafe(nestedValue, seen)) {
      seen.delete(value);
      return false;
    }
  }

  seen.delete(value);
  return true;
};

const isNumberInRange = (value: unknown, min: number, max: number): value is number =>
  isFiniteNumber(value) && value >= min && value <= max;

const normalizeHexColor = (value: string): string => value.trim().toUpperCase();

const validatePayloadObject = (
  payload: unknown,
  options: {
    allowedKeys: readonly string[];
    allowUndefined?: boolean;
  }
): AppCommandPayloadValidationResult<Record<string, unknown>> => {
  if ((payload === undefined || payload === null) && options.allowUndefined) {
    return okValidation({});
  }

  if (!isPlainRecord(payload)) {
    return failValidation("invalid-payload-root", "payload must be an object.");
  }
  if (!isJsonSafe(payload)) {
    return failValidation(
      "invalid-payload-json-safe",
      "payload must contain JSON-safe values only."
    );
  }

  const allowedKeySet = new Set(options.allowedKeys);
  const unsupportedKey = Object.keys(payload).find((key) => !allowedKeySet.has(key));
  if (unsupportedKey) {
    return failValidation(
      "invalid-payload-property",
      `payload.${unsupportedKey} is not supported.`
    );
  }

  return okValidation(payload);
};

const validateEmptyPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<EmptyPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: [],
    allowUndefined: true,
  });
  if (!payloadValidation.ok) return payloadValidation;
  return okValidation({});
};

const validateModInputValue = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<ModInput | null> => {
  if (value === null) {
    return okValidation(null);
  }
  if (!isPlainRecord(value)) {
    return failValidation(
      "invalid-mod-input",
      `${path} must be an object or null.`
    );
  }

  const allowedKeys = new Set(["format", "payload"]);
  const unsupportedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupportedKey) {
    return failValidation(
      "invalid-mod-input-property",
      `${path}.${unsupportedKey} is not supported.`
    );
  }

  if (!isNonEmptyString(value.format)) {
    return failValidation(
      "invalid-mod-input-format",
      `${path}.format must be a non-empty string.`
    );
  }
  const format = value.format.trim();

  const payloadValue = value.payload ?? null;
  if (!isJsonSafe(payloadValue)) {
    return failValidation(
      "invalid-mod-input-payload",
      `${path}.payload must be JSON-safe.`
    );
  }

  return okValidation({
    format,
    payload: payloadValue,
  });
};

const cloneModInput = (input: ModInput | null): ModInput | null => {
  if (!input) return null;
  return {
    format: input.format,
    payload: input.payload,
  };
};

const cloneStepSegment = (segment: StepSegment): StepSegment => {
  if (segment.type === "text") {
    return {
      ...segment,
      ...(segment.style ? { style: { ...segment.style } } : {}),
    };
  }
  return { ...segment };
};

const cloneStepBlock = (block: StepBlock): StepBlock => ({
  id: block.id,
  ...(block.kind ? { kind: block.kind } : {}),
  segments: block.segments.map((segment) => cloneStepSegment(segment)),
});

const syncDocFromCanvas = (): void => {
  useDocStore.getState().syncFromCanvas(useCanvasStore.getState());
};

const commitStepBlocks = (blocks: StepBlock[]): void => {
  const canvas = useCanvasStore.getState();
  canvas.importStepBlocks(blocks.map((block) => cloneStepBlock(block)));
  syncDocFromCanvas();
};

const validateTextStyle = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<TextSegmentStyle | undefined> => {
  if (value === undefined) {
    return okValidation(undefined);
  }
  if (!isPlainRecord(value)) {
    return failValidation(
      "invalid-segment-style",
      `${path} must be an object when provided.`
    );
  }

  const unsupportedKey = Object.keys(value).find((key) => !STYLE_KEY_SET.has(key));
  if (unsupportedKey) {
    return failValidation(
      "invalid-segment-style-key",
      `${path}.${unsupportedKey} is not supported.`
    );
  }

  const nextStyle: TextSegmentStyle = {};
  for (const key of STYLE_KEYS) {
    const styleValue = value[key];
    if (styleValue === undefined) continue;
    if (typeof styleValue !== "string") {
      return failValidation(
        "invalid-segment-style-value",
        `${path}.${key} must be a string when provided.`
      );
    }
    nextStyle[key] = styleValue;
  }

  return okValidation(nextStyle);
};

const validateStepSegment = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<StepSegment> => {
  if (!isPlainRecord(value)) {
    return failValidation("invalid-segment", `${path} must be an object.`);
  }

  if (!isNonEmptyString(value.id)) {
    return failValidation(
      "invalid-segment-id",
      `${path}.id must be a non-empty string.`
    );
  }
  const segmentId = value.id.trim();

  if (!VALID_SEGMENT_TYPES.has(value.type as StepSegment["type"])) {
    return failValidation(
      "invalid-segment-type",
      `${path}.type must be one of text/image/video.`
    );
  }
  const segmentType = value.type as StepSegment["type"];

  if (!isNonNegativeInteger(value.orderIndex)) {
    return failValidation(
      "invalid-segment-order",
      `${path}.orderIndex must be a non-negative integer.`
    );
  }
  const orderIndex = value.orderIndex;

  if (segmentType === "text") {
    if (typeof value.html !== "string") {
      return failValidation(
        "invalid-segment-html",
        `${path}.html must be a string for text segments.`
      );
    }
    const styleValidation = validateTextStyle(value.style, `${path}.style`);
    if (!styleValidation.ok) return styleValidation;

    return okValidation({
      id: segmentId,
      type: "text",
      html: value.html,
      ...(styleValidation.value ? { style: styleValidation.value } : {}),
      orderIndex,
    });
  }

  if (!isNonEmptyString(value.src)) {
    return failValidation(
      "invalid-segment-src",
      `${path}.src must be a non-empty string for media segments.`
    );
  }
  const src = value.src.trim();

  if (segmentType === "image") {
    if (!isPositiveFiniteNumber(value.width) || !isPositiveFiniteNumber(value.height)) {
      return failValidation(
        "invalid-image-size",
        `${path}.width and ${path}.height must be positive finite numbers.`
      );
    }
    return okValidation({
      id: segmentId,
      type: "image",
      src,
      width: value.width,
      height: value.height,
      orderIndex,
    });
  }

  const width = value.width;
  const height = value.height;
  if (width !== undefined && !isPositiveFiniteNumber(width)) {
    return failValidation(
      "invalid-video-width",
      `${path}.width must be a positive finite number when provided.`
    );
  }
  if (height !== undefined && !isPositiveFiniteNumber(height)) {
    return failValidation(
      "invalid-video-height",
      `${path}.height must be a positive finite number when provided.`
    );
  }
  return okValidation({
    id: segmentId,
    type: "video",
    src,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    orderIndex,
  });
};

const validateStepBlock = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<StepBlock> => {
  if (!isPlainRecord(value)) {
    return failValidation("invalid-block", `${path} must be an object.`);
  }

  if (!isNonEmptyString(value.id)) {
    return failValidation(
      "invalid-block-id",
      `${path}.id must be a non-empty string.`
    );
  }
  const blockId = value.id.trim();

  let blockKind: StepBlockKind | undefined;
  if (value.kind !== undefined) {
    if (!VALID_BLOCK_KINDS.has(value.kind as StepBlockKind)) {
      return failValidation(
        "invalid-block-kind",
        `${path}.kind must be one of content/line-break/column-break/page-break.`
      );
    }
    blockKind = value.kind as StepBlockKind;
  }

  if (!Array.isArray(value.segments)) {
    return failValidation(
      "invalid-block-segments",
      `${path}.segments must be an array.`
    );
  }

  const segments: StepSegment[] = [];
  for (let index = 0; index < value.segments.length; index += 1) {
    const segmentValidation = validateStepSegment(
      value.segments[index],
      `${path}.segments[${index}]`
    );
    if (!segmentValidation.ok) return segmentValidation;
    segments.push(segmentValidation.value);
  }

  return okValidation({
    id: blockId,
    ...(blockKind ? { kind: blockKind } : {}),
    segments,
  });
};

const resolveInsertIndex = (index: number | undefined, max: number): number => {
  if (index === undefined) return max;
  return Math.max(0, Math.min(index, max));
};

const validateInsertBlockPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<InsertBlockPayload> => {
  if (!isPlainRecord(payload)) {
    return failValidation("invalid-payload-root", "payload must be an object.");
  }
  if (!isJsonSafe(payload)) {
    return failValidation(
      "invalid-payload-json-safe",
      "payload must contain JSON-safe values only."
    );
  }

  const blockValidation = validateStepBlock(payload.block, "payload.block");
  if (!blockValidation.ok) return blockValidation;

  let index: number | undefined;
  if (payload.index !== undefined) {
    if (!isNonNegativeInteger(payload.index)) {
      return failValidation(
        "invalid-payload-index",
        "payload.index must be a non-negative integer when provided."
      );
    }
    index = payload.index;
  }

  return okValidation({
    block: blockValidation.value,
    ...(index !== undefined ? { index } : {}),
  });
};

const validateUpdateBlockPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<UpdateBlockPayload> => {
  if (!isPlainRecord(payload)) {
    return failValidation("invalid-payload-root", "payload must be an object.");
  }
  if (!isJsonSafe(payload)) {
    return failValidation(
      "invalid-payload-json-safe",
      "payload must contain JSON-safe values only."
    );
  }
  if (!isNonEmptyString(payload.blockId)) {
    return failValidation(
      "invalid-payload-block-id",
      "payload.blockId must be a non-empty string."
    );
  }

  const blockValidation = validateStepBlock(payload.block, "payload.block");
  if (!blockValidation.ok) return blockValidation;

  const blockId = payload.blockId.trim();
  if (blockValidation.value.id !== blockId) {
    return failValidation(
      "invalid-payload-block-id-mismatch",
      "payload.blockId must match payload.block.id."
    );
  }

  return okValidation({
    blockId,
    block: blockValidation.value,
  });
};

const validateDeleteBlockPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<DeleteBlockPayload> => {
  if (!isPlainRecord(payload)) {
    return failValidation("invalid-payload-root", "payload must be an object.");
  }
  if (!isJsonSafe(payload)) {
    return failValidation(
      "invalid-payload-json-safe",
      "payload must contain JSON-safe values only."
    );
  }
  if (!isNonEmptyString(payload.blockId)) {
    return failValidation(
      "invalid-payload-block-id",
      "payload.blockId must be a non-empty string."
    );
  }
  return okValidation({
    blockId: payload.blockId.trim(),
  });
};

const validateSetToolPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetToolPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["tool"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.tool)) {
    return failValidation(
      "invalid-payload-tool",
      "payload.tool must be a non-empty string."
    );
  }
  const tool = payloadValidation.value.tool.trim() as Tool;
  if (!VALID_TOOLS.has(tool)) {
    return failValidation(
      "invalid-payload-tool-value",
      "payload.tool must be one of pen/eraser/laser/hand/text."
    );
  }
  return okValidation({ tool });
};

const validateSetPenTypePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPenTypePayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["penType"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.penType)) {
    return failValidation(
      "invalid-payload-pen-type",
      "payload.penType must be a non-empty string."
    );
  }
  const penType = payloadValidation.value.penType.trim() as PenType;
  if (!VALID_PEN_TYPES.has(penType)) {
    return failValidation(
      "invalid-payload-pen-type-value",
      "payload.penType must be one of ink/pencil/highlighter."
    );
  }
  return okValidation({ penType });
};

const validateSetPenColorPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPenColorPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["color"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.color)) {
    return failValidation(
      "invalid-payload-pen-color",
      "payload.color must be a non-empty string."
    );
  }
  const color = normalizeHexColor(payloadValidation.value.color);
  if (!HEX_COLOR_PATTERN.test(color)) {
    return failValidation(
      "invalid-payload-pen-color-value",
      "payload.color must be a 6-digit hex color (#RRGGBB)."
    );
  }
  return okValidation({ color });
};

const validateSetPenWidthPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPenWidthPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["width"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNumberInRange(payloadValidation.value.width, PEN_WIDTH_MIN, PEN_WIDTH_MAX)) {
    return failValidation(
      "invalid-payload-pen-width",
      `payload.width must be between ${PEN_WIDTH_MIN} and ${PEN_WIDTH_MAX}.`
    );
  }
  return okValidation({ width: payloadValidation.value.width });
};

const validateSetPenOpacityPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPenOpacityPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["opacity"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    !isNumberInRange(
      payloadValidation.value.opacity,
      PEN_OPACITY_MIN,
      PEN_OPACITY_MAX
    )
  ) {
    return failValidation(
      "invalid-payload-pen-opacity",
      `payload.opacity must be between ${PEN_OPACITY_MIN} and ${PEN_OPACITY_MAX}.`
    );
  }
  return okValidation({ opacity: payloadValidation.value.opacity });
};

const validateSetLaserTypePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetLaserTypePayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["laserType"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.laserType)) {
    return failValidation(
      "invalid-payload-laser-type",
      "payload.laserType must be a non-empty string."
    );
  }
  const laserType = payloadValidation.value.laserType.trim() as LaserType;
  if (!VALID_LASER_TYPES.has(laserType)) {
    return failValidation(
      "invalid-payload-laser-type-value",
      "payload.laserType must be one of standard/highlighter."
    );
  }
  return okValidation({ laserType });
};

const validateSetLaserColorPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetLaserColorPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["color"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.color)) {
    return failValidation(
      "invalid-payload-laser-color",
      "payload.color must be a non-empty string."
    );
  }
  const color = normalizeHexColor(payloadValidation.value.color);
  if (!HEX_COLOR_PATTERN.test(color)) {
    return failValidation(
      "invalid-payload-laser-color-value",
      "payload.color must be a 6-digit hex color (#RRGGBB)."
    );
  }
  return okValidation({ color });
};

const validateSetLaserWidthPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetLaserWidthPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["width"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    !isNumberInRange(payloadValidation.value.width, LASER_WIDTH_MIN, LASER_WIDTH_MAX)
  ) {
    return failValidation(
      "invalid-payload-laser-width",
      `payload.width must be between ${LASER_WIDTH_MIN} and ${LASER_WIDTH_MAX}.`
    );
  }
  return okValidation({ width: payloadValidation.value.width });
};

const validateSetPlaybackSpeedPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPlaybackSpeedPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["speed"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    !isNumberInRange(
      payloadValidation.value.speed,
      PLAYBACK_SPEED_MIN,
      PLAYBACK_SPEED_MAX
    )
  ) {
    return failValidation(
      "invalid-payload-playback-speed",
      `payload.speed must be between ${PLAYBACK_SPEED_MIN} and ${PLAYBACK_SPEED_MAX}.`
    );
  }
  return okValidation({ speed: payloadValidation.value.speed });
};

const validateSetAutoPlayDelayPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetAutoPlayDelayPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["delayMs"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    !isNumberInRange(
      payloadValidation.value.delayMs,
      AUTO_PLAY_DELAY_MIN_MS,
      AUTO_PLAY_DELAY_MAX_MS
    )
  ) {
    return failValidation(
      "invalid-payload-auto-play-delay",
      `payload.delayMs must be between ${AUTO_PLAY_DELAY_MIN_MS} and ${AUTO_PLAY_DELAY_MAX_MS}.`
    );
  }
  return okValidation({ delayMs: payloadValidation.value.delayMs });
};

const validateToggleAutoPlayPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<ToggleAutoPlayPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["value"],
    allowUndefined: true,
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (payloadValidation.value.value === undefined) {
    return okValidation({});
  }
  if (typeof payloadValidation.value.value !== "boolean") {
    return failValidation(
      "invalid-payload-toggle-auto-play-value",
      "payload.value must be a boolean when provided."
    );
  }
  return okValidation({ value: payloadValidation.value.value });
};

const validateTogglePausePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<TogglePausePayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["value"],
    allowUndefined: true,
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (payloadValidation.value.value === undefined) {
    return okValidation({});
  }
  if (typeof payloadValidation.value.value !== "boolean") {
    return failValidation(
      "invalid-payload-toggle-pause-value",
      "payload.value must be a boolean when provided."
    );
  }
  return okValidation({ value: payloadValidation.value.value });
};

const validateGoToStepPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<GoToStepPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["step"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonNegativeInteger(payloadValidation.value.step)) {
    return failValidation(
      "invalid-payload-go-to-step",
      "payload.step must be a non-negative integer."
    );
  }
  return okValidation({ step: payloadValidation.value.step });
};

const validateGoToPagePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<GoToPagePayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["pageId"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.pageId)) {
    return failValidation(
      "invalid-payload-go-to-page",
      "payload.pageId must be a non-empty string."
    );
  }
  return okValidation({ pageId: payloadValidation.value.pageId.trim() });
};

const validateInsertBreakPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<InsertBreakPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["type", "panelOpen"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.type)) {
    return failValidation(
      "invalid-payload-insert-break-type",
      "payload.type must be a non-empty string."
    );
  }

  const type = payloadValidation.value.type.trim() as InsertBreakPayload["type"];
  if (!VALID_INSERT_BREAK_TYPES.has(type)) {
    return failValidation(
      "invalid-payload-insert-break-type-value",
      "payload.type must be one of line/column/page."
    );
  }

  const panelOpen = payloadValidation.value.panelOpen;
  if (panelOpen !== undefined && typeof panelOpen !== "boolean") {
    return failValidation(
      "invalid-payload-insert-break-panel-open",
      "payload.panelOpen must be a boolean when provided."
    );
  }

  return okValidation({
    type,
    ...(panelOpen !== undefined ? { panelOpen } : {}),
  });
};

const validateImportStepBlocksPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<ImportStepBlocksPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["blocks"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!Array.isArray(payloadValidation.value.blocks)) {
    return failValidation(
      "invalid-payload-import-step-blocks",
      "payload.blocks must be an array."
    );
  }

  const blocks: StepBlock[] = [];
  const blockIds = new Set<string>();
  for (let index = 0; index < payloadValidation.value.blocks.length; index += 1) {
    const blockValidation = validateStepBlock(
      payloadValidation.value.blocks[index],
      `payload.blocks[${index}]`
    );
    if (!blockValidation.ok) return blockValidation;
    if (blockIds.has(blockValidation.value.id)) {
      return failValidation(
        "invalid-payload-import-step-blocks-duplicate-id",
        `payload.blocks[${index}].id duplicates an existing block id.`
      );
    }
    blockIds.add(blockValidation.value.id);
    blocks.push(blockValidation.value);
  }

  return okValidation({ blocks });
};

const validateSetInsertionIndexPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetInsertionIndexPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["index"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonNegativeInteger(payloadValidation.value.index)) {
    return failValidation(
      "invalid-payload-set-insertion-index",
      "payload.index must be a non-negative integer."
    );
  }
  return okValidation({ index: payloadValidation.value.index });
};

const validateSetAnimationModInputPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetAnimationModInputPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["input"],
  });
  if (!payloadValidation.ok) return payloadValidation;
  const inputValidation = validateModInputValue(
    payloadValidation.value.input,
    "payload.input"
  );
  if (!inputValidation.ok) return inputValidation;
  return okValidation({ input: inputValidation.value });
};

const executeInsertBlock = (payload: InsertBlockPayload) => {
  const currentBlocks = useCanvasStore
    .getState()
    .stepBlocks.map((block) => cloneStepBlock(block));
  const insertIndex = resolveInsertIndex(payload.index, currentBlocks.length);
  const nextBlocks = [...currentBlocks];
  nextBlocks.splice(insertIndex, 0, cloneStepBlock(payload.block));
  commitStepBlocks(nextBlocks);
  return {
    blockId: payload.block.id,
    index: insertIndex,
    totalBlocks: nextBlocks.length,
  };
};

const executeUpdateBlock = (payload: UpdateBlockPayload) => {
  const currentBlocks = useCanvasStore
    .getState()
    .stepBlocks.map((block) => cloneStepBlock(block));
  const targetIndex = currentBlocks.findIndex((block) => block.id === payload.blockId);
  if (targetIndex < 0) {
    throw new Error(`block '${payload.blockId}' was not found.`);
  }
  const nextBlocks = [...currentBlocks];
  nextBlocks[targetIndex] = cloneStepBlock(payload.block);
  commitStepBlocks(nextBlocks);
  return {
    blockId: payload.blockId,
    index: targetIndex,
    totalBlocks: nextBlocks.length,
  };
};

const executeDeleteBlock = (payload: DeleteBlockPayload) => {
  const currentBlocks = useCanvasStore
    .getState()
    .stepBlocks.map((block) => cloneStepBlock(block));
  const targetIndex = currentBlocks.findIndex((block) => block.id === payload.blockId);
  if (targetIndex < 0) {
    throw new Error(`block '${payload.blockId}' was not found.`);
  }

  const nextBlocks = currentBlocks.filter((block) => block.id !== payload.blockId);
  commitStepBlocks(nextBlocks);
  return {
    blockId: payload.blockId,
    index: targetIndex,
    totalBlocks: nextBlocks.length,
  };
};

const executeSetTool = (payload: SetToolPayload) => {
  const ui = useUIStore.getState();
  ui.setTool(payload.tool);
  return {
    tool: useUIStore.getState().activeTool,
  };
};

const executeSetPenType = (payload: SetPenTypePayload) => {
  const ui = useUIStore.getState();
  ui.setPenType(payload.penType);
  const next = useUIStore.getState();
  return {
    penType: next.penType,
    penColor: next.penColor,
    penWidth: next.penWidth,
    penOpacity: next.penOpacity,
  };
};

const executeSetPenColor = (payload: SetPenColorPayload) => {
  const ui = useUIStore.getState();
  ui.setColor(payload.color);
  return {
    penColor: useUIStore.getState().penColor,
  };
};

const executeSetPenWidth = (payload: SetPenWidthPayload) => {
  const ui = useUIStore.getState();
  ui.setPenWidth(payload.width);
  return {
    penWidth: useUIStore.getState().penWidth,
  };
};

const executeSetPenOpacity = (payload: SetPenOpacityPayload) => {
  const ui = useUIStore.getState();
  ui.setPenOpacity(payload.opacity);
  return {
    penOpacity: useUIStore.getState().penOpacity,
  };
};

const executeSetLaserType = (payload: SetLaserTypePayload) => {
  const ui = useUIStore.getState();
  ui.setLaserType(payload.laserType);
  const next = useUIStore.getState();
  return {
    laserType: next.laserType,
    laserColor: next.laserColor,
    laserWidth: next.laserWidth,
  };
};

const executeSetLaserColor = (payload: SetLaserColorPayload) => {
  const ui = useUIStore.getState();
  ui.setLaserColor(payload.color);
  return {
    laserColor: useUIStore.getState().laserColor,
  };
};

const executeSetLaserWidth = (payload: SetLaserWidthPayload) => {
  const ui = useUIStore.getState();
  ui.setLaserWidth(payload.width);
  return {
    laserWidth: useUIStore.getState().laserWidth,
  };
};

const executeSetPlaybackSpeed = (payload: SetPlaybackSpeedPayload) => {
  const ui = useUIStore.getState();
  ui.setPlaybackSpeed(payload.speed);
  return {
    playbackSpeed: useUIStore.getState().playbackSpeed,
  };
};

const executeSetAutoPlayDelay = (payload: SetAutoPlayDelayPayload) => {
  const ui = useUIStore.getState();
  ui.setAutoPlayDelay(payload.delayMs);
  return {
    autoPlayDelayMs: useUIStore.getState().autoPlayDelayMs,
  };
};

const executeToggleAutoPlay = (payload: ToggleAutoPlayPayload) => {
  const ui = useUIStore.getState();
  if (payload.value === undefined) {
    ui.toggleAutoPlay();
  } else {
    ui.setAutoPlay(payload.value);
  }
  return {
    isAutoPlay: useUIStore.getState().isAutoPlay,
  };
};

const executeTogglePause = (payload: TogglePausePayload) => {
  const ui = useUIStore.getState();
  if (payload.value === undefined) {
    ui.togglePause();
  } else {
    ui.setPaused(payload.value);
  }
  return {
    isPaused: useUIStore.getState().isPaused,
  };
};

const executeTriggerPlay = () => {
  const ui = useUIStore.getState();
  ui.triggerPlay();
  const next = useUIStore.getState();
  return {
    playSignal: next.playSignal,
    isAnimating: next.isAnimating,
  };
};

const executeTriggerStop = () => {
  const ui = useUIStore.getState();
  ui.triggerStop();
  return {
    stopSignal: useUIStore.getState().stopSignal,
  };
};

const executeTriggerSkip = () => {
  const ui = useUIStore.getState();
  ui.triggerSkip();
  return {
    skipSignal: useUIStore.getState().skipSignal,
  };
};

const executeNextStep = () => {
  const canvas = useCanvasStore.getState();
  canvas.nextStep();
  const next = useCanvasStore.getState();
  return {
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};

const executePrevStep = () => {
  const canvas = useCanvasStore.getState();
  canvas.prevStep();
  const next = useCanvasStore.getState();
  return {
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};

const executeGoToStep = (payload: GoToStepPayload) => {
  const canvas = useCanvasStore.getState();
  canvas.goToStep(payload.step);
  const next = useCanvasStore.getState();
  return {
    requestedStep: payload.step,
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};

const executeNextPage = () => {
  const canvas = useCanvasStore.getState();
  canvas.nextPage();
  const next = useCanvasStore.getState();
  return {
    currentPageId: next.currentPageId,
    totalPages: next.pageOrder.length,
  };
};

const executePrevPage = () => {
  const canvas = useCanvasStore.getState();
  canvas.prevPage();
  const next = useCanvasStore.getState();
  return {
    currentPageId: next.currentPageId,
    totalPages: next.pageOrder.length,
  };
};

const executeGoToPage = (payload: GoToPagePayload) => {
  const canvas = useCanvasStore.getState();
  if (!canvas.pageOrder.includes(payload.pageId)) {
    throw new Error(`page '${payload.pageId}' was not found.`);
  }
  canvas.goToPage(payload.pageId);
  return {
    currentPageId: useCanvasStore.getState().currentPageId,
  };
};

const executeInsertBreak = (payload: InsertBreakPayload) => {
  const canvas = useCanvasStore.getState();
  canvas.insertBreak(
    payload.type,
    payload.panelOpen === undefined ? undefined : { panelOpen: payload.panelOpen }
  );
  syncDocFromCanvas();
  const next = useCanvasStore.getState();
  return {
    type: payload.type,
    totalBlocks: next.stepBlocks.length,
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};

const executeImportStepBlocks = (payload: ImportStepBlocksPayload) => {
  commitStepBlocks(payload.blocks);
  const next = useCanvasStore.getState();
  return {
    totalBlocks: next.stepBlocks.length,
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};

const executeSetInsertionIndex = (payload: SetInsertionIndexPayload) => {
  const canvas = useCanvasStore.getState();
  canvas.setInsertionIndex(payload.index);
  syncDocFromCanvas();
  return {
    insertionIndex: useCanvasStore.getState().insertionIndex,
  };
};

const executeSetAnimationModInput = (payload: SetAnimationModInputPayload) => {
  const canvas = useCanvasStore.getState();
  canvas.setAnimationModInput(cloneModInput(payload.input));
  syncDocFromCanvas();
  const next = useCanvasStore.getState();
  return {
    hasInput: next.animationModInput !== null,
    format: next.animationModInput?.format ?? null,
  };
};

const executeClearAllAudio = () => {
  const canvas = useCanvasStore.getState();
  canvas.clearAllAudio();
  syncDocFromCanvas();
  return {
    totalAudio: Object.keys(useCanvasStore.getState().audioByStep).length,
  };
};

const insertBlockCommand: AppCommand<
  InsertBlockPayload,
  { blockId: string; index: number; totalBlocks: number }
> = {
  id: "insertBlock",
  description: "Insert a step block into the current document timeline.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.insert-block",
  schema: {
    type: "object",
    required: ["block"],
    properties: {
      block: { type: "StepBlock" },
      index: { type: "number", minimum: 0, integer: true },
    },
    additionalProperties: false,
  },
  validatePayload: validateInsertBlockPayload,
  execute: executeInsertBlock,
};

const updateBlockCommand: AppCommand<
  UpdateBlockPayload,
  { blockId: string; index: number; totalBlocks: number }
> = {
  id: "updateBlock",
  description: "Replace an existing step block by id.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.update-block",
  schema: {
    type: "object",
    required: ["blockId", "block"],
    properties: {
      blockId: { type: "string" },
      block: { type: "StepBlock" },
    },
    additionalProperties: false,
  },
  validatePayload: validateUpdateBlockPayload,
  execute: executeUpdateBlock,
};

const deleteBlockCommand: AppCommand<
  DeleteBlockPayload,
  { blockId: string; index: number; totalBlocks: number }
> = {
  id: "deleteBlock",
  description: "Delete an existing step block by id.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.delete-block",
  schema: {
    type: "object",
    required: ["blockId"],
    properties: {
      blockId: { type: "string" },
    },
    additionalProperties: false,
  },
  validatePayload: validateDeleteBlockPayload,
  execute: executeDeleteBlock,
};

const EMPTY_OBJECT_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

const setToolCommand: AppCommand<SetToolPayload, { tool: Tool }> = {
  id: "setTool",
  description: "Set active drawing tool.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-tool",
  schema: {
    type: "object",
    required: ["tool"],
    properties: {
      tool: { type: "string", enum: ["pen", "eraser", "laser", "hand", "text"] },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetToolPayload,
  execute: executeSetTool,
};

const setPenTypeCommand: AppCommand<
  SetPenTypePayload,
  { penType: PenType; penColor: string; penWidth: number; penOpacity: number }
> = {
  id: "setPenType",
  description: "Set pen type and apply dependent defaults.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-pen-type",
  schema: {
    type: "object",
    required: ["penType"],
    properties: {
      penType: { type: "string", enum: ["ink", "pencil", "highlighter"] },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetPenTypePayload,
  execute: executeSetPenType,
};

const setPenColorCommand: AppCommand<SetPenColorPayload, { penColor: string }> = {
  id: "setPenColor",
  description: "Set pen color.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-pen-color",
  schema: {
    type: "object",
    required: ["color"],
    properties: {
      color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetPenColorPayload,
  execute: executeSetPenColor,
};

const setPenWidthCommand: AppCommand<SetPenWidthPayload, { penWidth: number }> = {
  id: "setPenWidth",
  description: "Set pen width.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-pen-width",
  schema: {
    type: "object",
    required: ["width"],
    properties: {
      width: { type: "number", minimum: PEN_WIDTH_MIN, maximum: PEN_WIDTH_MAX },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetPenWidthPayload,
  execute: executeSetPenWidth,
};

const setPenOpacityCommand: AppCommand<
  SetPenOpacityPayload,
  { penOpacity: number }
> = {
  id: "setPenOpacity",
  description: "Set pen opacity percentage.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-pen-opacity",
  schema: {
    type: "object",
    required: ["opacity"],
    properties: {
      opacity: { type: "number", minimum: PEN_OPACITY_MIN, maximum: PEN_OPACITY_MAX },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetPenOpacityPayload,
  execute: executeSetPenOpacity,
};

const setLaserTypeCommand: AppCommand<
  SetLaserTypePayload,
  { laserType: LaserType; laserColor: string; laserWidth: number }
> = {
  id: "setLaserType",
  description: "Set laser type and apply dependent defaults.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-laser-type",
  schema: {
    type: "object",
    required: ["laserType"],
    properties: {
      laserType: { type: "string", enum: ["standard", "highlighter"] },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetLaserTypePayload,
  execute: executeSetLaserType,
};

const setLaserColorCommand: AppCommand<
  SetLaserColorPayload,
  { laserColor: string }
> = {
  id: "setLaserColor",
  description: "Set laser color.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-laser-color",
  schema: {
    type: "object",
    required: ["color"],
    properties: {
      color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetLaserColorPayload,
  execute: executeSetLaserColor,
};

const setLaserWidthCommand: AppCommand<
  SetLaserWidthPayload,
  { laserWidth: number }
> = {
  id: "setLaserWidth",
  description: "Set laser width.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-laser-width",
  schema: {
    type: "object",
    required: ["width"],
    properties: {
      width: { type: "number", minimum: LASER_WIDTH_MIN, maximum: LASER_WIDTH_MAX },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetLaserWidthPayload,
  execute: executeSetLaserWidth,
};

const setPlaybackSpeedCommand: AppCommand<
  SetPlaybackSpeedPayload,
  { playbackSpeed: number }
> = {
  id: "setPlaybackSpeed",
  description: "Set playback speed multiplier.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.set-playback-speed",
  schema: {
    type: "object",
    required: ["speed"],
    properties: {
      speed: {
        type: "number",
        minimum: PLAYBACK_SPEED_MIN,
        maximum: PLAYBACK_SPEED_MAX,
      },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetPlaybackSpeedPayload,
  execute: executeSetPlaybackSpeed,
};

const setAutoPlayDelayCommand: AppCommand<
  SetAutoPlayDelayPayload,
  { autoPlayDelayMs: number }
> = {
  id: "setAutoPlayDelay",
  description: "Set auto-play delay in milliseconds.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.set-auto-play-delay",
  schema: {
    type: "object",
    required: ["delayMs"],
    properties: {
      delayMs: {
        type: "number",
        minimum: AUTO_PLAY_DELAY_MIN_MS,
        maximum: AUTO_PLAY_DELAY_MAX_MS,
      },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetAutoPlayDelayPayload,
  execute: executeSetAutoPlayDelay,
};

const toggleAutoPlayCommand: AppCommand<
  ToggleAutoPlayPayload,
  { isAutoPlay: boolean }
> = {
  id: "toggleAutoPlay",
  description: "Toggle auto-play mode or set a specific value.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.toggle-auto-play",
  schema: {
    type: "object",
    properties: {
      value: { type: "boolean" },
    },
    additionalProperties: false,
  },
  validatePayload: validateToggleAutoPlayPayload,
  execute: executeToggleAutoPlay,
};

const togglePauseCommand: AppCommand<TogglePausePayload, { isPaused: boolean }> = {
  id: "togglePause",
  description: "Toggle paused state or set a specific value.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.toggle-pause",
  schema: {
    type: "object",
    properties: {
      value: { type: "boolean" },
    },
    additionalProperties: false,
  },
  validatePayload: validateTogglePausePayload,
  execute: executeTogglePause,
};

const triggerPlayCommand: AppCommand<
  EmptyPayload,
  { playSignal: number; isAnimating: boolean }
> = {
  id: "triggerPlay",
  description: "Trigger playback start signal.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.trigger-play",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeTriggerPlay,
};

const triggerStopCommand: AppCommand<EmptyPayload, { stopSignal: number }> = {
  id: "triggerStop",
  description: "Trigger playback stop signal.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.trigger-stop",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeTriggerStop,
};

const triggerSkipCommand: AppCommand<EmptyPayload, { skipSignal: number }> = {
  id: "triggerSkip",
  description: "Trigger playback skip signal.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.trigger-skip",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeTriggerSkip,
};

const nextStepCommand: AppCommand<
  EmptyPayload,
  { currentStep: number; currentPageId: string }
> = {
  id: "nextStep",
  description: "Move to the next global step.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.next-step",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeNextStep,
};

const prevStepCommand: AppCommand<
  EmptyPayload,
  { currentStep: number; currentPageId: string }
> = {
  id: "prevStep",
  description: "Move to the previous global step.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.prev-step",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executePrevStep,
};

const goToStepCommand: AppCommand<
  GoToStepPayload,
  { requestedStep: number; currentStep: number; currentPageId: string }
> = {
  id: "goToStep",
  description: "Jump to a specific global step index.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.go-to-step",
  schema: {
    type: "object",
    required: ["step"],
    properties: {
      step: { type: "number", minimum: 0, integer: true },
    },
    additionalProperties: false,
  },
  validatePayload: validateGoToStepPayload,
  execute: executeGoToStep,
};

const nextPageCommand: AppCommand<
  EmptyPayload,
  { currentPageId: string; totalPages: number }
> = {
  id: "nextPage",
  description: "Move to the next page (create one if needed).",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.next-page",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeNextPage,
};

const prevPageCommand: AppCommand<
  EmptyPayload,
  { currentPageId: string; totalPages: number }
> = {
  id: "prevPage",
  description: "Move to the previous page.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.prev-page",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executePrevPage,
};

const goToPageCommand: AppCommand<GoToPagePayload, { currentPageId: string }> = {
  id: "goToPage",
  description: "Jump to a specific page id.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.go-to-page",
  schema: {
    type: "object",
    required: ["pageId"],
    properties: {
      pageId: { type: "string" },
    },
    additionalProperties: false,
  },
  validatePayload: validateGoToPagePayload,
  execute: executeGoToPage,
};

const insertBreakCommand: AppCommand<
  InsertBreakPayload,
  { type: InsertBreakPayload["type"]; totalBlocks: number; currentStep: number; currentPageId: string }
> = {
  id: "insertBreak",
  description: "Insert a line/column/page break block.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.insert-break",
  schema: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string", enum: ["line", "column", "page"] },
      panelOpen: { type: "boolean" },
    },
    additionalProperties: false,
  },
  validatePayload: validateInsertBreakPayload,
  execute: executeInsertBreak,
};

const importStepBlocksCommand: AppCommand<
  ImportStepBlocksPayload,
  { totalBlocks: number; currentStep: number; currentPageId: string }
> = {
  id: "importStepBlocks",
  description: "Import and replace current step blocks.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.import-step-blocks",
  schema: {
    type: "object",
    required: ["blocks"],
    properties: {
      blocks: { type: "array", items: { type: "StepBlock" } },
    },
    additionalProperties: false,
  },
  validatePayload: validateImportStepBlocksPayload,
  execute: executeImportStepBlocks,
};

const setInsertionIndexCommand: AppCommand<
  SetInsertionIndexPayload,
  { insertionIndex: number }
> = {
  id: "setInsertionIndex",
  description: "Set data-input insertion marker index.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.set-insertion-index",
  schema: {
    type: "object",
    required: ["index"],
    properties: {
      index: { type: "number", minimum: 0, integer: true },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetInsertionIndexPayload,
  execute: executeSetInsertionIndex,
};

const setAnimationModInputCommand: AppCommand<
  SetAnimationModInputPayload,
  { hasInput: boolean; format: string | null }
> = {
  id: "setAnimationModInput",
  description: "Set or clear animation mod input payload.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.set-animation-mod-input",
  schema: {
    type: "object",
    required: ["input"],
    properties: {
      input: { type: ["object", "null"] },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetAnimationModInputPayload,
  execute: executeSetAnimationModInput,
};

const clearAllAudioCommand: AppCommand<EmptyPayload, { totalAudio: number }> = {
  id: "clearAllAudio",
  description: "Clear all step audio mappings.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.clear-all-audio",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeClearAllAudio,
};

const registerOrThrow = <TPayload, TResult>(
  command: AppCommand<TPayload, TResult>
): void => {
  const registration = registerAppCommand(command as AppCommand<unknown, unknown>);
  if (!registration.ok) {
    throw new Error(
      `failed to register core command '${command.id}': ${registration.error}`
    );
  }
};

const CORE_COMMANDS: readonly AppCommand<unknown, unknown>[] = [
  insertBlockCommand as AppCommand<unknown, unknown>,
  updateBlockCommand as AppCommand<unknown, unknown>,
  deleteBlockCommand as AppCommand<unknown, unknown>,
  setToolCommand as AppCommand<unknown, unknown>,
  setPenTypeCommand as AppCommand<unknown, unknown>,
  setPenColorCommand as AppCommand<unknown, unknown>,
  setPenWidthCommand as AppCommand<unknown, unknown>,
  setPenOpacityCommand as AppCommand<unknown, unknown>,
  setLaserTypeCommand as AppCommand<unknown, unknown>,
  setLaserColorCommand as AppCommand<unknown, unknown>,
  setLaserWidthCommand as AppCommand<unknown, unknown>,
  setPlaybackSpeedCommand as AppCommand<unknown, unknown>,
  setAutoPlayDelayCommand as AppCommand<unknown, unknown>,
  toggleAutoPlayCommand as AppCommand<unknown, unknown>,
  togglePauseCommand as AppCommand<unknown, unknown>,
  triggerPlayCommand as AppCommand<unknown, unknown>,
  triggerStopCommand as AppCommand<unknown, unknown>,
  triggerSkipCommand as AppCommand<unknown, unknown>,
  nextStepCommand as AppCommand<unknown, unknown>,
  prevStepCommand as AppCommand<unknown, unknown>,
  goToStepCommand as AppCommand<unknown, unknown>,
  nextPageCommand as AppCommand<unknown, unknown>,
  prevPageCommand as AppCommand<unknown, unknown>,
  goToPageCommand as AppCommand<unknown, unknown>,
  insertBreakCommand as AppCommand<unknown, unknown>,
  importStepBlocksCommand as AppCommand<unknown, unknown>,
  setInsertionIndexCommand as AppCommand<unknown, unknown>,
  setAnimationModInputCommand as AppCommand<unknown, unknown>,
  clearAllAudioCommand as AppCommand<unknown, unknown>,
];

const EXPECTED_CORE_COMMAND_ID_SET = new Set<string>(
  (
    Object.values(COMMAND_MIGRATION_MAP) as ReadonlyArray<readonly string[]>
  ).flat()
);

const assertCoreCommandCoverage = (
  commands: readonly AppCommand<unknown, unknown>[]
): void => {
  const seenIds = new Set<string>();
  for (const command of commands) {
    if (seenIds.has(command.id)) {
      throw new Error(`duplicate core command registration id: '${command.id}'.`);
    }
    seenIds.add(command.id);
  }

  for (const expectedId of EXPECTED_CORE_COMMAND_ID_SET) {
    if (!seenIds.has(expectedId)) {
      throw new Error(`missing core command registration id: '${expectedId}'.`);
    }
  }

  for (const seenId of seenIds) {
    if (!EXPECTED_CORE_COMMAND_ID_SET.has(seenId)) {
      throw new Error(`unexpected core command registration id: '${seenId}'.`);
    }
  }
};

let hasRegisteredCoreCommands = false;

export const registerCoreCommands = (): void => {
  if (hasRegisteredCoreCommands) return;

  assertCoreCommandCoverage(CORE_COMMANDS);
  for (const command of CORE_COMMANDS) {
    registerOrThrow(command);
  }

  hasRegisteredCoreCommands = true;
};
