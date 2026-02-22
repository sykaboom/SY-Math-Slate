import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModResourceMergeDiagnostic,
} from "../../types";
import type {
  ModResourcePolicyLayers,
  ModResourcePolicyMergeResult,
} from "./types";
import { applyPolicyLayerPatch } from "./applyLayer";

export const mergePolicyByResourceLayerLoadOrder = (
  layers: ModResourcePolicyLayers
): ModResourcePolicyMergeResult => {
  let policy: ModResourcePolicyMergeResult["policy"] = {};
  let lastAppliedLayer: ModResourcePolicyMergeResult["diagnostics"][number]["source"] | null = null;
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const patch = layers[layer];
    if (!patch || Object.keys(patch).length === 0) continue;
    const next = applyPolicyLayerPatch(policy, lastAppliedLayer, diagnostics, layer, patch);
    policy = next.policy;
    lastAppliedLayer = next.lastAppliedLayer;
  }

  return { policy, diagnostics };
};
