import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModPackageCommandRule,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
} from "../../types";
import { dedupeCommandRulesWithinLayer } from "./helpers";

export type ResolvedModResourceCommandRule = ModPackageCommandRule & {
  source: ModResourceLayer;
};

export type ModResourceCommandLayers = Partial<
  Record<ModResourceLayer, readonly ModPackageCommandRule[]>
>;

export type ModResourceCommandMergeResult = {
  commands: ResolvedModResourceCommandRule[];
  diagnostics: ModResourceMergeDiagnostic[];
  blockedCommandIds: string[];
};

export const mergeCommandsByResourceLayerLoadOrder = (
  layers: ModResourceCommandLayers
): ModResourceCommandMergeResult => {
  const merged = new Map<string, ResolvedModResourceCommandRule>();
  const diagnostics: ModResourceMergeDiagnostic[] = [];
  const blockedCommandIds = new Set<string>();

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerRules = layers[layer];
    if (!layerRules || layerRules.length === 0) continue;
    for (const rule of dedupeCommandRulesWithinLayer(layerRules)) {
      const commandId = rule.commandId;
      const operation = rule.operation ?? "upsert";
      const existing = merged.get(commandId);

      if (operation === "remove") {
        if (!existing) {
          diagnostics.push({
            kind: "blocked",
            resourceType: "command",
            key: commandId,
            source: layer,
            reason: "remove ignored because command does not exist.",
          });
          continue;
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
        continue;
      }

      if (!existing) {
        merged.set(commandId, {
          ...rule,
          commandId,
          source: layer,
        });
        continue;
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
        continue;
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
    }
  }

  return {
    commands: [...merged.values()],
    diagnostics,
    blockedCommandIds: [...blockedCommandIds].sort((left, right) =>
      left.localeCompare(right)
    ),
  };
};
