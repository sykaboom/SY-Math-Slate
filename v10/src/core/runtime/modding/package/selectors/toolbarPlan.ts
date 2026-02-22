import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageToolbarMode,
  ModResourceMergeDiagnostic,
  ResolvedToolbarPlan,
  ResolvedToolbarPlanInput,
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurface,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
  ToolbarBaseProvider,
} from "../types";
import { getRuntimeToolbarBaseProvider } from "../registry";
import { selectRuntimeModResourceOverridesForLayer } from "./activePackageRules";
import { mergeUIItemsByResourceLayerLoadOrder } from "./resourceItemMerge";

const EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([]);
const EMPTY_TOOLBAR_BASE_ACTION_CATALOG: readonly ToolbarBaseActionCatalogEntry[] =
  Object.freeze([]);
const EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES: readonly ToolbarBaseActionSurfaceRule[] =
  Object.freeze([]);
const DEFAULT_TOOLBAR_MODE: ModPackageToolbarMode = "draw";
const DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID: ModId = "draw";
const COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([
    { id: "draw", label: "Draw", fallbackModId: "draw" },
    { id: "playback", label: "Playback", fallbackModId: "lecture" },
    { id: "canvas", label: "Canvas", fallbackModId: "canvas" },
  ]);

export const selectResolvedToolbarPlan = (
  plan: ResolvedToolbarPlan
): ResolvedToolbarPlan => plan;

export const selectToolbarBaseProvider = (): ToolbarBaseProvider | null =>
  getRuntimeToolbarBaseProvider();

export const selectToolbarBaseModeDefinitions = (): readonly ToolbarBaseModeDefinition[] =>
  selectToolbarBaseProvider()?.modeDefinitions ?? EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS;

export const selectToolbarModeDefinitionsWithCompatFallback = (): readonly ToolbarBaseModeDefinition[] => {
  const definitions = selectToolbarBaseModeDefinitions();
  return definitions.length > 0
    ? definitions
    : COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS;
};

export const selectToolbarFallbackModIdForModeWithCompatFallback = (
  mode: ModPackageToolbarMode
): ModId | null =>
  selectToolbarModeDefinitionsWithCompatFallback().find(
    (definition) => definition.id === mode
  )?.fallbackModId ?? null;

export const selectToolbarDefaultModeWithCompatFallback =
  (): ModPackageToolbarMode =>
    (selectToolbarModeDefinitionsWithCompatFallback()[0]?.id as
      | ModPackageToolbarMode
      | undefined) ?? DEFAULT_TOOLBAR_MODE;

export const selectToolbarDefaultFallbackModIdWithCompatFallback =
  (): ModId =>
    selectToolbarFallbackModIdForModeWithCompatFallback(
      selectToolbarDefaultModeWithCompatFallback()
    ) ?? DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID;

export const selectRuntimeToolbarCutoverEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";

export const selectToolbarBaseActionCatalog = (): readonly ToolbarBaseActionCatalogEntry[] =>
  selectToolbarBaseProvider()?.actionCatalog ?? EMPTY_TOOLBAR_BASE_ACTION_CATALOG;

export const selectToolbarBaseActionSurfaceRules = (): readonly ToolbarBaseActionSurfaceRule[] =>
  selectToolbarBaseProvider()?.actionSurfaceRules ??
  EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES;

export const selectResolvedToolbarPlanInputFromBaseProvider = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan | null => {
  const provider = selectToolbarBaseProvider();
  if (!provider) return null;
  return provider.resolvePlan(input);
};

const buildFallbackResolvedToolbarPlan = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan =>
  selectResolvedToolbarPlan({
    mode: input.mode,
    viewport: input.viewport,
    cutoverEnabled: input.cutoverEnabled,
    draw: {
      hand: false,
      pen: false,
      eraser: false,
      laser: false,
      text: false,
      image: false,
      clipboard: false,
      undoRedo: false,
      breakActions: false,
    },
    playback: {
      step: false,
      undoRedo: false,
      sound: false,
      extras: false,
    },
    canvas: {
      fullscreen: false,
      sound: false,
    },
    morePanel: {
      step: false,
      history: false,
    },
  });

export const selectResolvedToolbarPlanInputFromRuntimeResolver = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan =>
  selectResolvedToolbarPlanInputFromBaseProvider(input) ??
  buildFallbackResolvedToolbarPlan(input);

export type ToolbarSurfaceRuleMergeResult = {
  map: Map<string, ToolbarBaseActionSurface>;
  diagnostics: ModResourceMergeDiagnostic[];
};

const buildToolbarSurfaceMapKey = (
  mode: ResolvedToolbarPlanInput["mode"],
  viewport: ResolvedToolbarPlanInput["viewport"],
  actionId: string
): string => `${mode}:${viewport}:${actionId}`;

const toToolbarSurfaceMergeItems = (
  rules: readonly ToolbarBaseActionSurfaceRule[]
) =>
  [...rules]
    .reverse()
    .map((rule) => ({
      slotId: `${rule.mode}:${rule.viewport}`,
      itemId: rule.actionId,
      value: rule,
    }));

const resolveToolbarSurfaceFromMap = (
  map: ReadonlyMap<string, ToolbarBaseActionSurface>,
  mode: ResolvedToolbarPlanInput["mode"],
  viewport: ResolvedToolbarPlanInput["viewport"],
  actionId: string
): ToolbarBaseActionSurface =>
  map.get(buildToolbarSurfaceMapKey(mode, viewport, actionId)) ?? "hidden";

export const mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder = (
  baseRules: readonly ToolbarBaseActionSurfaceRule[],
  packageRules: readonly ToolbarBaseActionSurfaceRule[] = []
): ToolbarSurfaceRuleMergeResult => {
  const modOverrides =
    selectRuntimeModResourceOverridesForLayer("mod")?.toolbarSurfaceRules ?? [];
  const userOverrides =
    selectRuntimeModResourceOverridesForLayer("user")?.toolbarSurfaceRules ?? [];

  const merged = mergeUIItemsByResourceLayerLoadOrder({
    base: toToolbarSurfaceMergeItems(baseRules),
    package: toToolbarSurfaceMergeItems(packageRules),
    mod: toToolbarSurfaceMergeItems(modOverrides),
    user: toToolbarSurfaceMergeItems(userOverrides),
  });

  const map = new Map<string, ToolbarBaseActionSurface>();
  for (const entry of merged.items) {
    const rule = entry.value;
    map.set(
      buildToolbarSurfaceMapKey(rule.mode, rule.viewport, rule.actionId),
      rule.surface
    );
  }

  return {
    map,
    diagnostics: merged.diagnostics,
  };
};

export const resolveToolbarPlanFromActionSurfaceRules = (
  { mode, viewport, cutoverEnabled }: ResolvedToolbarPlanInput,
  baseRules: readonly ToolbarBaseActionSurfaceRule[],
  packageRules: readonly ToolbarBaseActionSurfaceRule[] = []
): ResolvedToolbarPlan => {
  const { map } = mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder(
    baseRules,
    packageRules
  );
  const isPrimary = (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) =>
    resolveToolbarSurfaceFromMap(map, candidateMode, viewport, actionId) ===
    "primary";
  const isMore = (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) =>
    resolveToolbarSurfaceFromMap(map, candidateMode, viewport, actionId) ===
    "more";

  return selectResolvedToolbarPlan({
    mode,
    viewport,
    cutoverEnabled,
    draw: {
      hand: isPrimary("draw", "draw.hand"),
      pen: isPrimary("draw", "draw.pen"),
      eraser: isPrimary("draw", "draw.eraser"),
      laser: isPrimary("draw", "draw.laser"),
      text: isPrimary("draw", "draw.text"),
      image: isPrimary("draw", "draw.image"),
      clipboard: isPrimary("draw", "draw.clipboard"),
      undoRedo: isPrimary("draw", "draw.undo") && isPrimary("draw", "draw.redo"),
      breakActions:
        !cutoverEnabled &&
        isMore("draw", "draw.break.line") &&
        isMore("draw", "draw.break.column") &&
        isMore("draw", "draw.break.page"),
    },
    playback: {
      step:
        isPrimary("playback", "playback.step.prev") &&
        isPrimary("playback", "playback.step.next"),
      undoRedo:
        isPrimary("playback", "playback.undo") &&
        isPrimary("playback", "playback.redo"),
      sound: isPrimary("playback", "playback.sound.toggle"),
      extras:
        !cutoverEnabled && isPrimary("playback", "playback.extras"),
    },
    canvas: {
      fullscreen: isPrimary("canvas", "canvas.fullscreen.toggle"),
      sound: isPrimary("canvas", "canvas.sound.toggle"),
    },
    morePanel: {
      step:
        isMore(mode, "more.step.prev") && isMore(mode, "more.step.next"),
      history:
        mode === "playback"
          ? isMore("playback", "playback.undo") &&
            isMore("playback", "playback.redo")
          : isMore("draw", "draw.undo") && isMore("draw", "draw.redo"),
    },
  });
};
