import type { ModResourceMergeDiagnostic } from "../../../../types";
import type { ResolvedModResourceCommandRule } from "../model";

export const applyRemoveCommandRule = (
  merged: Map<string, ResolvedModResourceCommandRule>,
  diagnostics: ModResourceMergeDiagnostic[],
  layer: ResolvedModResourceCommandRule["source"],
  commandId: string
): boolean => {
  const existing = merged.get(commandId);
  if (!existing) {
    diagnostics.push({
      kind: "blocked",
      resourceType: "command",
      key: commandId,
      source: layer,
      reason: "remove ignored because command does not exist.",
    });
    return false;
  }

  merged.delete(commandId);
  diagnostics.push({
    kind: "loser",
    resourceType: "command",
    key: commandId,
    source: existing.source,
    againstSource: layer,
    reason: "command removed by higher precedence layer.",
  });
  diagnostics.push({
    kind: "blocked",
    resourceType: "command",
    key: commandId,
    source: layer,
    againstSource: existing.source,
    reason: "command removed.",
  });
  return true;
};
