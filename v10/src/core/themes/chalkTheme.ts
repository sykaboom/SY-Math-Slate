const holderBorder = "rgba(148, 163, 184, 0.7)";
const holderBackground =
  "linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.9) 35%, rgba(148, 163, 184, 0.85) 65%, rgba(226, 232, 240, 0.95))";
const holderShadow = "0 0 10px rgba(56, 189, 248, 0.35)";
const holderHighlight =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0))";
const holderBand =
  "linear-gradient(180deg, rgba(125, 211, 252, 0.9), rgba(14, 116, 144, 0.9))";

const tipGradient = "linear-gradient(180deg, #f8fafc, #e2e8f0)";
const tipGlow = "0 0 6px rgba(125, 211, 252, 0.55)";
const tipBorder = "rgba(241, 245, 249, 0.9)";

export const chalkTheme = {
  tipOffset: { x: 10, y: 10 },
  baselineOffset: {
    anchor: 6,
    flow: 6,
    fallback: 28,
  },
  colors: {
    holderBorder,
    holderBackground,
    holderShadow,
    holderHighlight,
    holderBand,
    tipGradient,
    tipGlow,
    tipBorder,
  },
  holder: {
    frame: {
      size: 44,
    },
    angleDeg: 45,
    body: {
      length: 30,
      thickness: 12,
      radius: 6,
      bandOffset: 6,
      bandWidth: 4,
      highlightOffset: 8,
      highlightLength: 14,
      highlightThickness: 2,
    },
    tip: {
      length: 8,
      thickness: 8,
      radius: 4,
    },
  },
} as const;

export type ChalkTheme = typeof chalkTheme;
