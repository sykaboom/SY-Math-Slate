import type { ModResourceMergeDiagnostic } from "../../../../types";
import type { ModResourceShortcutMergeResult } from "../../types";

export const applyShortcutUpsert = (
  merged: Map<string, ModResourceShortcutMergeResult["shortcuts"][number]>,
  diagnostics: ModResourceMergeDiagnostic[],
  mergeKey: string,
  source: ModResourceShortcutMergeResult["shortcuts"][number]["source"],
  shortcut: Omit<ModResourceShortcutMergeResult["shortcuts"][number], "source" | "mergeKey">
): void => {
  const existing = merged.get(mergeKey);

  if (existing) {
    diagnostics.push({
      kind: "loser",
      resourceType: "shortcut",
      key: mergeKey,
      source: existing.source,
      againstSource: source,
      reason: "shortcut conflict loser.",
    });
    diagnostics.push({
      kind: "winner",
      resourceType: "shortcut",
      key: mergeKey,
      source,
      againstSource: existing.source,
      reason: "shortcut conflict winner.",
    });
  }

  merged.set(mergeKey, {
    ...shortcut,
    mergeKey,
    source,
  });
};
