import type { ModToolbarItem } from "@core/mod/contracts";
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

export type ToolbarContributionBridgeMountMode = "legacy-shell" | "window-host";

const EMPTY_MOD_TOOLBAR_ITEMS: readonly ModToolbarItem[] = Object.freeze([]);

export const shouldBridgeActiveModToolbarContributions = (
  mountMode: ToolbarContributionBridgeMountMode
): boolean => mountMode === "window-host";

export const selectActiveModToolbarContributions = (
  mountMode: ToolbarContributionBridgeMountMode,
  contributions: readonly ModToolbarItem[]
): readonly ModToolbarItem[] =>
  shouldBridgeActiveModToolbarContributions(mountMode)
    ? contributions
    : EMPTY_MOD_TOOLBAR_ITEMS;
