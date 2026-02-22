import type {
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
} from "../../types";
import { parseToolbarActionCatalogImpl } from "./parsers/actionCatalog";
import { parseToolbarActionSurfaceRulesImpl } from "./parsers/actionSurfaceRules";
import { parseToolbarModeDefinitionsImpl } from "./parsers/modeDefinitions";

export const parseToolbarModeDefinitions = (
  value: unknown
): readonly ToolbarBaseModeDefinition[] | null =>
  parseToolbarModeDefinitionsImpl(value);

export const parseToolbarActionCatalog = (
  value: unknown,
  modeIds: ReadonlySet<string>
): readonly ToolbarBaseActionCatalogEntry[] | null =>
  parseToolbarActionCatalogImpl(value, modeIds);

export const parseToolbarActionSurfaceRules = (
  value: unknown,
  modeIds: ReadonlySet<string>
): readonly ToolbarBaseActionSurfaceRule[] | null =>
  parseToolbarActionSurfaceRulesImpl(value, modeIds);
