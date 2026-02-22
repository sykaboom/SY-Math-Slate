import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageToolbarMode,
  ResolvedToolbarPlan,
  ResolvedToolbarPlanInput,
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
  ToolbarBaseProvider,
} from "../../types";
import { getRuntimeToolbarBaseProvider } from "../../registry";

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
