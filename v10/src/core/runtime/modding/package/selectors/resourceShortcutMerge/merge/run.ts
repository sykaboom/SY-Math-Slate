import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModResourceMergeDiagnostic,
} from "../../../types";
import { dedupeShortcutsWithinLayer, normalizeShortcutMergeKey } from "../helpers";
import type {
  ModResourceShortcutLayers,
  ModResourceShortcutMergeResult,
} from "../types";
import { applyShortcutRule } from "./operations";

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
      applyShortcutRule(merged, diagnostics, mergeKey, layer, shortcut);
    }
  }

  return {
    shortcuts: [...merged.values()],
    diagnostics,
  };
};
