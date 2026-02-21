import type { ToolbarMode } from "@features/chrome/toolbar/toolbarModePolicy";

export const TOOLBAR_ACTION_IDS = [
  "draw.hand",
  "draw.pen",
  "draw.eraser",
  "draw.laser",
  "draw.text",
  "draw.image",
  "draw.clipboard",
  "draw.undo",
  "draw.redo",
  "draw.break.line",
  "draw.break.column",
  "draw.break.page",
  "playback.step.prev",
  "playback.step.next",
  "playback.undo",
  "playback.redo",
  "playback.sound.toggle",
  "playback.extras",
  "canvas.fullscreen.toggle",
  "canvas.sound.toggle",
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
] as const;

export type ToolbarActionId = (typeof TOOLBAR_ACTION_IDS)[number];

export type ToolbarActionCatalogEntry = {
  id: ToolbarActionId;
  label: string;
  modes: readonly ToolbarMode[];
};

const TOOLBAR_ACTION_CATALOG: readonly ToolbarActionCatalogEntry[] = [
  { id: "draw.hand", label: "Hand Tool", modes: ["draw"] },
  { id: "draw.pen", label: "Pen Tool", modes: ["draw"] },
  { id: "draw.eraser", label: "Eraser Tool", modes: ["draw"] },
  { id: "draw.laser", label: "Laser Tool", modes: ["draw"] },
  { id: "draw.text", label: "Text Input", modes: ["draw"] },
  { id: "draw.image", label: "Image Insert", modes: ["draw"] },
  { id: "draw.clipboard", label: "Clipboard Helper", modes: ["draw"] },
  { id: "draw.undo", label: "Undo", modes: ["draw"] },
  { id: "draw.redo", label: "Redo", modes: ["draw"] },
  { id: "draw.break.line", label: "Line Break", modes: ["draw"] },
  { id: "draw.break.column", label: "Column Break", modes: ["draw"] },
  { id: "draw.break.page", label: "Page Break", modes: ["draw"] },
  { id: "playback.step.prev", label: "Previous Step", modes: ["playback"] },
  { id: "playback.step.next", label: "Next Step", modes: ["playback"] },
  { id: "playback.undo", label: "Undo", modes: ["playback"] },
  { id: "playback.redo", label: "Redo", modes: ["playback"] },
  { id: "playback.sound.toggle", label: "Sound Toggle", modes: ["playback"] },
  { id: "playback.extras", label: "Playback Extras", modes: ["playback"] },
  {
    id: "canvas.fullscreen.toggle",
    label: "Fullscreen Ink Toggle",
    modes: ["canvas"],
  },
  { id: "canvas.sound.toggle", label: "Sound Toggle", modes: ["canvas"] },
  { id: "more.file.open", label: "Open File", modes: ["draw", "playback", "canvas"] },
  { id: "more.file.save", label: "Save File", modes: ["draw", "playback", "canvas"] },
  { id: "more.local.save", label: "Save Local", modes: ["draw", "playback", "canvas"] },
  { id: "more.local.reset", label: "Reset Local", modes: ["draw", "playback", "canvas"] },
  { id: "more.view.reset", label: "Reset View", modes: ["draw", "playback", "canvas"] },
  { id: "more.cursor.toggle", label: "Toggle Cursor", modes: ["draw", "playback", "canvas"] },
  {
    id: "more.layout.canvas-border",
    label: "Canvas Border Toggle",
    modes: ["draw", "playback", "canvas"],
  },
  {
    id: "more.layout.break-guides",
    label: "Break Guide Toggle",
    modes: ["draw", "playback", "canvas"],
  },
  { id: "more.overview.toggle", label: "Overview Toggle", modes: ["draw", "playback", "canvas"] },
  {
    id: "more.overview.ratio.16x9",
    label: "Overview Ratio 16:9",
    modes: ["draw", "playback", "canvas"],
  },
  {
    id: "more.overview.ratio.4x3",
    label: "Overview Ratio 4:3",
    modes: ["draw", "playback", "canvas"],
  },
  { id: "more.step.prev", label: "More Previous Step", modes: ["draw", "canvas"] },
  { id: "more.step.next", label: "More Next Step", modes: ["draw", "canvas"] },
] as const;

const assertNoCatalogDuplicates = (): void => {
  const seen = new Set<string>();
  for (const entry of TOOLBAR_ACTION_CATALOG) {
    if (seen.has(entry.id)) {
      throw new Error(`duplicate toolbar action id in catalog: ${entry.id}`);
    }
    seen.add(entry.id);
  }
};

assertNoCatalogDuplicates();

export const listToolbarActionCatalog = (): readonly ToolbarActionCatalogEntry[] =>
  TOOLBAR_ACTION_CATALOG;

export const listToolbarActionIdsByMode = (
  mode: ToolbarMode
): readonly ToolbarActionId[] =>
  TOOLBAR_ACTION_CATALOG.filter((entry) => entry.modes.includes(mode)).map(
    (entry) => entry.id
  );
