import {
  registerAppCommand,
  type AppCommand,
  type AppCommandPayloadValidationResult,
} from "@core/runtime/command/commandBus";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import {
  type EmptyPayload,
  failValidation,
  isFiniteNumber,
  isNonNegativeInteger,
  okValidation,
  syncDocFromCanvas,
  validatePayloadObject,
} from "./commands.doc";
const canvasStore = useCanvasStore;
type SetPlaybackSpeedPayload = { speed: number };
type SetAutoPlayDelayPayload = { delayMs: number };
type ToggleAutoPlayPayload = { value?: boolean };
type TogglePausePayload = { value?: boolean };
type SetAnimatingPayload = { value: boolean };
type GoToStepPayload = { step: number };
const PLAYBACK_SPEED_MIN = 0.1;
const PLAYBACK_SPEED_MAX = 2;
const AUTO_PLAY_DELAY_MIN_MS = 300;
const AUTO_PLAY_DELAY_MAX_MS = 3000;
const EMPTY_OBJECT_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;
const isNumberInRange = (
  value: unknown,
  min: number,
  max: number
): value is number => isFiniteNumber(value) && value >= min && value <= max;
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
const validateSetPlaybackSpeedPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetPlaybackSpeedPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["speed"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNumberInRange(payloadValidation.value.speed, PLAYBACK_SPEED_MIN, PLAYBACK_SPEED_MAX)) {
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
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["delayMs"] });
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
  if (payloadValidation.value.value === undefined) return okValidation({});
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
  if (payloadValidation.value.value === undefined) return okValidation({});
  if (typeof payloadValidation.value.value !== "boolean") {
    return failValidation(
      "invalid-payload-toggle-pause-value",
      "payload.value must be a boolean when provided."
    );
  }
  return okValidation({ value: payloadValidation.value.value });
};
const validateSetAnimatingPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<SetAnimatingPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["value"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (typeof payloadValidation.value.value !== "boolean") {
    return failValidation(
      "invalid-payload-set-animating-value",
      "payload.value must be a boolean."
    );
  }
  return okValidation({ value: payloadValidation.value.value });
};
const validateGoToStepPayload = (
  payload: unknown
): AppCommandPayloadValidationResult<GoToStepPayload> => {
  const payloadValidation = validatePayloadObject(payload, { allowedKeys: ["step"] });
  if (!payloadValidation.ok) return payloadValidation;
  if (!isNonNegativeInteger(payloadValidation.value.step)) {
    return failValidation(
      "invalid-payload-go-to-step",
      "payload.step must be a non-negative integer."
    );
  }
  return okValidation({ step: payloadValidation.value.step });
};
const executeSetPlaybackSpeed = (payload: SetPlaybackSpeedPayload) => {
  const ui = useUIStore.getState();
  ui.setPlaybackSpeed(payload.speed);
  return { playbackSpeed: useUIStore.getState().playbackSpeed };
};
const executeSetAutoPlayDelay = (payload: SetAutoPlayDelayPayload) => {
  const ui = useUIStore.getState();
  ui.setAutoPlayDelay(payload.delayMs);
  return { autoPlayDelayMs: useUIStore.getState().autoPlayDelayMs };
};
const executeToggleAutoPlay = (payload: ToggleAutoPlayPayload) => {
  const ui = useUIStore.getState();
  if (payload.value === undefined) {
    ui.toggleAutoPlay();
  } else {
    ui.setAutoPlay(payload.value);
  }
  return { isAutoPlay: useUIStore.getState().isAutoPlay };
};
const executeTogglePause = (payload: TogglePausePayload) => {
  const ui = useUIStore.getState();
  if (payload.value === undefined) {
    ui.togglePause();
  } else {
    ui.setPaused(payload.value);
  }
  return { isPaused: useUIStore.getState().isPaused };
};
const executeSetAnimating = (payload: SetAnimatingPayload) => {
  const ui = useUIStore.getState();
  ui.setAnimating(payload.value);
  return { isAnimating: useUIStore.getState().isAnimating };
};
const executeTriggerPlay = () => {
  const ui = useUIStore.getState();
  ui.triggerPlay();
  const next = useUIStore.getState();
  return { playSignal: next.playSignal, isAnimating: next.isAnimating };
};
const executeTriggerStop = () => {
  const ui = useUIStore.getState();
  ui.triggerStop();
  return { stopSignal: useUIStore.getState().stopSignal };
};
const executeTriggerSkip = () => {
  const ui = useUIStore.getState();
  ui.triggerSkip();
  return { skipSignal: useUIStore.getState().skipSignal };
};
const executeUndo = () => {
  const canvas = canvasStore.getState();
  canvas.undo();
  syncDocFromCanvas();
  const next = canvasStore.getState();
  const currentItems = next.pages[next.currentPageId] ?? [];
  return {
    currentPageId: next.currentPageId,
    strokeCount: currentItems.filter((item) => item.type === "stroke").length,
    redoDepth: next.strokeRedoByPage[next.currentPageId]?.length ?? 0,
  };
};
const executeRedo = () => {
  const canvas = canvasStore.getState();
  canvas.redo();
  syncDocFromCanvas();
  const next = canvasStore.getState();
  const currentItems = next.pages[next.currentPageId] ?? [];
  return {
    currentPageId: next.currentPageId,
    strokeCount: currentItems.filter((item) => item.type === "stroke").length,
    redoDepth: next.strokeRedoByPage[next.currentPageId]?.length ?? 0,
  };
};
const executeNextStep = () => {
  const canvas = canvasStore.getState();
  canvas.nextStep();
  const next = canvasStore.getState();
  return { currentStep: next.currentStep, currentPageId: next.currentPageId };
};
const executePrevStep = () => {
  const canvas = canvasStore.getState();
  canvas.prevStep();
  const next = canvasStore.getState();
  return { currentStep: next.currentStep, currentPageId: next.currentPageId };
};
const executeGoToStep = (payload: GoToStepPayload) => {
  const canvas = canvasStore.getState();
  canvas.goToStep(payload.step);
  const next = canvasStore.getState();
  return {
    requestedStep: payload.step,
    currentStep: next.currentStep,
    currentPageId: next.currentPageId,
  };
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
    properties: { value: { type: "boolean" } },
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
    properties: { value: { type: "boolean" } },
    additionalProperties: false,
  },
  validatePayload: validateTogglePausePayload,
  execute: executeTogglePause,
};
const setAnimatingCommand: AppCommand<SetAnimatingPayload, { isAnimating: boolean }> = {
  id: "setAnimating",
  description: "Set animation in-progress state.",
  mutationScope: "sync",
  requiresApproval: false,
  auditTag: "command.set-animating",
  schema: {
    type: "object",
    required: ["value"],
    properties: { value: { type: "boolean" } },
    additionalProperties: false,
  },
  validatePayload: validateSetAnimatingPayload,
  execute: executeSetAnimating,
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
const undoCommand: AppCommand<
  EmptyPayload,
  { currentPageId: string; strokeCount: number; redoDepth: number }
> = {
  id: "undo",
  description: "Undo the latest stroke on the current page.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.undo",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeUndo,
};
const redoCommand: AppCommand<
  EmptyPayload,
  { currentPageId: string; strokeCount: number; redoDepth: number }
> = {
  id: "redo",
  description: "Redo the latest undone stroke on the current page.",
  mutationScope: "doc",
  requiresApproval: true,
  auditTag: "command.redo",
  schema: EMPTY_OBJECT_SCHEMA,
  validatePayload: validateEmptyPayload,
  execute: executeRedo,
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
export const PLAYBACK_COMMANDS: readonly AppCommand<unknown, unknown>[] = [
  setPlaybackSpeedCommand as AppCommand<unknown, unknown>,
  setAutoPlayDelayCommand as AppCommand<unknown, unknown>,
  toggleAutoPlayCommand as AppCommand<unknown, unknown>,
  togglePauseCommand as AppCommand<unknown, unknown>,
  setAnimatingCommand as AppCommand<unknown, unknown>,
  triggerPlayCommand as AppCommand<unknown, unknown>,
  triggerStopCommand as AppCommand<unknown, unknown>,
  triggerSkipCommand as AppCommand<unknown, unknown>,
  undoCommand as AppCommand<unknown, unknown>,
  redoCommand as AppCommand<unknown, unknown>,
  nextStepCommand as AppCommand<unknown, unknown>,
  prevStepCommand as AppCommand<unknown, unknown>,
  goToStepCommand as AppCommand<unknown, unknown>,
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
export function registerPlaybackCommands(): void {
  for (const command of PLAYBACK_COMMANDS) {
    registerOrThrow(command);
  }
}
