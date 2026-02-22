import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModPackageUIItemRule,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
} from "../types";

export type ModResourceUIItem<TValue> = {
  slotId: string;
  itemId: string;
  operation?: ModPackageUIItemRule["operation"];
  value: TValue;
};

export type ResolvedModResourceUIItem<TValue> = ModResourceUIItem<TValue> & {
  source: ModResourceLayer;
};

export type ModResourceUIItemLayers<TValue> = Partial<
  Record<ModResourceLayer, readonly ModResourceUIItem<TValue>[]>
>;

export type ModResourceUIItemMergeResult<TValue> = {
  items: ResolvedModResourceUIItem<TValue>[];
  diagnostics: ModResourceMergeDiagnostic[];
};

const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const buildUIItemMergeKey = (slotId: string, itemId: string): string =>
  `${slotId}::${itemId}`;

const dedupeUIItemsWithinLayer = <TValue>(
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

export const mergeUIItemsByResourceLayerLoadOrder = <TValue>(
  layers: ModResourceUIItemLayers<TValue>
): ModResourceUIItemMergeResult<TValue> => {
  const merged = new Map<string, ResolvedModResourceUIItem<TValue>>();
  const diagnostics: ModResourceMergeDiagnostic[] = [];

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
