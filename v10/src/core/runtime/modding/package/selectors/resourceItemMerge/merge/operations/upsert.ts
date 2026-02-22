import type { ModResourceMergeDiagnostic } from "../../../../types";
import type { ResolvedModResourceUIItem } from "../../model";

export const applyUpsertUIItemRule = <TValue>(
  merged: Map<string, ResolvedModResourceUIItem<TValue>>,
  diagnostics: ModResourceMergeDiagnostic[],
  key: string,
  next: ResolvedModResourceUIItem<TValue>
): void => {
  const existing = merged.get(key);
  if (existing) {
    diagnostics.push({
      kind: "loser",
      resourceType: "ui-item",
      key,
      source: existing.source,
      againstSource: next.source,
      reason: "ui item superseded by higher precedence layer.",
    });
    diagnostics.push({
      kind: "winner",
      resourceType: "ui-item",
      key,
      source: next.source,
      againstSource: existing.source,
      reason: "ui item override applied.",
    });
  }

  merged.set(key, next);
};
