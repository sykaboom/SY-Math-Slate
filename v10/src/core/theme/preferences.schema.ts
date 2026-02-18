type ThemeCanvasRatio = "16:9" | "4:3" | "A4" | "free";
type ThemeCanvasBackground = "solid" | "grid" | "dotted" | "lined";
type ThemePanelDensity = "compact" | "comfortable" | "spacious";
type ThemeInkTool = "pen" | "laser" | "eraser";
type ThemeInkSmoothing = "none" | "light" | "heavy";
type ThemeViewerControls = "always" | "hover" | "never";
type ThemeViewerNavigation = "arrows" | "swipe" | "both";
type ThemeFontSize = "small" | "medium" | "large";

const THEME_CANVAS_RATIO_VALUES = ["16:9", "4:3", "A4", "free"] as const;
const THEME_CANVAS_BACKGROUND_VALUES = [
  "solid",
  "grid",
  "dotted",
  "lined",
] as const;
const THEME_PANEL_DENSITY_VALUES = ["compact", "comfortable", "spacious"] as const;
const THEME_INK_TOOL_VALUES = ["pen", "laser", "eraser"] as const;
const THEME_INK_SMOOTHING_VALUES = ["none", "light", "heavy"] as const;
const THEME_VIEWER_CONTROLS_VALUES = ["always", "hover", "never"] as const;
const THEME_VIEWER_NAVIGATION_VALUES = ["arrows", "swipe", "both"] as const;
const THEME_FONT_SIZE_VALUES = ["small", "medium", "large"] as const;

export type ThemePreferences = {
  canvas: {
    defaultRatio: ThemeCanvasRatio;
    background: ThemeCanvasBackground;
    defaultZoom: number;
  };
  panels: {
    density: ThemePanelDensity;
  };
  ink: {
    defaultTool: ThemeInkTool;
    defaultPenWidth: number;
    defaultPenOpacity: number;
    smoothing: ThemeInkSmoothing;
  };
  viewer: {
    autoPlaySpeed: number;
    showControls: ThemeViewerControls;
    navigationStyle: ThemeViewerNavigation;
  };
  accessibility: {
    reduceMotion: boolean;
    fontSize: ThemeFontSize;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T => {
  if (typeof value !== "string") return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
};

const asNumberInRange = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const asBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value !== "boolean") return fallback;
  return value;
};

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  canvas: {
    defaultRatio: "16:9",
    background: "solid",
    defaultZoom: 1,
  },
  panels: {
    density: "comfortable",
  },
  ink: {
    defaultTool: "pen",
    defaultPenWidth: 4,
    defaultPenOpacity: 1,
    smoothing: "light",
  },
  viewer: {
    autoPlaySpeed: 1,
    showControls: "always",
    navigationStyle: "both",
  },
  accessibility: {
    reduceMotion: false,
    fontSize: "medium",
  },
};

export const cloneThemePreferences = (
  preferences: ThemePreferences
): ThemePreferences => ({
  canvas: { ...preferences.canvas },
  panels: { ...preferences.panels },
  ink: { ...preferences.ink },
  viewer: { ...preferences.viewer },
  accessibility: { ...preferences.accessibility },
});

export const normalizeThemePreferences = (
  value: unknown,
  fallback: ThemePreferences = DEFAULT_THEME_PREFERENCES
): ThemePreferences => {
  const base = cloneThemePreferences(fallback);
  if (!isRecord(value)) return base;

  const canvas = isRecord(value.canvas) ? value.canvas : {};
  const panels = isRecord(value.panels) ? value.panels : {};
  const ink = isRecord(value.ink) ? value.ink : {};
  const viewer = isRecord(value.viewer) ? value.viewer : {};
  const accessibility = isRecord(value.accessibility) ? value.accessibility : {};

  return {
    canvas: {
      defaultRatio: asEnum(
        canvas.defaultRatio,
        THEME_CANVAS_RATIO_VALUES,
        base.canvas.defaultRatio
      ),
      background: asEnum(
        canvas.background,
        THEME_CANVAS_BACKGROUND_VALUES,
        base.canvas.background
      ),
      defaultZoom: asNumberInRange(canvas.defaultZoom, base.canvas.defaultZoom, 0.5, 2),
    },
    panels: {
      density: asEnum(panels.density, THEME_PANEL_DENSITY_VALUES, base.panels.density),
    },
    ink: {
      defaultTool: asEnum(
        ink.defaultTool,
        THEME_INK_TOOL_VALUES,
        base.ink.defaultTool
      ),
      defaultPenWidth: asNumberInRange(
        ink.defaultPenWidth,
        base.ink.defaultPenWidth,
        1,
        20
      ),
      defaultPenOpacity: asNumberInRange(
        ink.defaultPenOpacity,
        base.ink.defaultPenOpacity,
        0.1,
        1
      ),
      smoothing: asEnum(
        ink.smoothing,
        THEME_INK_SMOOTHING_VALUES,
        base.ink.smoothing
      ),
    },
    viewer: {
      autoPlaySpeed: asNumberInRange(
        viewer.autoPlaySpeed,
        base.viewer.autoPlaySpeed,
        0.5,
        3
      ),
      showControls: asEnum(
        viewer.showControls,
        THEME_VIEWER_CONTROLS_VALUES,
        base.viewer.showControls
      ),
      navigationStyle: asEnum(
        viewer.navigationStyle,
        THEME_VIEWER_NAVIGATION_VALUES,
        base.viewer.navigationStyle
      ),
    },
    accessibility: {
      reduceMotion: asBoolean(accessibility.reduceMotion, base.accessibility.reduceMotion),
      fontSize: asEnum(
        accessibility.fontSize,
        THEME_FONT_SIZE_VALUES,
        base.accessibility.fontSize
      ),
    },
  };
};

export const mergeThemePreferences = (
  base: ThemePreferences,
  partial: Partial<ThemePreferences>
): ThemePreferences => {
  return normalizeThemePreferences(
    {
      canvas: partial.canvas ? { ...base.canvas, ...partial.canvas } : base.canvas,
      panels: partial.panels ? { ...base.panels, ...partial.panels } : base.panels,
      ink: partial.ink ? { ...base.ink, ...partial.ink } : base.ink,
      viewer: partial.viewer ? { ...base.viewer, ...partial.viewer } : base.viewer,
      accessibility: partial.accessibility
        ? { ...base.accessibility, ...partial.accessibility }
        : base.accessibility,
    },
    base
  );
};
