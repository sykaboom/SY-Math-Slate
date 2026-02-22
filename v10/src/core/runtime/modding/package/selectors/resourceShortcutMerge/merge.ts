import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModResourceMergeDiagnostic,
} from "../../types";
import type {
  ModResourceShortcutLayers,
  ModResourceShortcutMergeResult,
} from "./types";
import { dedupeShortcutsWithinLayer, normalizeShortcutMergeKey } from "./helpers";

export const mergeShortcutsByResourceLayerLoadOrder = (
  layers: ModResourceShortcutLayers
): ModResourceShortcutMergeResult => {
  const merged = new Map<string, ModResourceShortcutMergeResult["shortcuts"][number]>();
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
