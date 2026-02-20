export type ModId = string;

export type ModCapability =
  | "input.pointer"
  | "input.keyboard"
  | "overlay.draw"
  | "toolbar.contribute"
  | "panel.contribute"
  | "playback.control";

export type ModMeta = {
  id: ModId;
  version: string;
  label: string;
  priority: number;
  capabilities: ModCapability[];
};

export type ModEventModifiers = {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
};

export type NormalizedPointerEvent = {
  pointerId: number;
  phase: "down" | "move" | "up" | "cancel";
  x: number;
  y: number;
  pressure: number;
  buttons: number;
  timestamp: number;
  modifiers: ModEventModifiers;
};

export type NormalizedKeyEvent = {
  phase: "down" | "up";
  code: string;
  key: string;
  repeat: boolean;
  timestamp: number;
  modifiers: ModEventModifiers;
};

export type NormalizedWheelGestureEvent = {
  dx: number;
  dy: number;
  dz: number;
  ctrlKey: boolean;
  timestamp: number;
};

export type ModToolbarItem = {
  id: string;
  commandId: string;
  label: string;
  icon?: string;
  group?: string;
  order?: number;
  when?: string;
};

export type ModPanelContribution = {
  id: string;
  title: string;
  slot: string;
  defaultOpen?: boolean;
  order?: number;
};

export type ModOverlayFrame = {
  viewport: {
    zoom: number;
    offsetX: number;
    offsetY: number;
  };
  timestamp: number;
};

export type ModContext = {
  modId: ModId;
  dispatchCommand: (
    commandId: string,
    payload?: unknown,
    meta?: Record<string, unknown>
  ) => Promise<unknown>;
  query: {
    activeTool: () => string;
    playbackStep: () => {
      current: number;
      total: number;
    };
    role: () => "host" | "student";
  };
  publishNotice: (tone: "info" | "success" | "error", message: string) => void;
};

export type ModInputHandleResult = "handled" | "pass";

export interface ModDefinition {
  meta: ModMeta;
  onEnter?(ctx: ModContext): void | Promise<void>;
  onExit?(ctx: ModContext): void | Promise<void>;
  onSuspend?(ctx: ModContext): void | Promise<void>;
  onResume?(ctx: ModContext): void | Promise<void>;

  onPointer?(
    event: NormalizedPointerEvent,
    ctx: ModContext
  ): ModInputHandleResult;
  onKey?(event: NormalizedKeyEvent, ctx: ModContext): ModInputHandleResult;
  onWheelGesture?(
    event: NormalizedWheelGestureEvent,
    ctx: ModContext
  ): ModInputHandleResult;

  drawOverlay?(
    canvasCtx: CanvasRenderingContext2D,
    frame: ModOverlayFrame,
    ctx: ModContext
  ): void;

  getToolbarItems?(ctx: ModContext): ModToolbarItem[];
  getPanels?(ctx: ModContext): ModPanelContribution[];

  serializeState?(): Record<string, unknown>;
  restoreState?(value: Record<string, unknown>): void;
}

export type ModeId = ModId;
export type ModeCapability = ModCapability;
export type ModeMeta = ModMeta;
export type ModeEventModifiers = ModEventModifiers;
export type NormalizedModePointerEvent = NormalizedPointerEvent;
export type NormalizedModeKeyEvent = NormalizedKeyEvent;
export type NormalizedModeWheelGestureEvent = NormalizedWheelGestureEvent;
export type ModeToolbarItem = ModToolbarItem;
export type ModePanelContribution = ModPanelContribution;
export type ModeOverlayFrame = ModOverlayFrame;
export type ModeContext = ModContext;
export type ModeInputHandleResult = ModInputHandleResult;
export type ModeDefinition = ModDefinition;
