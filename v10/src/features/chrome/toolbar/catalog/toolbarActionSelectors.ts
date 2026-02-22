import type { ModToolbarItem } from "@core/runtime/modding/api";
import {
  selectResolvedToolbarPlan,
  selectResolvedToolbarPlanInputFromBaseProvider,
  type ResolvedToolbarPlan,
  type ResolvedToolbarPlanMode,
} from "@core/runtime/modding/package";
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
  mode: ResolvedToolbarPlanMode,
  viewport: ToolbarViewportProfile
) => resolveMorePanelSurfacePolicy(mode, viewport);

export type ResolvedToolbarPlanSelectionInput = {
  mode: ResolvedToolbarPlanMode;
  viewport: ToolbarViewportProfile;
  cutoverEnabled: boolean;
};

export const selectResolvedToolbarPlanInput = ({
  mode,
  viewport,
  cutoverEnabled,
}: ResolvedToolbarPlanSelectionInput): ResolvedToolbarPlan => {
  const packagePlan = {
    mode,
    viewport,
    cutoverEnabled,
    draw: selectDrawToolbarActions(viewport, cutoverEnabled),
    playback: selectPlaybackToolbarActions(viewport, cutoverEnabled),
    canvas: selectCanvasToolbarActions(viewport),
    morePanel: selectMorePanelActions(mode, viewport),
  };
  const basePlan = selectResolvedToolbarPlanInputFromBaseProvider({
    mode,
    viewport,
    cutoverEnabled,
  });
  if (!basePlan) {
    return selectResolvedToolbarPlan(packagePlan);
  }

  // Layer order is base < package(mod/user via surface policy).
  return selectResolvedToolbarPlan({
    ...basePlan,
    ...packagePlan,
    draw: {
      ...basePlan.draw,
      ...packagePlan.draw,
    },
    playback: {
      ...basePlan.playback,
      ...packagePlan.playback,
    },
    canvas: {
      ...basePlan.canvas,
      ...packagePlan.canvas,
    },
    morePanel: {
      ...basePlan.morePanel,
      ...packagePlan.morePanel,
    },
  });
};

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
