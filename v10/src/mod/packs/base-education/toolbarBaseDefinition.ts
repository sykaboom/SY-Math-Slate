import type {
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseModeDefinition,
} from "@core/runtime/modding/package";
import type {
  TemplateActionSurfaceRule,
  TemplateToolbarMode,
  TemplateViewportProfile,
} from "../../schema/templatePack.types";

type ToolbarSurface = TemplateActionSurfaceRule["surface"];

type ToolbarActionPlacement = {
  readonly mode: TemplateToolbarMode;
  readonly surface: ToolbarSurface;
  readonly order?: number;
};

type ToolbarActionDefinition = {
  readonly id: string;
  readonly label: string;
  readonly placements: readonly ToolbarActionPlacement[];
};

type ToolbarBaseDefinition = {
  readonly modeDefinitions: readonly ToolbarBaseModeDefinition[];
  readonly actionDefinitions: readonly ToolbarActionDefinition[];
};

const DRAW_PRIMARY_PLACEMENTS = [
  { mode: "draw", surface: "primary" },
] as const satisfies readonly ToolbarActionPlacement[];

const DRAW_MORE_PLACEMENTS = [
  { mode: "draw", surface: "more" },
] as const satisfies readonly ToolbarActionPlacement[];

const PLAYBACK_PRIMARY_PLACEMENTS = [
  { mode: "playback", surface: "primary" },
] as const satisfies readonly ToolbarActionPlacement[];

const CANVAS_PRIMARY_PLACEMENTS = [
  { mode: "canvas", surface: "primary" },
] as const satisfies readonly ToolbarActionPlacement[];

const MORE_ALL_MODES_PLACEMENTS = [
  { mode: "draw", surface: "more" },
  { mode: "playback", surface: "more" },
  { mode: "canvas", surface: "more" },
] as const satisfies readonly ToolbarActionPlacement[];

const MORE_DRAW_CANVAS_PLACEMENTS = [
  { mode: "draw", surface: "more" },
  { mode: "canvas", surface: "more" },
] as const satisfies readonly ToolbarActionPlacement[];

const BASE_EDUCATION_TOOLBAR_MODE_DEFINITION_SOURCE = [
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
] as const satisfies readonly ToolbarBaseModeDefinition[];

const BASE_EDUCATION_TOOLBAR_ACTION_DEFINITION_SOURCE = [
  { id: "draw.hand", label: "Hand Tool", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.pen", label: "Pen Tool", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.eraser", label: "Eraser Tool", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.laser", label: "Laser Tool", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.text", label: "Text Input", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.image", label: "Image Insert", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.clipboard", label: "Clipboard Helper", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.undo", label: "Undo", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.redo", label: "Redo", placements: DRAW_PRIMARY_PLACEMENTS },
  { id: "draw.break.line", label: "Line Break", placements: DRAW_MORE_PLACEMENTS },
  {
    id: "draw.break.column",
    label: "Column Break",
    placements: DRAW_MORE_PLACEMENTS,
  },
  { id: "draw.break.page", label: "Page Break", placements: DRAW_MORE_PLACEMENTS },
  {
    id: "playback.step.prev",
    label: "Previous Step",
    placements: PLAYBACK_PRIMARY_PLACEMENTS,
  },
  {
    id: "playback.step.next",
    label: "Next Step",
    placements: PLAYBACK_PRIMARY_PLACEMENTS,
  },
  { id: "playback.undo", label: "Undo", placements: PLAYBACK_PRIMARY_PLACEMENTS },
  { id: "playback.redo", label: "Redo", placements: PLAYBACK_PRIMARY_PLACEMENTS },
  {
    id: "playback.sound.toggle",
    label: "Sound Toggle",
    placements: PLAYBACK_PRIMARY_PLACEMENTS,
  },
  {
    id: "playback.extras",
    label: "Playback Extras",
    placements: PLAYBACK_PRIMARY_PLACEMENTS,
  },
  {
    id: "canvas.fullscreen.toggle",
    label: "Fullscreen Ink Toggle",
    placements: CANVAS_PRIMARY_PLACEMENTS,
  },
  {
    id: "canvas.sound.toggle",
    label: "Sound Toggle",
    placements: CANVAS_PRIMARY_PLACEMENTS,
  },
  { id: "more.file.open", label: "Open File", placements: MORE_ALL_MODES_PLACEMENTS },
  { id: "more.file.save", label: "Save File", placements: MORE_ALL_MODES_PLACEMENTS },
  { id: "more.local.save", label: "Save Local", placements: MORE_ALL_MODES_PLACEMENTS },
  {
    id: "more.local.reset",
    label: "Reset Local",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  { id: "more.view.reset", label: "Reset View", placements: MORE_ALL_MODES_PLACEMENTS },
  {
    id: "more.cursor.toggle",
    label: "Toggle Cursor",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  {
    id: "more.layout.canvas-border",
    label: "Canvas Border Toggle",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  {
    id: "more.layout.break-guides",
    label: "Break Guide Toggle",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  {
    id: "more.overview.toggle",
    label: "Overview Toggle",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  {
    id: "more.overview.ratio.16x9",
    label: "Overview Ratio 16:9",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  {
    id: "more.overview.ratio.4x3",
    label: "Overview Ratio 4:3",
    placements: MORE_ALL_MODES_PLACEMENTS,
  },
  {
    id: "more.step.prev",
    label: "More Previous Step",
    placements: MORE_DRAW_CANVAS_PLACEMENTS,
  },
  {
    id: "more.step.next",
    label: "More Next Step",
    placements: MORE_DRAW_CANVAS_PLACEMENTS,
  },
] as const satisfies readonly ToolbarActionDefinition[];

const MODE_SURFACE_BUILD_ORDER = [
  { mode: "draw", surface: "primary" },
  { mode: "draw", surface: "more" },
  { mode: "playback", surface: "primary" },
  { mode: "playback", surface: "more" },
  { mode: "canvas", surface: "primary" },
  { mode: "canvas", surface: "more" },
] as const satisfies readonly ToolbarActionPlacement[];

const BASE_EDUCATION_TOOLBAR_VIEWPORTS = [
  "desktop",
  "tablet",
  "mobile",
] as const satisfies readonly TemplateViewportProfile[];

const toUniqueModes = (
  placements: readonly ToolbarActionPlacement[]
): TemplateToolbarMode[] => {
  const modes: TemplateToolbarMode[] = [];
  for (const placement of placements) {
    if (modes.includes(placement.mode)) continue;
    modes.push(placement.mode);
  }
  return modes;
};

const listActionIdsByPlacement = (
  mode: TemplateToolbarMode,
  surface: ToolbarSurface
): BaseEducationActionId[] => {
  const matched: { id: BaseEducationActionId; order: number; index: number }[] = [];
  for (const [index, definition] of BASE_EDUCATION_TOOLBAR_ACTION_DEFINITION_SOURCE.entries()) {
    const placement = definition.placements.find(
      (candidate) => candidate.mode === mode && candidate.surface === surface
    );
    if (!placement) continue;
    const placementOrder =
      "order" in placement && typeof placement.order === "number"
        ? placement.order
        : 0;
    matched.push({
      id: definition.id,
      order: placementOrder,
      index,
    });
  }
  matched.sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order;
    return left.index - right.index;
  });
  return matched.map((entry) => entry.id);
};

const buildActionSurfaceRules = (): readonly TemplateActionSurfaceRule[] => {
  const rules: TemplateActionSurfaceRule[] = [];
  for (const placement of MODE_SURFACE_BUILD_ORDER) {
    const actionIds = listActionIdsByPlacement(placement.mode, placement.surface);
    for (const viewport of BASE_EDUCATION_TOOLBAR_VIEWPORTS) {
      for (const actionId of actionIds) {
        rules.push({
          mode: placement.mode,
          viewport,
          actionId,
          surface: placement.surface,
        });
      }
    }
  }
  return Object.freeze(rules);
};

export type BaseEducationActionId =
  (typeof BASE_EDUCATION_TOOLBAR_ACTION_DEFINITION_SOURCE)[number]["id"];

export const BASE_EDUCATION_TOOLBAR_BASE_DEFINITION: ToolbarBaseDefinition =
  Object.freeze({
    modeDefinitions: BASE_EDUCATION_TOOLBAR_MODE_DEFINITION_SOURCE,
    actionDefinitions: BASE_EDUCATION_TOOLBAR_ACTION_DEFINITION_SOURCE,
  });

export const BASE_EDUCATION_TOOLBAR_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  BASE_EDUCATION_TOOLBAR_BASE_DEFINITION.modeDefinitions;

export const BASE_EDUCATION_ACTION_IDS = Object.freeze(
  BASE_EDUCATION_TOOLBAR_BASE_DEFINITION.actionDefinitions.map(
    (definition) => definition.id
  )
) as readonly BaseEducationActionId[];

export const BASE_EDUCATION_TOOLBAR_ACTION_CATALOG: readonly ToolbarBaseActionCatalogEntry[] =
  Object.freeze(
    BASE_EDUCATION_TOOLBAR_BASE_DEFINITION.actionDefinitions.map((definition) =>
      Object.freeze({
        id: definition.id,
        label: definition.label,
        modes: Object.freeze([...toUniqueModes(definition.placements)]),
      })
    )
  );

export const BASE_EDUCATION_TOOLBAR_ACTION_SURFACE_RULES: readonly TemplateActionSurfaceRule[] =
  buildActionSurfaceRules();
