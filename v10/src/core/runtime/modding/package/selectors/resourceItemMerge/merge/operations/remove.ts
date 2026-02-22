import type { ModResourceMergeDiagnostic } from "../../../../types";
import type { ResolvedModResourceUIItem } from "../../model";

export const applyRemoveUIItemRule = <TValue>(
  merged: Map<string, ResolvedModResourceUIItem<TValue>>,
  diagnostics: ModResourceMergeDiagnostic[],
  key: string,
  source: ResolvedModResourceUIItem<TValue>["source"]
): boolean => {
  const existing = merged.get(key);
  if (!existing) {
    diagnostics.push({
      kind: "blocked",
      resourceType: "ui-item",
      key,
      source,
      reason: "remove ignored because target ui item does not exist.",
    });
    return false;
  }

  merged.delete(key);
  diagnostics.push({
    kind: "loser",
    resourceType: "ui-item",
    key,
    source: existing.source,
    againstSource: source,
    reason: "ui item removed by higher precedence layer.",
  });
  diagnostics.push({
    kind: "blocked",
    resourceType: "ui-item",
    key,
    source,
    againstSource: existing.source,
    reason: "ui item removed.",
  });
  return true;
};
