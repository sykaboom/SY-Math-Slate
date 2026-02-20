import type { ToolbarMode } from "@features/toolbar/toolbarModePolicy";
import {
  resolveCanvasToolbarSurfacePolicy,
  resolveDrawToolbarSurfacePolicy,
  resolveMorePanelSurfacePolicy,
  resolvePlaybackToolbarSurfacePolicy,
} from "./toolbarSurfacePolicy";
import type { ToolbarViewportProfile } from "./toolbarViewportProfile";

export const selectDrawToolbarActions = (
  viewport: ToolbarViewportProfile,
  cutoverEnabled: boolean
) => resolveDrawToolbarSurfacePolicy(viewport, cutoverEnabled);

export const selectPlaybackToolbarActions = (
  viewport: ToolbarViewportProfile,
  cutoverEnabled: boolean
) => resolvePlaybackToolbarSurfacePolicy(viewport, cutoverEnabled);

export const selectCanvasToolbarActions = (viewport: ToolbarViewportProfile) =>
  resolveCanvasToolbarSurfacePolicy(viewport);

export const selectMorePanelActions = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile
) => resolveMorePanelSurfacePolicy(mode, viewport);

