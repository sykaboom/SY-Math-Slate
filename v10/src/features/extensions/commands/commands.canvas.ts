import {
  registerAppCommand,
  type AppCommand,
  type AppCommandPayloadValidationResult,
} from "@core/engine/commandBus";
import type { ModInput } from "@core/types/canvas";
import { useCanvasStore } from "@features/store/useCanvasStore";
import {
  type EmptyPayload,
  type ImportStepBlocksPayload,
  commitStepBlocks,
  failValidation,
  isJsonSafe,
  isNonEmptyString,
  isNonNegativeInteger,
  isPlainRecord,
  okValidation,
  syncDocFromCanvas,
  validateImportStepBlocksPayload,
  validatePayloadObject,
} from "./commands.doc";
const canvasStore = useCanvasStore;
type AddPagePayload = EmptyPayload;
type GoToPagePayload = { pageId: string };
type DeletePagePayload = { pageId?: string };
type SetColumnCountPayload = { count: number };
type InsertBreakPayload = { type: "line" | "column" | "page"; panelOpen?: boolean };
type SetInsertionIndexPayload = { index: number };
type SetAnimationModInputPayload = { input: ModInput | null };
const VALID_INSERT_BREAK_TYPES = new Set<InsertBreakPayload["type"]>([
  "line",
  "column",
  "page",
]);
const COLUMN_COUNT_MIN = 1;
const COLUMN_COUNT_MAX = 4;
const EMPTY_OBJECT_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;
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
const validateGoToPagePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<GoToPagePayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["pageId"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.pageId)) {
    return failValidation(
      "invalid-payload-go-to-page",
      "payload.pageId must be a non-empty string."
    );
  }
  return okValidation({ pageId: payloadValidation.value.pageId.trim() });
};
const validateDeletePagePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<DeletePagePayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["pageId"],
    allowUndefined: true,
  });
  if (!payloadValidation.ok) return payloadValidation;
  if (payloadValidation.value.pageId === undefined) return okValidation({});
  if (!isNonEmptyString(payloadValidation.value.pageId)) {
    return failValidation(
      "invalid-payload-delete-page-id",
      "payload.pageId must be a non-empty string when provided."
    );
  }
  return okValidation({ pageId: payloadValidation.value.pageId.trim() });
};
const validateSetColumnCountPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetColumnCountPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["count"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    typeof payloadValidation.value.count !== "number" ||
    !Number.isInteger(payloadValidation.value.count) ||
    payloadValidation.value.count < COLUMN_COUNT_MIN ||
    payloadValidation.value.count > COLUMN_COUNT_MAX
  ) {
    return failValidation(
      "invalid-payload-set-column-count",
      `payload.count must be an integer between ${COLUMN_COUNT_MIN} and ${COLUMN_COUNT_MAX}.`
    );
  }
  return okValidation({ count: payloadValidation.value.count });
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
const validateSetInsertionIndexPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetInsertionIndexPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["index"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonNegativeInteger(payloadValidation.value.index)) {
    return failValidation(
      "invalid-payload-set-insertion-index",
      "payload.index must be a non-negative integer."
    );
  }
  return okValidation({ index: payloadValidation.value.index });
};
const validateModInputValue = (
  value: unknown,
  path: string
): AppCommandPayloadValidationResult<ModInput | null> => {
  if (value === null) return okValidation(null);
  if (!isPlainRecord(value)) {
    return failValidation("invalid-mod-input", `${path} must be an object or null.`);
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
  return okValidation({ format, payload: payloadValue });
};
const cloneModInput = (input: ModInput | null): ModInput | null => {
  if (!input) return null;
  return { format: input.format, payload: input.payload };
};
const validateSetAnimationModInputPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetAnimationModInputPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["input"] });
  if (!payloadValidation.ok) return payloadValidation;
  const inputValidation = validateModInputValue(payloadValidation.value.input, "payload.input");
  if (!inputValidation.ok) return inputValidation;
  return okValidation({ input: inputValidation.value });
};
const executeNextPage = () => {
  const canvas = canvasStore.getState();
  canvas.nextPage();
  const next = canvasStore.getState();
  return { currentPageId: next.currentPageId, totalPages: next.pageOrder.length };
};
const executePrevPage = () => {
  const canvas = canvasStore.getState();
  canvas.prevPage();
  const next = canvasStore.getState();
  return { currentPageId: next.currentPageId, totalPages: next.pageOrder.length };
};
const executeGoToPage = (payload: GoToPagePayload) => {
  const canvas = canvasStore.getState();
  if (!canvas.pageOrder.includes(payload.pageId)) {
    throw new Error(`page '${payload.pageId}' was not found.`);
  }
  canvas.goToPage(payload.pageId);
  return { currentPageId: canvasStore.getState().currentPageId };
};
const executeAddPage = () => {
  const canvas = canvasStore.getState();
  canvas.addPage();
  syncDocFromCanvas();
  const next = canvasStore.getState();
  return { currentPageId: next.currentPageId, totalPages: next.pageOrder.length };
};
const executeDeletePage = (payload: DeletePagePayload) => {
  const canvas = canvasStore.getState();
  canvas.deletePage(payload.pageId);
  syncDocFromCanvas();
  const next = canvasStore.getState();
  return { currentPageId: next.currentPageId, totalPages: next.pageOrder.length };
};
const executeSetColumnCount = (payload: SetColumnCountPayload) => {
  const canvas = canvasStore.getState();
  canvas.setColumnCount(payload.count);
  syncDocFromCanvas();
  const next = canvasStore.getState();
  return {
    currentPageId: next.currentPageId,
    columnCount: next.pageColumnCounts?.[next.currentPageId] ?? payload.count,
  };
};
const executeInsertBreak = (payload: InsertBreakPayload) => {
  const canvas = canvasStore.getState();
  canvas.insertBreak(
    payload.type,
    payload.panelOpen === undefined ? undefined : { panelOpen: payload.panelOpen }
  );
  syncDocFromCanvas();
  const next = canvasStore.getState();
  return {
    type: payload.type,
    totalBlocks: next.stepBlocks.length,
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};
const executeImportStepBlocks = (payload: ImportStepBlocksPayload) => {
  commitStepBlocks(payload.blocks);
  const next = canvasStore.getState();
  return {
    totalBlocks: next.stepBlocks.length,
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
};
const executeSetInsertionIndex = (payload: SetInsertionIndexPayload) => {
  const canvas = canvasStore.getState();
  canvas.setInsertionIndex(payload.index);
  syncDocFromCanvas();
  return { insertionIndex: canvasStore.getState().insertionIndex };
};
const executeSetAnimationModInput = (payload: SetAnimationModInputPayload) => {
  const canvas = canvasStore.getState();
  canvas.setAnimationModInput(cloneModInput(payload.input));
  syncDocFromCanvas();
  const next = canvasStore.getState();
  return {
    hasInput: next.animationModInput !== null,
    format: next.animationModInput?.format ?? null,
  };
};
const executeClearAllAudio = () => {
  const canvas = canvasStore.getState();
  canvas.clearAllAudio();
  syncDocFromCanvas();
  return { totalAudio: Object.keys(canvasStore.getState().audioByStep).length };
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
    properties: { pageId: { type: "string" } },
    additionalProperties: false,
  },
  validatePayload: validateGoToPagePayload,
  execute: executeGoToPage,
};
const addPageCommand: AppCommand<
  AddPagePayload,
  { currentPageId: string; totalPages: number }
> = {
  id: "addPage",
  description: "Create a new page and move cursor to it.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.add-page",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeAddPage,
};
const deletePageCommand: AppCommand<
  DeletePagePayload,
  { currentPageId: string; totalPages: number }
> = {
  id: "deletePage",
  description: "Delete a page (defaults to current page when pageId omitted).",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.delete-page",
  schema: {
    type: "object",
    properties: { pageId: { type: "string" } },
    additionalProperties: false,
  },
  validatePayload: validateDeletePagePayload,
  execute: executeDeletePage,
};
const setColumnCountCommand: AppCommand<
  SetColumnCountPayload,
  { currentPageId: string; columnCount: number }
> = {
  id: "setColumnCount",
  description: "Set current page column count.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.set-column-count",
  schema: {
    type: "object",
    required: ["count"],
    properties: {
      count: {
        type: "number",
        minimum: COLUMN_COUNT_MIN,
        maximum: COLUMN_COUNT_MAX,
      },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetColumnCountPayload,
  execute: executeSetColumnCount,
};
const insertBreakCommand: AppCommand<
  InsertBreakPayload,
  {
    type: InsertBreakPayload["type"];
    totalBlocks: number;
    currentStep: number;
    currentPageId: string;
  }
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
export const CANVAS_COMMANDS: readonly AppCommand<unknown, unknown>[] = [
  nextPageCommand as AppCommand<unknown, unknown>,
  prevPageCommand as AppCommand<unknown, unknown>,
  goToPageCommand as AppCommand<unknown, unknown>,
  addPageCommand as AppCommand<unknown, unknown>,
  deletePageCommand as AppCommand<unknown, unknown>,
  setColumnCountCommand as AppCommand<unknown, unknown>,
  insertBreakCommand as AppCommand<unknown, unknown>,
  importStepBlocksCommand as AppCommand<unknown, unknown>,
  setInsertionIndexCommand as AppCommand<unknown, unknown>,
  setAnimationModInputCommand as AppCommand<unknown, unknown>,
  clearAllAudioCommand as AppCommand<unknown, unknown>,
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
export function registerCanvasCommands(): void {
  for (const command of CANVAS_COMMANDS) {
    registerOrThrow(command);
  }
}
