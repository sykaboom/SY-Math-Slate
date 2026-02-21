import {
  registerAppCommand,
  type AppCommand,
  type AppCommandPayloadValidationResult,
} from "@core/runtime/command/commandBus";
import type {
  StepBlock,
  StepBlockKind,
  StepSegment,
  TextSegmentStyle,
} from "@core/foundation/types/canvas";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useDocStore } from "@features/platform/store/useDocStore";
const canvasStore = useCanvasStore;
export type EmptyPayload = Record<string, never>;
type InsertBlockPayload = { block: StepBlock; index?: number };
type UpdateBlockPayload = { blockId: string; block: StepBlock };
type DeleteBlockPayload = { blockId: string };
export type ImportStepBlocksPayload = { blocks: StepBlock[] };
const VALID_BLOCK_KINDS = new Set<StepBlockKind>([
  "content",
  "line-break",
  "column-break",
  "page-break",
]);
const VALID_SEGMENT_TYPES = new Set<StepSegment["type"]>(["text", "image", "video"]);
const STYLE_KEYS: Array<keyof TextSegmentStyle> = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "color",
];
const STYLE_KEY_SET = new Set<string>(STYLE_KEYS);
export const failValidation = <TPayload>(
  code: string,
  error: string
): AppCommandPayloadValidationResult<TPayload> => ({ ok: false, code, error });
export const okValidation = <TPayload>(
  value: TPayload
): AppCommandPayloadValidationResult<TPayload> => ({ ok: true, value });
export const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export const isNonNegativeInteger = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
const isPositiveFiniteNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;
export const isJsonSafe = (value: unknown, seen = new WeakSet<object>()): boolean => {
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
export const validatePayloadObject = (
  payload: unknown,
  options: { allowedKeys: readonly string[]; allowUndefined?: boolean }
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
const cloneStepSegment = (segment: StepSegment): StepSegment => {
  if (segment.type === "text") {
    return {
      ...segment,
      ...(segment.style ? { style: { ...segment.style } } : {}),
    };
  }
  return { ...segment };
};
export const cloneStepBlock = (block: StepBlock): StepBlock => ({
  id: block.id,
  ...(block.kind ? { kind: block.kind } : {}),
  segments: block.segments.map((segment) => cloneStepSegment(segment)),
});
export const syncDocFromCanvas = (): void => {
  useDocStore.getState().syncFromCanvas(canvasStore.getState());
};
export const commitStepBlocks = (blocks: StepBlock[]): void => {
  const canvas = canvasStore.getState();
  canvas.importStepBlocks(blocks.map((block) => cloneStepBlock(block)));
  syncDocFromCanvas();
};
const validateTextStyle = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<TextSegmentStyle | undefined> => {
  if (value === undefined) return okValidation(undefined);
  if (!isPlainRecord(value)) {
    return failValidation("invalid-segment-style", `${path} must be an object when provided.`);
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
    return failValidation("invalid-segment-id", `${path}.id must be a non-empty string.`);
  }
  const segmentId = value.id.trim();
  if (!VALID_SEGMENT_TYPES.has(value.type as StepSegment["type"])) {
    return failValidation("invalid-segment-type", `${path}.type must be one of text/image/video.`);
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
export const validateStepBlock = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<StepBlock> => {
  if (!isPlainRecord(value)) {
    return failValidation("invalid-block", `${path} must be an object.`);
  }
  if (!isNonEmptyString(value.id)) {
    return failValidation("invalid-block-id", `${path}.id must be a non-empty string.`);
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
    return failValidation("invalid-block-segments", `${path}.segments must be an array.`);
  }
  const segments: StepSegment[] = [];
  for (let index = 0; index < value.segments.length; index += 1) {
    const segmentValidation = validateStepSegment(value.segments[index], `${path}.segments[${index}]`);
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
  return okValidation({ blockId, block: blockValidation.value });
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
  return okValidation({ blockId: payload.blockId.trim() });
};
export const validateImportStepBlocksPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<ImportStepBlocksPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["blocks"] });
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
const executeInsertBlock = (payload: InsertBlockPayload) => {
  const currentBlocks = canvasStore.getState().stepBlocks.map((block) => cloneStepBlock(block));
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
  const currentBlocks = canvasStore.getState().stepBlocks.map((block) => cloneStepBlock(block));
  const targetIndex = currentBlocks.findIndex((block) => block.id === payload.blockId);
  if (targetIndex < 0) {
    throw new Error(`block '${payload.blockId}' was not found.`);
  }
  const nextBlocks = [...currentBlocks];
  nextBlocks[targetIndex] = cloneStepBlock(payload.block);
  commitStepBlocks(nextBlocks);
  return { blockId: payload.blockId, index: targetIndex, totalBlocks: nextBlocks.length };
};
const executeDeleteBlock = (payload: DeleteBlockPayload) => {
  const currentBlocks = canvasStore.getState().stepBlocks.map((block) => cloneStepBlock(block));
  const targetIndex = currentBlocks.findIndex((block) => block.id === payload.blockId);
  if (targetIndex < 0) {
    throw new Error(`block '${payload.blockId}' was not found.`);
  }
  const nextBlocks = currentBlocks.filter((block) => block.id !== payload.blockId);
  commitStepBlocks(nextBlocks);
  return { blockId: payload.blockId, index: targetIndex, totalBlocks: nextBlocks.length };
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
    properties: { blockId: { type: "string" } },
    additionalProperties: false,
  },
  validatePayload: validateDeleteBlockPayload,
  execute: executeDeleteBlock,
};
export const DOC_COMMANDS: readonly AppCommand<unknown, unknown>[] = [
  insertBlockCommand as AppCommand<unknown, unknown>,
  updateBlockCommand as AppCommand<unknown, unknown>,
  deleteBlockCommand as AppCommand<unknown, unknown>,
];
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
export function registerDocCommands(): void {
  for (const command of DOC_COMMANDS) {
    registerOrThrow(command);
  }
}
