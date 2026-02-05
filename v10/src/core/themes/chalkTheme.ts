const holderBorder = "rgba(224, 242, 254, 0.75)";
const holderBackground =
  "linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(186, 230, 253, 0.95))";
const holderShadow = "0 0 10px rgba(56, 189, 248, 0.4)";
const accentHighlight = "rgba(255, 255, 255, 0.45)";

const chalkGradient = "linear-gradient(180deg, #ffffff, #e0f2fe)";
const chalkGlow = "0 0 8px rgba(125, 211, 252, 0.6)";

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
      width: 48,
      height: 32,
      radius: 10,
    },
    chalk: {
      width: 12,
      height: 18,
      offsetX: 16,
      offsetY: 9,
      rotateDeg: 0,
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
      radius: 10,
    },
    chalk: {
      width: 12,
      height: 18,
      offsetX: 16,
      offsetY: 9,
      rotateDeg: 0,
    },
    accent: {
      width: 6,
      height: 16,
      offsetX: 4,
      offsetY: 4,
    },
  },
  marker: {
    width: 48,
    height: 32,
    marginLeft: 6,
    holderWidth: 48,
    holderHeight: 32,
    holderRadius: 10,
    holderBorder,
    holderBackground,
    holderShadow,
    chalkWidth: 12,
    chalkHeight: 18,
    chalkOffsetX: 16,
    chalkOffsetY: 9,
    chalkRotateDeg: 0,
    chalkGradient,
    chalkGlow,
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
