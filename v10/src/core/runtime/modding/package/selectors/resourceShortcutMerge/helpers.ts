import type { ModPackageShortcutRule } from "../../types";

const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const normalizeShortcutMergeKey = (
  shortcut: string,
  when: string | undefined
): string => {
  const normalizedShortcut = normalizeLayerString(shortcut).toLowerCase();
  const normalizedWhen = normalizeLayerString(when ?? "*").toLowerCase();
  return `${normalizedShortcut}::${normalizedWhen}`;
};

export const dedupeShortcutsWithinLayer = (
  shortcuts: readonly ModPackageShortcutRule[]
): ModPackageShortcutRule[] => {
  const deduped: ModPackageShortcutRule[] = [];
  const seen = new Set<string>();
  for (const shortcut of shortcuts) {
    const key = normalizeShortcutMergeKey(shortcut.shortcut, shortcut.when);
    if (key.startsWith("::")) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      ...shortcut,
      shortcut: normalizeLayerString(shortcut.shortcut),
      commandId: normalizeLayerString(shortcut.commandId),
      ...(shortcut.when ? { when: normalizeLayerString(shortcut.when) } : {}),
    });
  }
  return deduped;
};
