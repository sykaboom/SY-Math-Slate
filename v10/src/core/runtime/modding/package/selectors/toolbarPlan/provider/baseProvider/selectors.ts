import type { ToolbarBaseActionCatalogEntry, ToolbarBaseActionSurfaceRule, ToolbarBaseModeDefinition, ToolbarBaseProvider } from "../../../../types";
import { getRuntimeToolbarBaseProvider } from "../../../../registry";
import {
  EMPTY_TOOLBAR_BASE_ACTION_CATALOG,
  EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES,
  EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS,
} from "../constants";

export const selectToolbarBaseProvider = (): ToolbarBaseProvider | null =>
  getRuntimeToolbarBaseProvider();

export const selectToolbarBaseModeDefinitions = (): readonly ToolbarBaseModeDefinition[] =>
  selectToolbarBaseProvider()?.modeDefinitions ?? EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS;

export const selectToolbarBaseActionCatalog = (): readonly ToolbarBaseActionCatalogEntry[] =>
  selectToolbarBaseProvider()?.actionCatalog ?? EMPTY_TOOLBAR_BASE_ACTION_CATALOG;

export const selectToolbarBaseActionSurfaceRules = (): readonly ToolbarBaseActionSurfaceRule[] =>
  selectToolbarBaseProvider()?.actionSurfaceRules ??
  EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES;
