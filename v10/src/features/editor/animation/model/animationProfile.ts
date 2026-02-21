export type TextRevealMode = "clip" | "char";

export type AnimationProfile = {
  version: 1;
  id: string;
  label: string;
  text: {
    revealMode: TextRevealMode;
    durationPerCharMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    cursorLeadMinPx: number;
    cursorLeadMaxPx: number;
    baselineOffsetPx: number;
    clipOverscanPx: number;
  };
  highlight: {
    durationPerCharMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    markerLeadMinPx: number;
    markerLeadMaxPx: number;
    baselineOffsetPx: number;
  };
  math: {
    durationMs: number;
    widthReferencePx: number;
    minWeight: number;
    maxWeight: number;
    baselineOffsetPx: number;
  };
};
