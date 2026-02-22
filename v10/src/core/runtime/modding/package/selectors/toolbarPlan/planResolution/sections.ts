import type { ResolvedToolbarPlan, ResolvedToolbarPlanInput } from "../../../types";
import {
  buildCanvasSection,
  buildDrawSection,
  buildMorePanelSection,
  buildPlaybackSection,
} from "./sections/modes";

export type ToolbarSurfacePredicates = {
  isPrimary: (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) => boolean;
  isMore: (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) => boolean;
};

type BuildModeSectionsInput = {
  mode: ResolvedToolbarPlanInput["mode"];
  cutoverEnabled: boolean;
} & ToolbarSurfacePredicates;

export const buildResolvedToolbarModeSections = ({
  mode,
  cutoverEnabled,
  isPrimary,
  isMore,
}: BuildModeSectionsInput): Pick<
  ResolvedToolbarPlan,
  "draw" | "playback" | "canvas" | "morePanel"
> => ({
  draw: buildDrawSection(isPrimary, isMore, cutoverEnabled),
  playback: buildPlaybackSection(isPrimary, cutoverEnabled),
  canvas: buildCanvasSection(isPrimary),
  morePanel: buildMorePanelSection(mode, isMore),
});
