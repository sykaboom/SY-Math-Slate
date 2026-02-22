import { buildUIItemMergeKey, normalizeLayerString } from "../helpers";
import type { ModResourceUIItem, ModResourceUIItemMergeResult } from "../model";
import { applyRemoveUIItemRule, applyUpsertUIItemRule } from "./operations";

export const applyLayerUIItem = <TValue>(
  merged: Map<string, ModResourceUIItemMergeResult<TValue>["items"][number]>,
  diagnostics: ModResourceUIItemMergeResult<TValue>["diagnostics"],
  layer: ModResourceUIItemMergeResult<TValue>["items"][number]["source"],
  item: ModResourceUIItem<TValue>
): void => {
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
    return;
  }

  const key = buildUIItemMergeKey(slotId, itemId);
  const operation = item.operation ?? "add";
  if (operation === "remove") {
    applyRemoveUIItemRule(merged, diagnostics, key, layer);
    return;
  }

  applyUpsertUIItemRule(merged, diagnostics, key, {
    slotId,
    itemId,
    operation,
    value: item.value,
    source: layer,
  });
};
