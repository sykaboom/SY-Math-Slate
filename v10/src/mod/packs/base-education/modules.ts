import type {
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseModeDefinition,
} from "@core/runtime/modding/package";

const ALL_TOOLBAR_MODES = ["draw", "playback", "canvas"] as const;
const DRAW_CANVAS_MODES = ["draw", "canvas"] as const;

export const BASE_EDUCATION_TOOLBAR_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([
    {
      id: "draw",
      label: "Draw",
      fallbackModId: "draw",
    },
    {
      id: "playback",
      label: "Playback",
      fallbackModId: "lecture",
    },
    {
      id: "canvas",
      label: "Canvas",
      fallbackModId: "canvas",
    },
  ]);

export const BASE_EDUCATION_ACTION_IDS = [
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
  "canvas.dock.left",
  "canvas.dock.center",
  "canvas.dock.right",
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

export type BaseEducationActionId = (typeof BASE_EDUCATION_ACTION_IDS)[number];

export const BASE_EDUCATION_TOOLBAR_ACTION_CATALOG: readonly ToolbarBaseActionCatalogEntry[] =
  Object.freeze([
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
    {
      id: "playback.sound.toggle",
      label: "Sound Toggle",
      modes: ["playback"],
    },
    { id: "playback.extras", label: "Playback Extras", modes: ["playback"] },
    {
      id: "canvas.fullscreen.toggle",
      label: "Fullscreen Ink Toggle",
      modes: ["canvas"],
    },
    { id: "canvas.sound.toggle", label: "Sound Toggle", modes: ["canvas"] },
    { id: "canvas.dock.left", label: "Dock Left", modes: ALL_TOOLBAR_MODES },
    {
      id: "canvas.dock.center",
      label: "Dock Center",
      modes: ALL_TOOLBAR_MODES,
    },
    { id: "canvas.dock.right", label: "Dock Right", modes: ALL_TOOLBAR_MODES },
    { id: "more.file.open", label: "Open File", modes: ALL_TOOLBAR_MODES },
    { id: "more.file.save", label: "Save File", modes: ALL_TOOLBAR_MODES },
    { id: "more.local.save", label: "Save Local", modes: ALL_TOOLBAR_MODES },
    { id: "more.local.reset", label: "Reset Local", modes: ALL_TOOLBAR_MODES },
    { id: "more.view.reset", label: "Reset View", modes: ALL_TOOLBAR_MODES },
    {
      id: "more.cursor.toggle",
      label: "Toggle Cursor",
      modes: ALL_TOOLBAR_MODES,
    },
    {
      id: "more.layout.canvas-border",
      label: "Canvas Border Toggle",
      modes: ALL_TOOLBAR_MODES,
    },
    {
      id: "more.layout.break-guides",
      label: "Break Guide Toggle",
      modes: ALL_TOOLBAR_MODES,
    },
    {
      id: "more.overview.toggle",
      label: "Overview Toggle",
      modes: ALL_TOOLBAR_MODES,
    },
    {
      id: "more.overview.ratio.16x9",
      label: "Overview Ratio 16:9",
      modes: ALL_TOOLBAR_MODES,
    },
    {
      id: "more.overview.ratio.4x3",
      label: "Overview Ratio 4:3",
      modes: ALL_TOOLBAR_MODES,
    },
    { id: "more.step.prev", label: "More Previous Step", modes: DRAW_CANVAS_MODES },
    { id: "more.step.next", label: "More Next Step", modes: DRAW_CANVAS_MODES },
  ]);
