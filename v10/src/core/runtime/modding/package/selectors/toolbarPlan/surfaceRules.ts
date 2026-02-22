import type {
  ModResourceMergeDiagnostic,
  ResolvedToolbarPlanInput,
  ToolbarBaseActionSurface,
  ToolbarBaseActionSurfaceRule,
} from "../../types";
import { selectRuntimeModResourceOverridesForLayer } from "../activePackageRules";
import { mergeUIItemsByResourceLayerLoadOrder } from "../resourceItemMerge";

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

export const resolveToolbarSurfaceFromMap = (
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
