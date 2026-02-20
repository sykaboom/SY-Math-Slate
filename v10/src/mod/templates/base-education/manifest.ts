import {
  TEMPLATE_PACK_MANIFEST_VERSION,
  type TemplateActionSurfaceRule,
  type TemplatePackManifest,
  type TemplateToolbarMode,
  type TemplateViewportProfile,
} from "../_contracts/templatePack.types";
import { BASE_EDUCATION_LAYOUT } from "./layout";
import { BASE_EDUCATION_THEME } from "./theme";

const VIEWPORTS: readonly TemplateViewportProfile[] = [
  "desktop",
  "tablet",
  "mobile",
] as const;

const pushRules = (
  target: TemplateActionSurfaceRule[],
  mode: TemplateToolbarMode,
  actionIds: readonly string[],
  surface: "primary" | "more" | "hidden"
): void => {
  for (const viewport of VIEWPORTS) {
    for (const actionId of actionIds) {
      target.push({ mode, viewport, actionId, surface });
    }
  }
};

const rules: TemplateActionSurfaceRule[] = [];

pushRules(
  rules,
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
  rules,
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
    "canvas.dock.left",
    "canvas.dock.center",
    "canvas.dock.right",
  ],
  "more"
);

pushRules(
  rules,
  "playback",
  [
    "playback.step.prev",
    "playback.step.next",
    "playback.undo",
    "playback.redo",
    "playback.sound.toggle",
  ],
  "primary"
);
pushRules(
  rules,
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
    "canvas.dock.left",
    "canvas.dock.center",
    "canvas.dock.right",
  ],
  "more"
);

pushRules(
  rules,
  "canvas",
  [
    "canvas.fullscreen.toggle",
    "canvas.sound.toggle",
    "canvas.dock.left",
    "canvas.dock.center",
    "canvas.dock.right",
  ],
  "primary"
);
pushRules(
  rules,
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

export const BASE_EDUCATION_TEMPLATE_PACK: TemplatePackManifest = {
  manifestVersion: TEMPLATE_PACK_MANIFEST_VERSION,
  packId: "base-education",
  title: "Base Education Template",
  description: "Default education-focused toolbar/session composition.",
  kind: "base",
  actionSurfaceRules: rules,
  layout: BASE_EDUCATION_LAYOUT,
  theme: BASE_EDUCATION_THEME,
  defaultEnabled: true,
};

