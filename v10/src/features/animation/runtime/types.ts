import type { AnimationProfile } from "@features/animation/model/animationProfile";

export type AnimationRun = TextAnimationRun | MathAnimationRun;

export type TextAnimationRun = {
  type: "text";
  spans: HTMLElement[];
  highlightSpans: HTMLElement[];
};

export type MathAnimationRun = {
  type: "math";
  node: HTMLElement;
};

export type AnimationPlanMode = "text" | "math" | "mixed";

export type CompiledAnimationPlan = {
  mode: AnimationPlanMode;
  runs: AnimationRun[];
};

export type AnimationPlanMetrics = {
  textCharCount: number;
  highlightCharCount: number;
  mathWidthPx: number;
};

export type AnimationPlaybackOptions = {
  runs: AnimationRun[];
  profile: AnimationProfile;
  metrics: AnimationPlanMetrics;
  toBoardPoint: (clientX: number, clientY: number) => { x: number; y: number };
  onMove: (pos: { x: number; y: number }, tool?: "chalk" | "marker") => void;
  onDone: () => void;
  getSpeed: () => number;
  getPaused: () => boolean;
};

export type AnimationPlaybackController = {
  start: () => void;
  setPaused: (paused: boolean) => void;
  skip: () => void;
  stop: () => void;
};
