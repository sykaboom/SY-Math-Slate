import {
  registerAppCommand,
  type AppCommand,
  type AppCommandPayloadValidationResult,
} from "@core/runtime/command/commandBus";
import {
  useUIStore as uiBridgeStore,
  type LaserType,
  type PenType,
  type ToolbarDockEdge,
  type ToolbarPlacement,
  type Tool,
} from "@features/store/useUIStoreBridge";
import {
  ERASER_WIDTH_MAX,
  ERASER_WIDTH_MIN,
} from "@features/store/useToolStore";
import {
  failValidation,
  isFiniteNumber,
  isNonEmptyString,
  okValidation,
  validatePayloadObject,
} from "./commands.doc";

type SetToolPayload = { tool: Tool };
type SetViewModePayload = { mode: "edit" | "presentation" };
type SetToolbarDockPayload = {
  edge: ToolbarDockEdge;
  mode: ToolbarPlacement["mode"];
};
type SetPenTypePayload = { penType: PenType };
type SetPenColorPayload = { color: string };
type SetPenWidthPayload = { width: number };
type SetPenOpacityPayload = { opacity: number };
type SetEraserWidthPayload = { width: number };
type SetLaserTypePayload = { laserType: LaserType };
type SetLaserColorPayload = { color: string };
type SetLaserWidthPayload = { width: number };

const VALID_TOOLS = new Set<Tool>(["pen", "eraser", "laser", "hand", "text"]);
const VALID_VIEW_MODES = new Set<SetViewModePayload["mode"]>(["edit", "presentation"]);
const VALID_TOOLBAR_DOCK_EDGES = new Set<ToolbarDockEdge>([
  "top",
  "right",
  "bottom",
  "left",
]);
const VALID_TOOLBAR_PLACEMENT_MODES = new Set<ToolbarPlacement["mode"]>([
  "floating",
  "docked",
]);
const VALID_PEN_TYPES = new Set<PenType>(["ink", "pencil", "highlighter"]);
const VALID_LASER_TYPES = new Set<LaserType>(["standard", "highlighter"]);
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const PEN_WIDTH_MIN = 0.5;
const PEN_WIDTH_MAX = 200;
const PEN_OPACITY_MIN = 0;
const PEN_OPACITY_MAX = 100;
const LASER_WIDTH_MIN = 0.5;
const LASER_WIDTH_MAX = 200;
const isNumberInRange = (
  value: unknown,
  min: number,
  max: number
): value is number => isFiniteNumber(value) && value >= min && value <= max;
const normalizeHexColor = (value: string): string => value.trim().toUpperCase();

const validateSetToolPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetToolPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["tool"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.tool)) {
    return failValidation("invalid-payload-tool", "payload.tool must be a non-empty string.");
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

const validateSetViewModePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetViewModePayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["mode"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonEmptyString(payloadValidation.value.mode)) {
    return failValidation(
      "invalid-payload-view-mode",
      "payload.mode must be a non-empty string."
    );
  }

  const mode = payloadValidation.value.mode.trim() as SetViewModePayload["mode"];
  if (!VALID_VIEW_MODES.has(mode)) {
    return failValidation(
      "invalid-payload-view-mode-value",
      "payload.mode must be one of edit/presentation."
    );
  }
  return okValidation({ mode });
};

const validateSetToolbarDockPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetToolbarDockPayload> => {
  const payloadValidation = validatePayloadObject(payload, {
    allowedKeys: ["edge", "mode"],
  });
  if (!payloadValidation.ok) return payloadValidation;

  const rawMode = payloadValidation.value.mode;
  const mode =
    isNonEmptyString(rawMode) && VALID_TOOLBAR_PLACEMENT_MODES.has(rawMode.trim() as ToolbarPlacement["mode"])
      ? (rawMode.trim() as ToolbarPlacement["mode"])
      : "docked";

  const rawEdge = payloadValidation.value.edge;
  if (isNonEmptyString(rawEdge)) {
    const edge = rawEdge.trim() as ToolbarDockEdge;
    if (!VALID_TOOLBAR_DOCK_EDGES.has(edge)) {
      return failValidation(
        "invalid-payload-toolbar-dock-edge-value",
        "payload.edge must be one of top/right/bottom/left."
      );
    }
    return okValidation({ edge, mode });
  }

  if (mode === "floating") {
    return okValidation({ edge: "bottom", mode: "floating" });
  }

  return failValidation(
    "invalid-payload-toolbar-dock",
    "payload.edge must be provided unless payload.mode is floating."
  );
};

const validateSetPenTypePayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPenTypePayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["penType"] });
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["color"] });
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["width"] });
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["opacity"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    !isNumberInRange(payloadValidation.value.opacity, PEN_OPACITY_MIN, PEN_OPACITY_MAX)
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["laserType"] });
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["color"] });
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["width"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNumberInRange(payloadValidation.value.width, LASER_WIDTH_MIN, LASER_WIDTH_MAX)) {
    return failValidation(
      "invalid-payload-laser-width",
      `payload.width must be between ${LASER_WIDTH_MIN} and ${LASER_WIDTH_MAX}.`
    );
  }
  return okValidation({ width: payloadValidation.value.width });
};

const validateSetEraserWidthPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetEraserWidthPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["width"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (
    !isNumberInRange(
      payloadValidation.value.width,
      ERASER_WIDTH_MIN,
      ERASER_WIDTH_MAX
    )
  ) {
    return failValidation(
      "invalid-payload-eraser-width",
      `payload.width must be between ${ERASER_WIDTH_MIN} and ${ERASER_WIDTH_MAX}.`
    );
  }
  return okValidation({ width: payloadValidation.value.width });
};

const executeSetTool = (payload: SetToolPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setTool(payload.tool);
  return { tool: payload.tool };
};

const executeSetViewMode = (payload: SetViewModePayload) => {
  const ui = uiBridgeStore.getState();
  ui.setViewMode(payload.mode);
  return { viewMode: payload.mode };
};

const executeSetToolbarDock = (payload: SetToolbarDockPayload) => {
  const ui = uiBridgeStore.getState();
  if (payload.mode === "floating") {
    ui.setToolbarFloating();
  } else {
    ui.setToolbarDockEdge(payload.edge);
  }
  return { toolbarPlacement: uiBridgeStore.getState().toolbarPlacement };
};

const executeSetPenType = (payload: SetPenTypePayload) => {
  const ui = uiBridgeStore.getState();
  ui.setPenType(payload.penType);
  const next = uiBridgeStore.getState();
  return {
    penType: next.penType,
    penColor: next.penColor,
    penWidth: next.penWidth,
    penOpacity: next.penOpacity,
  };
};

const executeSetPenColor = (payload: SetPenColorPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setColor(payload.color);
  return { penColor: payload.color };
};

const executeSetPenWidth = (payload: SetPenWidthPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setPenWidth(payload.width);
  return { penWidth: payload.width };
};

const executeSetPenOpacity = (payload: SetPenOpacityPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setPenOpacity(payload.opacity);
  return { penOpacity: payload.opacity };
};

const executeSetEraserWidth = (payload: SetEraserWidthPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setEraserWidth(payload.width);
  return { eraserWidth: payload.width };
};

const executeSetLaserType = (payload: SetLaserTypePayload) => {
  const ui = uiBridgeStore.getState();
  ui.setLaserType(payload.laserType);
  const next = uiBridgeStore.getState();
  return {
    laserType: next.laserType,
    laserColor: next.laserColor,
    laserWidth: next.laserWidth,
  };
};

const executeSetLaserColor = (payload: SetLaserColorPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setLaserColor(payload.color);
  return { laserColor: payload.color };
};

const executeSetLaserWidth = (payload: SetLaserWidthPayload) => {
  const ui = uiBridgeStore.getState();
  ui.setLaserWidth(payload.width);
  return { laserWidth: payload.width };
};

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

const setViewModeCommand: AppCommand<
  SetViewModePayload,
  { viewMode: "edit" | "presentation" }
> = {
  id: "setViewMode",
  description: "Set editor view mode (edit/presentation).",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-view-mode",
  schema: {
    type: "object",
    required: ["mode"],
    properties: {
      mode: { type: "string", enum: ["edit", "presentation"] },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetViewModePayload,
  execute: executeSetViewMode,
};

const setToolbarDockCommand: AppCommand<
  SetToolbarDockPayload,
  { toolbarPlacement: ToolbarPlacement }
> = {
  id: "setToolbarDock",
  description: "Set toolbar placement (docked edge or floating mode).",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-toolbar-dock",
  schema: {
    type: "object",
    required: [],
    properties: {
      edge: { type: "string", enum: ["top", "right", "bottom", "left"] },
      mode: { type: "string", enum: ["floating", "docked"] },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetToolbarDockPayload,
  execute: executeSetToolbarDock,
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
    properties: { color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" } },
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

const setPenOpacityCommand: AppCommand<SetPenOpacityPayload, { penOpacity: number }> = {
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

const setEraserWidthCommand: AppCommand<
  SetEraserWidthPayload,
  { eraserWidth: number }
> = {
  id: "setEraserWidth",
  description: "Set eraser width.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-eraser-width",
  schema: {
    type: "object",
    required: ["width"],
    properties: {
      width: {
        type: "number",
        minimum: ERASER_WIDTH_MIN,
        maximum: ERASER_WIDTH_MAX,
      },
    },
    additionalProperties: false,
  },
  validatePayload: validateSetEraserWidthPayload,
  execute: executeSetEraserWidth,
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

const setLaserColorCommand: AppCommand<SetLaserColorPayload, { laserColor: string }> = {
  id: "setLaserColor",
  description: "Set laser color.",
  mutationScope: "local",
  requiresApproval: false,
  auditTag: "command.set-laser-color",
  schema: {
    type: "object",
    required: ["color"],
    properties: { color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" } },
    additionalProperties: false,
  },
  validatePayload: validateSetLaserColorPayload,
  execute: executeSetLaserColor,
};

const setLaserWidthCommand: AppCommand<SetLaserWidthPayload, { laserWidth: number }> = {
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

export const TOOL_COMMANDS: readonly AppCommand<unknown, unknown>[] = [
  setToolCommand as AppCommand<unknown, unknown>,
  setViewModeCommand as AppCommand<unknown, unknown>,
  setToolbarDockCommand as AppCommand<unknown, unknown>,
  setPenTypeCommand as AppCommand<unknown, unknown>,
  setPenColorCommand as AppCommand<unknown, unknown>,
  setPenWidthCommand as AppCommand<unknown, unknown>,
  setPenOpacityCommand as AppCommand<unknown, unknown>,
  setEraserWidthCommand as AppCommand<unknown, unknown>,
  setLaserTypeCommand as AppCommand<unknown, unknown>,
  setLaserColorCommand as AppCommand<unknown, unknown>,
  setLaserWidthCommand as AppCommand<unknown, unknown>,
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

export function registerToolCommands(): void {
  for (const command of TOOL_COMMANDS) {
    registerOrThrow(command);
  }
}
