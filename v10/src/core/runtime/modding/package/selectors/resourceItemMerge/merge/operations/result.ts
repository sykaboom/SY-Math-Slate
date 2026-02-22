import type { ModResourceMergeDiagnostic } from "../../../../types";
import type {
  ModResourceUIItemMergeResult,
  ResolvedModResourceUIItem,
} from "../../model";

export const toUIItemMergeResult = <TValue>(
  merged: Map<string, ResolvedModResourceUIItem<TValue>>,
  diagnostics: ModResourceMergeDiagnostic[]
): ModResourceUIItemMergeResult<TValue> => ({
  items: [...merged.values()],
  diagnostics,
});
