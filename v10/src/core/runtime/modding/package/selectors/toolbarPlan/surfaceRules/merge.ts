import type {
  ModResourceMergeDiagnostic,
  ToolbarBaseActionSurfaceRule,
} from "../../../types";
import { selectRuntimeModResourceOverridesForLayer } from "../../activePackageRules";
import { mergeUIItemsByResourceLayerLoadOrder } from "../../resourceItemMerge";
import {
  buildToolbarSurfaceMapFromRules,
  toToolbarSurfaceMergeItems,
} from "./merge/helpers";

export type ToolbarSurfaceRuleMergeResult = {
  map: Map<string, ToolbarBaseActionSurfaceRule["surface"]>;
  diagnostics: ModResourceMergeDiagnostic[];
};

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

  return {
    map: buildToolbarSurfaceMapFromRules(merged.items.map((entry) => entry.value)),
    diagnostics: merged.diagnostics,
  };
};
