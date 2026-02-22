import type {
  ResolvedToolbarPlan,
  ResolvedToolbarPlanInput,
  ToolbarBaseActionSurfaceRule,
} from "../../types";
import { selectResolvedToolbarPlan } from "./provider";
import { buildResolvedToolbarModeSections } from "./planResolution/sections";
import { createToolbarSurfacePredicates } from "./planResolution/surfacePredicates";
import { mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder } from "./surfaceRules";

export const resolveToolbarPlanFromActionSurfaceRules = (
  { mode, viewport, cutoverEnabled }: ResolvedToolbarPlanInput,
  baseRules: readonly ToolbarBaseActionSurfaceRule[],
  packageRules: readonly ToolbarBaseActionSurfaceRule[] = []
): ResolvedToolbarPlan => {
  const { map } = mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder(
    baseRules,
    packageRules
  );
  const predicates = createToolbarSurfacePredicates(map, viewport);
  const sections = buildResolvedToolbarModeSections({
    mode,
    cutoverEnabled,
    ...predicates,
  });

  return selectResolvedToolbarPlan({
    mode,
    viewport,
    cutoverEnabled,
    ...sections,
  });
};
