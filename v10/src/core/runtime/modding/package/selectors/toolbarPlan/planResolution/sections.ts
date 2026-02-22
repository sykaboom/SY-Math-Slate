import type { ResolvedToolbarPlan, ResolvedToolbarPlanInput } from "../../../types";

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
  draw: {
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
  },
  playback: {
    step:
      isPrimary("playback", "playback.step.prev") &&
      isPrimary("playback", "playback.step.next"),
    undoRedo:
      isPrimary("playback", "playback.undo") &&
      isPrimary("playback", "playback.redo"),
    sound: isPrimary("playback", "playback.sound.toggle"),
    extras: !cutoverEnabled && isPrimary("playback", "playback.extras"),
  },
  canvas: {
    fullscreen: isPrimary("canvas", "canvas.fullscreen.toggle"),
    sound: isPrimary("canvas", "canvas.sound.toggle"),
  },
  morePanel: {
    step: isMore(mode, "more.step.prev") && isMore(mode, "more.step.next"),
    history:
      mode === "playback"
        ? isMore("playback", "playback.undo") &&
          isMore("playback", "playback.redo")
        : isMore("draw", "draw.undo") && isMore("draw", "draw.redo"),
  },
});
