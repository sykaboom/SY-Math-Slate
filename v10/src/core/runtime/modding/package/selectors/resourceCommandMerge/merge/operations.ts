import type { ModResourceMergeDiagnostic } from "../../../types";
import type {
  ModResourceCommandMergeResult,
  ResolvedModResourceCommandRule,
} from "./model";

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

export const applyUpsertCommandRule = (
  merged: Map<string, ResolvedModResourceCommandRule>,
  diagnostics: ModResourceMergeDiagnostic[],
  blockedCommandIds: Set<string>,
  layer: ResolvedModResourceCommandRule["source"],
  rule: Omit<ResolvedModResourceCommandRule, "source">,
  commandId: string
): void => {
  const existing = merged.get(commandId);
  if (!existing) {
    merged.set(commandId, {
      ...rule,
      commandId,
      source: layer,
    });
    return;
  }

  if (rule.overrideAllowed !== true) {
    blockedCommandIds.add(commandId);
    diagnostics.push({
      kind: "blocked",
      resourceType: "command",
      key: commandId,
      source: layer,
      againstSource: existing.source,
      reason:
        "command conflict blocked. set overrideAllowed=true to replace the winner.",
    });
    return;
  }

  diagnostics.push({
    kind: "loser",
    resourceType: "command",
    key: commandId,
    source: existing.source,
    againstSource: layer,
    reason: "command overridden by higher precedence layer with overrideAllowed.",
  });
  diagnostics.push({
    kind: "winner",
    resourceType: "command",
    key: commandId,
    source: layer,
    againstSource: existing.source,
    reason: "command override applied (overrideAllowed=true).",
  });

  merged.set(commandId, {
    ...rule,
    commandId,
    source: layer,
  });
};

export const toCommandMergeResult = (
  merged: Map<string, ResolvedModResourceCommandRule>,
  diagnostics: ModResourceMergeDiagnostic[],
  blockedCommandIds: Set<string>
): ModResourceCommandMergeResult => ({
  commands: [...merged.values()],
  diagnostics,
  blockedCommandIds: [...blockedCommandIds].sort((left, right) =>
    left.localeCompare(right)
  ),
});
