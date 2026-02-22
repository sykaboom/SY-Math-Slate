import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageToolbarMode,
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
  ToolbarBaseProvider,
} from "../../../types";
import { getRuntimeToolbarBaseProvider } from "../../../registry";
import {
  COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS,
  DEFAULT_TOOLBAR_MODE,
  DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID,
  EMPTY_TOOLBAR_BASE_ACTION_CATALOG,
  EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES,
  EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS,
} from "./constants";

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

export const selectToolbarBaseActionCatalog = (): readonly ToolbarBaseActionCatalogEntry[] =>
  selectToolbarBaseProvider()?.actionCatalog ?? EMPTY_TOOLBAR_BASE_ACTION_CATALOG;

export const selectToolbarBaseActionSurfaceRules = (): readonly ToolbarBaseActionSurfaceRule[] =>
  selectToolbarBaseProvider()?.actionSurfaceRules ??
  EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES;
