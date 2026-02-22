import type { ToolbarBaseModeDefinition } from "../../../types";
import { isPlainRecord, isToolbarMode, normalizeNonEmptyString } from "../guards";

export const parseToolbarModeDefinitionsImpl = (
  value: unknown
): readonly ToolbarBaseModeDefinition[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;

  const parsed: ToolbarBaseModeDefinition[] = [];
  const seenModeIds = new Set<string>();
  for (const entry of value) {
    if (!isPlainRecord(entry)) return null;
    if (!isToolbarMode(entry.id)) return null;
    if (seenModeIds.has(entry.id)) return null;

    const label = normalizeNonEmptyString(entry.label);
    const fallbackModId = normalizeNonEmptyString(entry.fallbackModId);
    if (!label || !fallbackModId) return null;

    seenModeIds.add(entry.id);
    parsed.push({
      id: entry.id,
      label,
      fallbackModId,
    });
  }
  return Object.freeze(parsed);
};
