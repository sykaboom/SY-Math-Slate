import {
  selectToolbarBaseActionCatalog,
  type ResolvedToolbarPlanMode,
  type ToolbarBaseActionCatalogEntry,
} from "@core/runtime/modding/package";
import {
  BASE_EDUCATION_ACTION_IDS,
  BASE_EDUCATION_TOOLBAR_ACTION_CATALOG,
} from "@/mod/packs/base-education/modules";

export const TOOLBAR_ACTION_IDS = BASE_EDUCATION_ACTION_IDS;

export type ToolbarActionId = (typeof TOOLBAR_ACTION_IDS)[number];

export type ToolbarActionCatalogEntry = ToolbarBaseActionCatalogEntry;

export const TOOLBAR_BASE_ACTION_CATALOG: readonly ToolbarActionCatalogEntry[] =
  BASE_EDUCATION_TOOLBAR_ACTION_CATALOG;

const assertNoCatalogDuplicates = (
  catalog: readonly ToolbarActionCatalogEntry[]
): void => {
  const seen = new Set<string>();
  for (const entry of catalog) {
    if (seen.has(entry.id)) {
      throw new Error(`duplicate toolbar action id in catalog: ${entry.id}`);
    }
    seen.add(entry.id);
  }
};

assertNoCatalogDuplicates(TOOLBAR_BASE_ACTION_CATALOG);

const resolveToolbarActionCatalog = (): readonly ToolbarActionCatalogEntry[] => {
  const providerCatalog = selectToolbarBaseActionCatalog();
  if (providerCatalog.length === 0) {
    return TOOLBAR_BASE_ACTION_CATALOG;
  }
  assertNoCatalogDuplicates(providerCatalog);
  return providerCatalog;
};

export const listToolbarActionCatalog = (): readonly ToolbarActionCatalogEntry[] =>
  resolveToolbarActionCatalog();

export const listToolbarActionIdsByMode = (
  mode: ResolvedToolbarPlanMode
): readonly string[] =>
  resolveToolbarActionCatalog()
    .filter((entry) => entry.modes.includes(mode))
    .map(
    (entry) => entry.id
  );
