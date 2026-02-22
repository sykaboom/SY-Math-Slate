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
import { applyInputBehaviorLayer } from "./merge/applyLayer";

export const mergeInputBehaviorByResourceLayerLoadOrder = (
  layers: ModResourceInputBehaviorLayers
): ModResourceInputBehaviorMergeResult => {
  let resolved: ResolvedModResourceInputBehaviorRule = { ...DEFAULT_INPUT_BEHAVIOR_RULE, source: "base" };
  let hasExplicitRule = false;
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerRule = layers[layer];
    if (!layerRule) continue;
    const next = applyInputBehaviorLayer(resolved, hasExplicitRule, diagnostics, layer, normalizeInputBehaviorRule(layerRule));
    resolved = next.resolved;
    hasExplicitRule = next.hasExplicitRule;
  }

  return { inputBehavior: resolved, diagnostics };
};
