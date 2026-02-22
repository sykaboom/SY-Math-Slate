import type { ToolbarBaseActionCatalogEntry, ToolbarBaseModeDefinition } from "../../../types";
import { isPlainRecord, isToolbarMode, normalizeNonEmptyString } from "../guards";

export const parseToolbarActionCatalogImpl = (
  value: unknown,
  modeIds: ReadonlySet<string>
): readonly ToolbarBaseActionCatalogEntry[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;

  const parsed: ToolbarBaseActionCatalogEntry[] = [];
  const seenActionIds = new Set<string>();
  for (const entry of value) {
    if (!isPlainRecord(entry)) return null;

    const id = normalizeNonEmptyString(entry.id);
    const label = normalizeNonEmptyString(entry.label);
    if (!id || !label || !Array.isArray(entry.modes) || entry.modes.length === 0) {
      return null;
    }
    if (seenActionIds.has(id)) return null;

    const modes: ToolbarBaseModeDefinition["id"][] = [];
    const seenModes = new Set<string>();
    for (const mode of entry.modes) {
      if (!isToolbarMode(mode)) return null;
      if (!modeIds.has(mode)) return null;
      if (seenModes.has(mode)) continue;
      seenModes.add(mode);
      modes.push(mode);
    }
    if (modes.length === 0) return null;

    seenActionIds.add(id);
    parsed.push({
      id,
      label,
      modes: Object.freeze([...modes]),
    });
  }

  return Object.freeze(parsed);
};
