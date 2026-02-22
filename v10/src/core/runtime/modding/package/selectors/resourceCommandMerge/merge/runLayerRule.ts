import type { ModPackageCommandRule } from "../../../types";
import type { ModResourceCommandMergeResult } from "./model";
import { applyRemoveCommandRule, applyUpsertCommandRule } from "./operations";

export const applyLayerCommandRule = (
  merged: Map<string, ModResourceCommandMergeResult["commands"][number]>,
  diagnostics: ModResourceCommandMergeResult["diagnostics"],
  blockedCommandIds: Set<string>,
  layer: ModResourceCommandMergeResult["commands"][number]["source"],
  rule: ModPackageCommandRule
): void => {
  const commandId = rule.commandId;
  const operation = rule.operation ?? "upsert";

  if (operation === "remove") {
    applyRemoveCommandRule(merged, diagnostics, layer, commandId);
    return;
  }

  applyUpsertCommandRule(
    merged,
    diagnostics,
    blockedCommandIds,
    layer,
    rule,
    commandId
  );
};
