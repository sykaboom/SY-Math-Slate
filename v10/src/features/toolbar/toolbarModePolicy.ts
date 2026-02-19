export type ToolbarMode = "draw" | "playback" | "canvas";

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
