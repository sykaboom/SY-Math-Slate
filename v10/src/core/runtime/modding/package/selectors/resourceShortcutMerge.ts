import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModPackageShortcutRule,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
} from "../types";

export type ResolvedModResourceShortcutRule = ModPackageShortcutRule & {
  mergeKey: string;
  source: ModResourceLayer;
};

export type ModResourceShortcutLayers = Partial<
  Record<ModResourceLayer, readonly ModPackageShortcutRule[]>
>;

export type ModResourceShortcutMergeResult = {
  shortcuts: ResolvedModResourceShortcutRule[];
  diagnostics: ModResourceMergeDiagnostic[];
};

const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeShortcutMergeKey = (
  shortcut: string,
  when: string | undefined
): string => {
  const normalizedShortcut = normalizeLayerString(shortcut).toLowerCase();
  const normalizedWhen = normalizeLayerString(when ?? "*").toLowerCase();
  return `${normalizedShortcut}::${normalizedWhen}`;
};

const dedupeShortcutsWithinLayer = (
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

export const mergeShortcutsByResourceLayerLoadOrder = (
  layers: ModResourceShortcutLayers
): ModResourceShortcutMergeResult => {
  const merged = new Map<string, ResolvedModResourceShortcutRule>();
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerShortcuts = layers[layer];
    if (!layerShortcuts || layerShortcuts.length === 0) continue;
    for (const shortcut of dedupeShortcutsWithinLayer(layerShortcuts)) {
      const mergeKey = normalizeShortcutMergeKey(shortcut.shortcut, shortcut.when);
      const operation = shortcut.operation ?? "upsert";
      const existing = merged.get(mergeKey);

      if (operation === "remove") {
        if (!existing) {
          diagnostics.push({
            kind: "blocked",
            resourceType: "shortcut",
            key: mergeKey,
            source: layer,
            reason: "remove ignored because shortcut does not exist.",
          });
          continue;
        }
        merged.delete(mergeKey);
        diagnostics.push({
          kind: "loser",
          resourceType: "shortcut",
          key: mergeKey,
          source: existing.source,
          againstSource: layer,
          reason: "shortcut removed by higher precedence layer.",
        });
        diagnostics.push({
          kind: "blocked",
          resourceType: "shortcut",
          key: mergeKey,
          source: layer,
          againstSource: existing.source,
          reason: "shortcut removed.",
        });
        continue;
      }

      if (existing) {
        diagnostics.push({
          kind: "loser",
          resourceType: "shortcut",
          key: mergeKey,
          source: existing.source,
          againstSource: layer,
          reason: "shortcut conflict loser.",
        });
        diagnostics.push({
          kind: "winner",
          resourceType: "shortcut",
          key: mergeKey,
          source: layer,
          againstSource: existing.source,
          reason: "shortcut conflict winner.",
        });
      }

      merged.set(mergeKey, {
        ...shortcut,
        mergeKey,
        source: layer,
      });
    }
  }

  return {
    shortcuts: [...merged.values()],
    diagnostics,
  };
};
