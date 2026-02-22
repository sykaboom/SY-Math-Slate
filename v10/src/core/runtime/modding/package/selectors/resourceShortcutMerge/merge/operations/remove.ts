import type { ModResourceMergeDiagnostic } from "../../../../types";
import type { ModResourceShortcutMergeResult } from "../../types";

export const applyShortcutRemove = (
  merged: Map<string, ModResourceShortcutMergeResult["shortcuts"][number]>,
  diagnostics: ModResourceMergeDiagnostic[],
  mergeKey: string,
  source: ModResourceShortcutMergeResult["shortcuts"][number]["source"]
): void => {
  const existing = merged.get(mergeKey);
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
};
