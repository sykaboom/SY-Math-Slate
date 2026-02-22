import type { ResolvedToolbarPlanInput, ToolbarBaseActionSurface } from "../../../types";

export const buildToolbarSurfaceMapKey = (
  mode: ResolvedToolbarPlanInput["mode"],
  viewport: ResolvedToolbarPlanInput["viewport"],
  actionId: string
): string => `${mode}:${viewport}:${actionId}`;

export const resolveToolbarSurfaceFromMap = (
  map: ReadonlyMap<string, ToolbarBaseActionSurface>,
  mode: ResolvedToolbarPlanInput["mode"],
  viewport: ResolvedToolbarPlanInput["viewport"],
  actionId: string
): ToolbarBaseActionSurface =>
  map.get(buildToolbarSurfaceMapKey(mode, viewport, actionId)) ?? "hidden";
