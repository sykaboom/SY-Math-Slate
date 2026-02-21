import type { UISlotName } from "@core/runtime/plugin-runtime/registry";
import type { PanelBehaviorContract, PanelDisplayMode } from "./panelBehavior.types";

export type WindowRuntimeDisplayMode = PanelDisplayMode;

export type WindowRuntimePoint = {
  x: number;
  y: number;
};

export type WindowRuntimeSize = {
  width: number;
  height: number;
};

export type WindowRuntimeRect = WindowRuntimePoint & WindowRuntimeSize;

export type WindowRuntimeEdge = "top" | "right" | "bottom" | "left";

export type WindowRuntimeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type WindowRuntimeDelta = {
  dx: number;
  dy: number;
};

export type WindowRuntimePanelContract = {
  panelId: string;
  slot: UISlotName;
  behavior: PanelBehaviorContract;
  size: WindowRuntimeSize;
  isOpen?: boolean;
};

export type WindowRuntimePersistedPanelLayout = {
  position: WindowRuntimePoint;
  zIndex: number;
};

export type WindowRuntimePersistedState = Record<
  string,
  WindowRuntimePersistedPanelLayout
>;

export type WindowRuntimePanelState = {
  panelId: string;
  slot: UISlotName;
  displayMode: WindowRuntimeDisplayMode;
  movable: boolean;
  rememberPosition: boolean;
  defaultPosition: WindowRuntimePoint;
  position: WindowRuntimePoint;
  size: WindowRuntimeSize;
  isOpen: boolean;
  zIndex: number;
};

export type WindowRuntimeState = {
  clampBounds: WindowRuntimeRect;
  panelOrder: string[];
  panels: Record<string, WindowRuntimePanelState>;
  nextZIndex: number;
};

export type WindowRuntimeInitInput = {
  panels: readonly WindowRuntimePanelContract[];
  clampBounds: WindowRuntimeRect;
  persisted?: WindowRuntimePersistedState;
};

export type WindowRuntimeReconcileInput = WindowRuntimeInitInput & {
  previous: WindowRuntimeState;
};

export type WindowRuntimeMoveToInput = {
  panelId: string;
  position: WindowRuntimePoint;
};

export type WindowRuntimeMoveByInput = {
  panelId: string;
  delta: WindowRuntimeDelta;
};
