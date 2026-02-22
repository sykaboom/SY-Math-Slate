import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageToolbarMode,
  ResolvedToolbarPlan,
  ResolvedToolbarPlanInput,
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
} from "../../../types";

export const EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([]);
export const EMPTY_TOOLBAR_BASE_ACTION_CATALOG: readonly ToolbarBaseActionCatalogEntry[] =
  Object.freeze([]);
export const EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES: readonly ToolbarBaseActionSurfaceRule[] =
  Object.freeze([]);

export const DEFAULT_TOOLBAR_MODE: ModPackageToolbarMode = "draw";
export const DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID: ModId = "draw";

export const COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([
    { id: "draw", label: "Draw", fallbackModId: "draw" },
    { id: "playback", label: "Playback", fallbackModId: "lecture" },
    { id: "canvas", label: "Canvas", fallbackModId: "canvas" },
  ]);

export const buildFallbackResolvedToolbarPlan = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan => ({
  mode: input.mode,
  viewport: input.viewport,
  cutoverEnabled: input.cutoverEnabled,
  draw: {
    hand: false,
    pen: false,
    eraser: false,
    laser: false,
    text: false,
    image: false,
    clipboard: false,
    undoRedo: false,
    breakActions: false,
  },
  playback: {
    step: false,
    undoRedo: false,
    sound: false,
    extras: false,
  },
  canvas: {
    fullscreen: false,
    sound: false,
  },
  morePanel: {
    step: false,
    history: false,
  },
});
