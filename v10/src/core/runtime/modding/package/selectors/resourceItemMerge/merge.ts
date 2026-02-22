import { MOD_RESOURCE_LAYER_LOAD_ORDER } from "../../types";
import type { ModResourceUIItemLayers, ModResourceUIItemMergeResult, ResolvedModResourceUIItem } from "./model";
import {
  buildUIItemMergeKey,
  dedupeUIItemsWithinLayer,
  normalizeLayerString,
} from "./helpers";

export const mergeUIItemsByResourceLayerLoadOrder = <TValue>(
  layers: ModResourceUIItemLayers<TValue>
): ModResourceUIItemMergeResult<TValue> => {
  const merged = new Map<string, ResolvedModResourceUIItem<TValue>>();
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
      const existing = merged.get(key);

      if (operation === "remove") {
        if (!existing) {
          diagnostics.push({
            kind: "blocked",
            resourceType: "ui-item",
            key,
            source: layer,
            reason: "remove ignored because target ui item does not exist.",
          });
          continue;
        }
        merged.delete(key);
        diagnostics.push({
          kind: "loser",
          resourceType: "ui-item",
          key,
          source: existing.source,
          againstSource: layer,
          reason: "ui item removed by higher precedence layer.",
        });
        diagnostics.push({
          kind: "blocked",
          resourceType: "ui-item",
          key,
          source: layer,
          againstSource: existing.source,
          reason: "ui item removed.",
        });
        continue;
      }

      if (existing) {
        diagnostics.push({
          kind: "loser",
          resourceType: "ui-item",
          key,
          source: existing.source,
          againstSource: layer,
          reason: "ui item superseded by higher precedence layer.",
        });
        diagnostics.push({
          kind: "winner",
          resourceType: "ui-item",
          key,
          source: layer,
          againstSource: existing.source,
          reason: "ui item override applied.",
        });
      }

      merged.set(key, {
        slotId,
        itemId,
        operation,
        value: item.value,
        source: layer,
      });
    }
  }

  return {
    items: [...merged.values()],
    diagnostics,
  };
};
