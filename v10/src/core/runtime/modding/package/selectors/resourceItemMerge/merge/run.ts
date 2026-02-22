import { MOD_RESOURCE_LAYER_LOAD_ORDER } from "../../../types";
import { dedupeUIItemsWithinLayer } from "../helpers";
import type { ModResourceUIItemLayers, ModResourceUIItemMergeResult } from "../model";
import { toUIItemMergeResult } from "./operations";
import { applyLayerUIItem } from "./runLayerItem";

export const mergeUIItemsByResourceLayerLoadOrder = <TValue>(
  layers: ModResourceUIItemLayers<TValue>
): ModResourceUIItemMergeResult<TValue> => {
  const merged = new Map<string, ModResourceUIItemMergeResult<TValue>["items"][number]>();
  const diagnostics: ModResourceUIItemMergeResult<TValue>["diagnostics"] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const rawItems = layers[layer];
    if (!rawItems || rawItems.length === 0) continue;
    const layerItems = dedupeUIItemsWithinLayer(rawItems);

    for (const item of layerItems) {
      applyLayerUIItem(merged, diagnostics, layer, item);
    }
  }

  return toUIItemMergeResult(merged, diagnostics);
};
