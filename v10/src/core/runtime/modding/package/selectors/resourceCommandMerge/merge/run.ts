import { MOD_RESOURCE_LAYER_LOAD_ORDER } from "../../../types";
import { dedupeCommandRulesWithinLayer } from "../helpers";
import type { ModResourceCommandLayers, ModResourceCommandMergeResult } from "./model";
import {
  applyRemoveCommandRule,
  applyUpsertCommandRule,
  toCommandMergeResult,
} from "./operations";

export const mergeCommandsByResourceLayerLoadOrder = (
  layers: ModResourceCommandLayers
): ModResourceCommandMergeResult => {
  const merged = new Map<string, ModResourceCommandMergeResult["commands"][number]>();
  const diagnostics: ModResourceCommandMergeResult["diagnostics"] = [];
  const blockedCommandIds = new Set<string>();

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerRules = layers[layer];
    if (!layerRules || layerRules.length === 0) continue;
    for (const rule of dedupeCommandRulesWithinLayer(layerRules)) {
      const commandId = rule.commandId;
      const operation = rule.operation ?? "upsert";

      if (operation === "remove") {
        applyRemoveCommandRule(merged, diagnostics, layer, commandId);
        continue;
      }

      applyUpsertCommandRule(
        merged,
        diagnostics,
        blockedCommandIds,
        layer,
        rule,
        commandId
      );
    }
  }

  return toCommandMergeResult(merged, diagnostics, blockedCommandIds);
};
