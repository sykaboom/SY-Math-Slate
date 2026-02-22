import type { ModResourceUIItem } from "./model";

export const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const buildUIItemMergeKey = (slotId: string, itemId: string): string =>
  `${slotId}::${itemId}`;

export const dedupeUIItemsWithinLayer = <TValue>(
  items: readonly ModResourceUIItem<TValue>[]
): ModResourceUIItem<TValue>[] => {
  const deduped: ModResourceUIItem<TValue>[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const key = buildUIItemMergeKey(
      normalizeLayerString(item.slotId),
      normalizeLayerString(item.itemId)
    );
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
};
