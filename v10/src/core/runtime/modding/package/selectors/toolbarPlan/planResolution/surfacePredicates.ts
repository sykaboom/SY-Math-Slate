import type {
  ResolvedToolbarPlanInput,
  ToolbarBaseActionSurface,
} from "../../../types";
import { resolveToolbarSurfaceFromMap } from "../surfaceRules";
import type { ToolbarSurfacePredicates } from "./sections";

export const createToolbarSurfacePredicates = (
  map: ReadonlyMap<string, ToolbarBaseActionSurface>,
  viewport: ResolvedToolbarPlanInput["viewport"]
): ToolbarSurfacePredicates => ({
  isPrimary: (candidateMode, actionId) =>
    resolveToolbarSurfaceFromMap(map, candidateMode, viewport, actionId) ===
    "primary",
  isMore: (candidateMode, actionId) =>
    resolveToolbarSurfaceFromMap(map, candidateMode, viewport, actionId) ===
    "more",
});
