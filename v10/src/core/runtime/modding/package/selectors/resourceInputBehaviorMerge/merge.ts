import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModResourceMergeDiagnostic,
} from "../../types";
import type {
  ModResourceInputBehaviorLayers,
  ModResourceInputBehaviorMergeResult,
  ResolvedModResourceInputBehaviorRule,
} from "./types";
import {
  DEFAULT_INPUT_BEHAVIOR_RULE,
  normalizeInputBehaviorRule,
} from "./helpers";

export const mergeInputBehaviorByResourceLayerLoadOrder = (
  layers: ModResourceInputBehaviorLayers
): ModResourceInputBehaviorMergeResult => {
  let resolved: ResolvedModResourceInputBehaviorRule = {
    ...DEFAULT_INPUT_BEHAVIOR_RULE,
    source: "base",
  };
  let hasExplicitRule = false;
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerRule = layers[layer];
    if (!layerRule) continue;
    const normalized = normalizeInputBehaviorRule(layerRule);
    if (hasExplicitRule) {
      diagnostics.push({
        kind: "loser",
        resourceType: "input-behavior",
        key: "input-behavior",
        source: resolved.source,
        againstSource: layer,
        reason: "input behavior replaced by higher precedence layer.",
      });
    }
    diagnostics.push({
      kind: "winner",
      resourceType: "input-behavior",
      key: "input-behavior",
      source: layer,
      againstSource: hasExplicitRule ? resolved.source : undefined,
      reason:
        normalized.strategy === "exclusive"
          ? "exclusive input behavior selected."
          : "handled/pass chain input behavior selected.",
    });
    resolved = {
      ...normalized,
      source: layer,
    };
    hasExplicitRule = true;
  }

  return {
    inputBehavior: resolved,
    diagnostics,
  };
};
