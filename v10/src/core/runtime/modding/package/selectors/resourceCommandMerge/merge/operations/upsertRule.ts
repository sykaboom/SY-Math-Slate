import type { ModResourceMergeDiagnostic } from "../../../../types";
import type { ResolvedModResourceCommandRule } from "../model";

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
