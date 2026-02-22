import type {
  ResolvedToolbarPlanCanvasActions,
  ResolvedToolbarPlanDrawActions,
  ResolvedToolbarPlanMorePanelSections,
  ResolvedToolbarPlanPlaybackActions,
} from "./actionGroups";
import type {
  ResolvedToolbarPlanMode,
  ResolvedToolbarViewportProfile,
} from "./modeAndViewport";

export type ResolvedToolbarPlan = {
  mode: ResolvedToolbarPlanMode;
  viewport: ResolvedToolbarViewportProfile;
  cutoverEnabled: boolean;
  draw: ResolvedToolbarPlanDrawActions;
  playback: ResolvedToolbarPlanPlaybackActions;
  canvas: ResolvedToolbarPlanCanvasActions;
  morePanel: ResolvedToolbarPlanMorePanelSections;
};

export type ResolvedToolbarPlanInput = {
  mode: ResolvedToolbarPlanMode;
  viewport: ResolvedToolbarViewportProfile;
  cutoverEnabled: boolean;
};
