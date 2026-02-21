import type { AnimationProfile } from "@features/editor/animation/model/animationProfile";

export const CLASSIC_CHALK_PROFILE: AnimationProfile = {
  version: 1,
  id: "classic-chalk-v1",
  label: "Classic Chalk",
  text: {
    revealMode: "clip",
    durationPerCharMs: 26,
    minDurationMs: 320,
    maxDurationMs: 7000,
    cursorLeadMinPx: 6,
    cursorLeadMaxPx: 14,
    baselineOffsetPx: 4,
    clipOverscanPx: 2,
  },
  highlight: {
    durationPerCharMs: 42,
    minDurationMs: 420,
    maxDurationMs: 12000,
    markerLeadMinPx: 4,
    markerLeadMaxPx: 10,
    baselineOffsetPx: 4,
  },
  math: {
    durationMs: 1200,
    widthReferencePx: 320,
    minWeight: 0.8,
    maxWeight: 2.4,
    baselineOffsetPx: 6,
  },
};

export const BUILTIN_ANIMATION_PROFILES: ReadonlyArray<AnimationProfile> = [
  CLASSIC_CHALK_PROFILE,
];
