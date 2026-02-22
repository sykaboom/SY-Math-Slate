import type { ModResourceMergeDiagnostic } from "../../../types";
import type { ModResourceShortcutMergeResult } from "../types";
import { applyShortcutRemove } from "./operations/remove";
import { applyShortcutUpsert } from "./operations/upsert";

export const applyShortcutRule = (
  merged: Map<string, ModResourceShortcutMergeResult["shortcuts"][number]>,
  diagnostics: ModResourceMergeDiagnostic[],
  mergeKey: string,
  source: ModResourceShortcutMergeResult["shortcuts"][number]["source"],
  shortcut: Omit<ModResourceShortcutMergeResult["shortcuts"][number], "source" | "mergeKey">
): void => {
  const operation = shortcut.operation ?? "upsert";
  if (operation === "remove") {
    applyShortcutRemove(merged, diagnostics, mergeKey, source);
    return;
  }
  applyShortcutUpsert(merged, diagnostics, mergeKey, source, shortcut);
};
