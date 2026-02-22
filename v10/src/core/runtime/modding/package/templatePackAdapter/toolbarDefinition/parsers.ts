import type {
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
} from "../../types";
import {
  isPlainRecord,
  isToolbarActionSurface,
  isToolbarMode,
  isToolbarViewportProfile,
  normalizeNonEmptyString,
} from "./guards";

export const parseToolbarModeDefinitions = (
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

export const parseToolbarActionCatalog = (
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

export const parseToolbarActionSurfaceRules = (
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
