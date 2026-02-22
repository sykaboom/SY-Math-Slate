import type { ToolbarBaseActionSurfaceRule } from "../../../../types";
import { buildToolbarSurfaceMapKey } from "../keys";

export const toToolbarSurfaceMergeItems = (
  rules: readonly ToolbarBaseActionSurfaceRule[]
) =>
  [...rules]
    .reverse()
    .map((rule) => ({
      slotId: `${rule.mode}:${rule.viewport}`,
      itemId: rule.actionId,
      value: rule,
    }));

export const buildToolbarSurfaceMapFromRules = (
  rules: readonly ToolbarBaseActionSurfaceRule[]
) => {
  const map = new Map<string, ToolbarBaseActionSurfaceRule["surface"]>();
  for (const rule of rules) {
    map.set(
      buildToolbarSurfaceMapKey(rule.mode, rule.viewport, rule.actionId),
      rule.surface
    );
  }
  return map;
};
