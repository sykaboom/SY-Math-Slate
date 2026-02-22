import type {
  ModPackageUIItemRule,
  ModResourceLayer,
  ModResourceMergeDiagnostic,
} from "../../types";

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
