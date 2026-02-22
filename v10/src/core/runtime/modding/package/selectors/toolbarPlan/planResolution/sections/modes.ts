import type { ResolvedToolbarPlan, ResolvedToolbarPlanInput } from "../../../../types";

type IsPrimary = (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) => boolean;
type IsMore = (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) => boolean;

export const buildDrawSection = (
  isPrimary: IsPrimary,
  isMore: IsMore,
  cutoverEnabled: boolean
): ResolvedToolbarPlan["draw"] => ({
  hand: isPrimary("draw", "draw.hand"),
  pen: isPrimary("draw", "draw.pen"),
  eraser: isPrimary("draw", "draw.eraser"),
  laser: isPrimary("draw", "draw.laser"),
  text: isPrimary("draw", "draw.text"),
  image: isPrimary("draw", "draw.image"),
  clipboard: isPrimary("draw", "draw.clipboard"),
  undoRedo: isPrimary("draw", "draw.undo") && isPrimary("draw", "draw.redo"),
  breakActions:
    !cutoverEnabled &&
    isMore("draw", "draw.break.line") &&
    isMore("draw", "draw.break.column") &&
    isMore("draw", "draw.break.page"),
});

export const buildPlaybackSection = (
  isPrimary: IsPrimary,
  cutoverEnabled: boolean
): ResolvedToolbarPlan["playback"] => ({
  step:
    isPrimary("playback", "playback.step.prev") &&
    isPrimary("playback", "playback.step.next"),
  undoRedo:
    isPrimary("playback", "playback.undo") && isPrimary("playback", "playback.redo"),
  sound: isPrimary("playback", "playback.sound.toggle"),
  extras: !cutoverEnabled && isPrimary("playback", "playback.extras"),
});

export const buildCanvasSection = (isPrimary: IsPrimary): ResolvedToolbarPlan["canvas"] => ({
  fullscreen: isPrimary("canvas", "canvas.fullscreen.toggle"),
  sound: isPrimary("canvas", "canvas.sound.toggle"),
});

export const buildMorePanelSection = (
  mode: ResolvedToolbarPlanInput["mode"],
  isMore: IsMore
): ResolvedToolbarPlan["morePanel"] => ({
  step: isMore(mode, "more.step.prev") && isMore(mode, "more.step.next"),
  history:
    mode === "playback"
      ? isMore("playback", "playback.undo") && isMore("playback", "playback.redo")
      : isMore("draw", "draw.undo") && isMore("draw", "draw.redo"),
});
