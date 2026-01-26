const holderBorder = "rgba(255, 255, 255, 0.1)";
const holderBackground = "rgba(0, 0, 0, 0.6)";
const holderShadow = "inset 0 0 6px rgba(0, 0, 0, 0.55)";
const accentHighlight = "rgba(255, 255, 255, 0.2)";

const chalkGradient = "linear-gradient(to bottom, #ffffff, #e2e8f0, #cbd5f5)";
const chalkGlow = "0 0 8px rgba(255, 255, 255, 0.35)";

export const chalkTheme = {
  tipOffset: { x: 22, y: 18 },
  baselineOffset: {
    anchor: 6,
    flow: 6,
    fallback: 28,
  },
  wobbleDurationMs: 9000,
  actorBobDurationMs: 220,
  colors: {
    holderBorder,
    holderBackground,
    holderShadow,
    accentHighlight,
    chalkGradient,
    chalkGlow,
  },
  indicator: {
    holder: {
      width: 40,
      height: 24,
      radius: 6,
    },
    chalk: {
      width: 8,
      height: 32,
      offsetX: 20,
      offsetY: -8,
      rotateDeg: -20,
    },
    accent: {
      width: 6,
      height: 16,
      offsetX: 4,
      offsetY: 4,
    },
  },
  actor: {
    holder: {
      width: 48,
      height: 32,
      radius: 6,
    },
    chalk: {
      width: 8,
      height: 32,
      offsetX: 20,
      offsetY: -12,
      rotateDeg: -20,
    },
    accent: {
      width: 6,
      height: 16,
      offsetX: 4,
      offsetY: 4,
    },
  },
  marker: {
    width: 18,
    height: 12,
    marginLeft: 6,
    holderWidth: 12,
    holderHeight: 8,
    holderRadius: 4,
    holderBorder,
    holderBackground: "rgba(0, 0, 0, 0.65)",
    holderShadow,
    chalkWidth: 4,
    chalkHeight: 12,
    chalkOffsetX: 7,
    chalkOffsetY: -1,
    chalkRotateDeg: -18,
    chalkGradient,
    chalkGlow: "0 0 6px rgba(255, 255, 255, 0.35)",
  },
} as const;

export type ChalkTheme = typeof chalkTheme;

export const chalkCssVars = {
  "--chalk-wobble-duration": `${chalkTheme.wobbleDurationMs}ms`,
  "--chalk-actor-bob-duration": `${chalkTheme.actorBobDurationMs}ms`,
  "--chalk-marker-width": `${chalkTheme.marker.width}px`,
  "--chalk-marker-height": `${chalkTheme.marker.height}px`,
  "--chalk-marker-margin-left": `${chalkTheme.marker.marginLeft}px`,
  "--chalk-marker-holder-width": `${chalkTheme.marker.holderWidth}px`,
  "--chalk-marker-holder-height": `${chalkTheme.marker.holderHeight}px`,
  "--chalk-marker-holder-radius": `${chalkTheme.marker.holderRadius}px`,
  "--chalk-marker-holder-border": chalkTheme.marker.holderBorder,
  "--chalk-marker-holder-bg": chalkTheme.marker.holderBackground,
  "--chalk-marker-holder-shadow": chalkTheme.marker.holderShadow,
  "--chalk-marker-chalk-width": `${chalkTheme.marker.chalkWidth}px`,
  "--chalk-marker-chalk-height": `${chalkTheme.marker.chalkHeight}px`,
  "--chalk-marker-chalk-offset-x": `${chalkTheme.marker.chalkOffsetX}px`,
  "--chalk-marker-chalk-offset-y": `${chalkTheme.marker.chalkOffsetY}px`,
  "--chalk-marker-chalk-rotate": `${chalkTheme.marker.chalkRotateDeg}deg`,
  "--chalk-marker-chalk-gradient": chalkTheme.marker.chalkGradient,
  "--chalk-marker-chalk-glow": chalkTheme.marker.chalkGlow,
} as const;
