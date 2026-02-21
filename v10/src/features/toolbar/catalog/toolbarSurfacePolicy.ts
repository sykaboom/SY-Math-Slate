import type { ToolbarMode } from "@features/toolbar/toolbarModePolicy";
import { getPrimaryRuntimeTemplatePack } from "@/mod/bridge/packRegistryBridge";
import type { ToolbarActionId } from "./toolbarActionCatalog";
import type { ToolbarViewportProfile } from "./toolbarViewportProfile";

export type ToolbarSurface = "primary" | "more" | "hidden";

type ToolbarSurfaceRule = {
  mode: ToolbarMode;
  viewport: ToolbarViewportProfile;
  actionId: ToolbarActionId | string;
  surface: ToolbarSurface;
};

const VIEWPORTS: readonly ToolbarViewportProfile[] = [
  "desktop",
  "tablet",
  "mobile",
] as const;

const pushRules = (
  target: ToolbarSurfaceRule[],
  mode: ToolbarMode,
  actionIds: readonly string[],
  surface: ToolbarSurface
): void => {
  for (const viewport of VIEWPORTS) {
    for (const actionId of actionIds) {
      target.push({ mode, viewport, actionId, surface });
    }
  }
};

const FALLBACK_RULES: ToolbarSurfaceRule[] = [];

pushRules(
  FALLBACK_RULES,
  "draw",
  [
    "draw.hand",
    "draw.pen",
    "draw.eraser",
    "draw.laser",
    "draw.text",
    "draw.image",
    "draw.clipboard",
    "draw.undo",
    "draw.redo",
  ],
  "primary"
);
pushRules(
  FALLBACK_RULES,
  "draw",
  [
    "draw.break.line",
    "draw.break.column",
    "draw.break.page",
    "more.file.open",
    "more.file.save",
    "more.local.save",
    "more.local.reset",
    "more.view.reset",
    "more.cursor.toggle",
    "more.layout.canvas-border",
    "more.layout.break-guides",
    "more.overview.toggle",
    "more.overview.ratio.16x9",
    "more.overview.ratio.4x3",
    "more.step.prev",
    "more.step.next",
  ],
  "more"
);
pushRules(
  FALLBACK_RULES,
  "playback",
  [
    "playback.step.prev",
    "playback.step.next",
    "playback.undo",
    "playback.redo",
    "playback.sound.toggle",
    "playback.extras",
  ],
  "primary"
);
pushRules(
  FALLBACK_RULES,
  "playback",
  [
    "more.file.open",
    "more.file.save",
    "more.local.save",
    "more.local.reset",
    "more.view.reset",
    "more.cursor.toggle",
    "more.layout.canvas-border",
    "more.layout.break-guides",
    "more.overview.toggle",
    "more.overview.ratio.16x9",
    "more.overview.ratio.4x3",
  ],
  "more"
);
pushRules(
  FALLBACK_RULES,
  "canvas",
  [
    "canvas.fullscreen.toggle",
    "canvas.sound.toggle",
  ],
  "primary"
);
pushRules(
  FALLBACK_RULES,
  "canvas",
  [
    "more.file.open",
    "more.file.save",
    "more.local.save",
    "more.local.reset",
    "more.view.reset",
    "more.cursor.toggle",
    "more.layout.canvas-border",
    "more.layout.break-guides",
    "more.overview.toggle",
    "more.overview.ratio.16x9",
    "more.overview.ratio.4x3",
    "more.step.prev",
    "more.step.next",
  ],
  "more"
);

const buildPolicyMap = (): Map<string, ToolbarSurface> => {
  const map = new Map<string, ToolbarSurface>();
  const runtimeRules = getPrimaryRuntimeTemplatePack()?.actionSurfaceRules ?? [];
  const merged = [...FALLBACK_RULES, ...runtimeRules];
  for (const rule of merged) {
    const key = `${rule.mode}:${rule.viewport}:${rule.actionId}`;
    map.set(key, rule.surface);
  }
  return map;
};

const resolveSurfaceFromMap = (
  map: Map<string, ToolbarSurface>,
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile,
  actionId: string
): ToolbarSurface => {
  return map.get(`${mode}:${viewport}:${actionId}`) ?? "hidden";
};

export const resolveToolbarActionSurface = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile,
  actionId: ToolbarActionId | string
): ToolbarSurface => {
  const map = buildPolicyMap();
  return resolveSurfaceFromMap(map, mode, viewport, actionId);
};

const isPrimary = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile,
  actionId: ToolbarActionId | string
): boolean => resolveToolbarActionSurface(mode, viewport, actionId) === "primary";

const isMore = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile,
  actionId: ToolbarActionId | string
): boolean => resolveToolbarActionSurface(mode, viewport, actionId) === "more";

export type DrawToolbarSurfacePolicy = {
  hand: boolean;
  pen: boolean;
  eraser: boolean;
  laser: boolean;
  text: boolean;
  image: boolean;
  clipboard: boolean;
  undoRedo: boolean;
  breakActions: boolean;
};

export const resolveDrawToolbarSurfacePolicy = (
  viewport: ToolbarViewportProfile,
  cutoverEnabled: boolean
): DrawToolbarSurfacePolicy => ({
  hand: isPrimary("draw", viewport, "draw.hand"),
  pen: isPrimary("draw", viewport, "draw.pen"),
  eraser: isPrimary("draw", viewport, "draw.eraser"),
  laser: isPrimary("draw", viewport, "draw.laser"),
  text: isPrimary("draw", viewport, "draw.text"),
  image: isPrimary("draw", viewport, "draw.image"),
  clipboard: isPrimary("draw", viewport, "draw.clipboard"),
  undoRedo:
    isPrimary("draw", viewport, "draw.undo") &&
    isPrimary("draw", viewport, "draw.redo"),
  breakActions:
    !cutoverEnabled &&
    isMore("draw", viewport, "draw.break.line") &&
    isMore("draw", viewport, "draw.break.column") &&
    isMore("draw", viewport, "draw.break.page"),
});

export type PlaybackToolbarSurfacePolicy = {
  step: boolean;
  undoRedo: boolean;
  sound: boolean;
  extras: boolean;
};

export const resolvePlaybackToolbarSurfacePolicy = (
  viewport: ToolbarViewportProfile,
  cutoverEnabled: boolean
): PlaybackToolbarSurfacePolicy => ({
  step:
    isPrimary("playback", viewport, "playback.step.prev") &&
    isPrimary("playback", viewport, "playback.step.next"),
  undoRedo:
    isPrimary("playback", viewport, "playback.undo") &&
    isPrimary("playback", viewport, "playback.redo"),
  sound: isPrimary("playback", viewport, "playback.sound.toggle"),
  extras:
    !cutoverEnabled && isPrimary("playback", viewport, "playback.extras"),
});

export type CanvasToolbarSurfacePolicy = {
  fullscreen: boolean;
  sound: boolean;
};

export const resolveCanvasToolbarSurfacePolicy = (
  viewport: ToolbarViewportProfile
): CanvasToolbarSurfacePolicy => ({
  fullscreen: isPrimary("canvas", viewport, "canvas.fullscreen.toggle"),
  sound: isPrimary("canvas", viewport, "canvas.sound.toggle"),
});

export type MorePanelSurfacePolicy = {
  step: boolean;
  history: boolean;
};

export const resolveMorePanelSurfacePolicy = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile
): MorePanelSurfacePolicy => {
  const step =
    isMore(mode, viewport, "more.step.prev") &&
    isMore(mode, viewport, "more.step.next");

  const history =
    mode === "playback"
      ? isMore(mode, viewport, "playback.undo") &&
        isMore(mode, viewport, "playback.redo")
      : isMore(mode, viewport, "draw.undo") &&
        isMore(mode, viewport, "draw.redo");

  return { step, history };
};
