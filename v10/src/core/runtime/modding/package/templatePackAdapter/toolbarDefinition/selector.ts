import type {
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
} from "../../types";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";
import { isPlainRecord } from "./guards";
import {
  parseToolbarActionCatalog,
  parseToolbarActionSurfaceRules,
  parseToolbarModeDefinitions,
} from "./parsers";

export type TemplatePackToolbarDefinition = {
  modeDefinitions: readonly ToolbarBaseModeDefinition[];
  actionCatalog: readonly ToolbarBaseActionCatalogEntry[];
  actionSurfaceRules: readonly ToolbarBaseActionSurfaceRule[];
};

export const selectTemplatePackToolbarDefinition = (
  manifest: TemplatePackAdapterManifest
): TemplatePackToolbarDefinition | null => {
  const toolbarValue = manifest.toolbar;
  if (!isPlainRecord(toolbarValue)) return null;

  const modeDefinitions = parseToolbarModeDefinitions(toolbarValue.modeDefinitions);
  if (!modeDefinitions) return null;
  const modeIds = new Set(modeDefinitions.map((definition) => definition.id));

  const actionCatalog = parseToolbarActionCatalog(toolbarValue.actionCatalog, modeIds);
  if (!actionCatalog) return null;

  const actionSurfaceRules = parseToolbarActionSurfaceRules(
    toolbarValue.actionSurfaceRules,
    modeIds
  );
  if (!actionSurfaceRules) return null;

  return Object.freeze({
    modeDefinitions,
    actionCatalog,
    actionSurfaceRules,
  });
};
