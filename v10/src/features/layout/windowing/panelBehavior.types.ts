import type { UISlotName } from "@core/extensions/registry";

export const PANEL_DISPLAY_MODES = ["windowed", "docked"] as const;
export type PanelDisplayMode = (typeof PANEL_DISPLAY_MODES)[number];

export const PANEL_RUNTIME_ROLES = ["host", "student"] as const;
export type PanelRuntimeRole = (typeof PANEL_RUNTIME_ROLES)[number];

export type PanelDefaultPosition = {
  x: number;
  y: number;
};

export type PanelRoleOverride = {
  visible?: boolean;
  displayMode?: PanelDisplayMode;
  movable?: boolean;
  defaultOpen?: boolean;
};

export type PanelBehaviorContract = {
  displayMode: PanelDisplayMode;
  movable: boolean;
  defaultPosition: PanelDefaultPosition;
  rememberPosition: boolean;
  defaultOpen: boolean;
  roleOverride?: Partial<Record<PanelRuntimeRole, PanelRoleOverride>>;
};

export type PanelPolicyEntry = {
  slot: UISlotName;
  behavior: PanelBehaviorContract;
};

export type PanelPolicyDocument = {
  version: number;
  panels: Record<string, PanelPolicyEntry>;
};
