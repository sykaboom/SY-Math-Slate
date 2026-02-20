import type { ModId } from "@core/mod/contracts";
import { DEFAULT_ACTIVE_MOD_ID } from "@features/store/useModStore";

export type ToolbarMod = "draw" | "playback" | "canvas";
export type ToolbarMode = ToolbarMod;
export type ToolbarModeModId = "draw" | "lecture" | "canvas";

export const DEFAULT_TOOLBAR_MODE: ToolbarMode = "draw";

const TOOLBAR_MODE_TO_MOD_ID: Record<ToolbarMode, ToolbarModeModId> = {
  draw: "draw",
  playback: "lecture",
  canvas: "canvas",
};

const resolveToolbarModeFromKnownModId = (
  modId: ModId
): ToolbarMode | null => {
  if (modId === "draw") return "draw";
  if (modId === "playback" || modId === "lecture") return "playback";
  if (modId === "canvas") return "canvas";
  return null;
};

export const resolveActiveModIdFromToolbarMode = (
  mode: ToolbarMode
): ToolbarModeModId => TOOLBAR_MODE_TO_MOD_ID[mode];

export const resolveToolbarModeFromActiveModId = (
  activeModId: ModId | null | undefined
): ToolbarMode => {
  if (!activeModId) return DEFAULT_TOOLBAR_MODE;
  const resolvedActiveMode = resolveToolbarModeFromKnownModId(activeModId);
  if (resolvedActiveMode) {
    return resolvedActiveMode;
  }
  const resolvedDefaultMode = resolveToolbarModeFromKnownModId(DEFAULT_ACTIVE_MOD_ID);
  if (resolvedDefaultMode) {
    return resolvedDefaultMode;
  }
  return DEFAULT_TOOLBAR_MODE;
};

export type ToolbarRenderPolicy = {
  cutoverEnabled: boolean;
  showDrawCoreTools: boolean;
  showBreakActions: boolean;
  showPlaybackExtras: boolean;
};

export const isCoreToolbarCutoverEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";

export const resolveToolbarRenderPolicy = (
  mode: ToolbarMode,
  cutoverEnabled = isCoreToolbarCutoverEnabled()
): ToolbarRenderPolicy => {
  const isDrawMode = mode === "draw";
  const isPlaybackMode = mode === "playback";

  return {
    cutoverEnabled,
    // Draw core tools should always be reachable regardless of cutover state.
    showDrawCoreTools: isDrawMode,
    // Transitional break controls still follow fallback gating until declarative parity lands.
    showBreakActions: isDrawMode && !cutoverEnabled,
    // Heavy playback/page widgets remain fallback-gated to avoid toolbar overload.
    showPlaybackExtras: isPlaybackMode && !cutoverEnabled,
  };
};
