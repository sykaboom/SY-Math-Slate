import { MOD_RESOURCE_LAYER_LOAD_ORDER } from "../../../types";
import {
  buildUIItemMergeKey,
  dedupeUIItemsWithinLayer,
  normalizeLayerString,
} from "../helpers";
import type { ModResourceUIItemLayers, ModResourceUIItemMergeResult } from "../model";
import {
  applyRemoveUIItemRule,
  applyUpsertUIItemRule,
  toUIItemMergeResult,
} from "./operations";

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
      const slotId = normalizeLayerString(item.slotId);
      const itemId = normalizeLayerString(item.itemId);
      if (slotId.length === 0 || itemId.length === 0) {
        diagnostics.push({
          kind: "blocked",
          resourceType: "ui-item",
          key: buildUIItemMergeKey(slotId, itemId),
          source: layer,
          reason: "ui item merge ignored because slotId/itemId is empty.",
        });
        continue;
      }

      const key = buildUIItemMergeKey(slotId, itemId);
      const operation = item.operation ?? "add";
      if (operation === "remove") {
        applyRemoveUIItemRule(merged, diagnostics, key, layer);
        continue;
      }

      applyUpsertUIItemRule(merged, diagnostics, key, {
        slotId,
        itemId,
        operation,
        value: item.value,
        source: layer,
      });
    }
  }

  return toUIItemMergeResult(merged, diagnostics);
};
