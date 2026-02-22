import type { ToolbarBaseActionSurfaceRule } from "../../../types";
import {
  isPlainRecord,
  isToolbarActionSurface,
  isToolbarMode,
  isToolbarViewportProfile,
  normalizeNonEmptyString,
} from "../guards";

export const parseToolbarActionSurfaceRulesImpl = (
  value: unknown,
  modeIds: ReadonlySet<string>
): readonly ToolbarBaseActionSurfaceRule[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;

  const parsed: ToolbarBaseActionSurfaceRule[] = [];
  for (const entry of value) {
    if (!isPlainRecord(entry)) return null;
    if (!isToolbarMode(entry.mode) || !modeIds.has(entry.mode)) return null;
    if (!isToolbarViewportProfile(entry.viewport)) return null;

    const actionId = normalizeNonEmptyString(entry.actionId);
    if (!actionId || !isToolbarActionSurface(entry.surface)) return null;

    parsed.push({
      mode: entry.mode,
      viewport: entry.viewport,
      actionId,
      surface: entry.surface,
    });
  }

  return Object.freeze(parsed);
};
