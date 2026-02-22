import type { ModResourceMergeDiagnostic } from "../../../types";
import type { ModResourceShortcutMergeResult } from "../types";

export const applyShortcutRule = (
  merged: Map<string, ModResourceShortcutMergeResult["shortcuts"][number]>,
  diagnostics: ModResourceMergeDiagnostic[],
  mergeKey: string,
  source: ModResourceShortcutMergeResult["shortcuts"][number]["source"],
  shortcut: Omit<ModResourceShortcutMergeResult["shortcuts"][number], "source" | "mergeKey">
): void => {
  const operation = shortcut.operation ?? "upsert";
  const existing = merged.get(mergeKey);

  if (operation === "remove") {
    if (!existing) {
      diagnostics.push({
        kind: "blocked",
        resourceType: "shortcut",
        key: mergeKey,
        source,
        reason: "remove ignored because shortcut does not exist.",
      });
      return;
    }

    merged.delete(mergeKey);
    diagnostics.push({
      kind: "loser",
      resourceType: "shortcut",
      key: mergeKey,
      source: existing.source,
      againstSource: source,
      reason: "shortcut removed by higher precedence layer.",
    });
    diagnostics.push({
      kind: "blocked",
      resourceType: "shortcut",
      key: mergeKey,
      source,
      againstSource: existing.source,
      reason: "shortcut removed.",
    });
    return;
  }

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
