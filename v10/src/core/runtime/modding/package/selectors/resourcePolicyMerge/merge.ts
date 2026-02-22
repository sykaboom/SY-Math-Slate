import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModPackageJsonObject,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
} from "../../types";
import type {
  ModResourcePolicyLayers,
  ModResourcePolicyMergeResult,
} from "./types";
import { applyJsonMergePatchObject } from "./helpers";

export const mergePolicyByResourceLayerLoadOrder = (
  layers: ModResourcePolicyLayers
): ModResourcePolicyMergeResult => {
  let policy: ModPackageJsonObject = {};
  let lastAppliedLayer: ModResourceLayer | null = null;
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const patch = layers[layer];
    if (!patch) continue;
    const patchKeys = Object.keys(patch);
    if (patchKeys.length === 0) continue;

    if (lastAppliedLayer && lastAppliedLayer !== layer) {
      diagnostics.push({
        kind: "loser",
        resourceType: "policy",
        key: "*",
        source: lastAppliedLayer,
        againstSource: layer,
        reason: "policy patch superseded by higher precedence layer.",
      });
    }
    diagnostics.push({
      kind: "winner",
      resourceType: "policy",
      key: "*",
      source: layer,
      againstSource: lastAppliedLayer ?? undefined,
      reason: "policy json merge patch applied.",
    });
    policy = applyJsonMergePatchObject(policy, patch);
    lastAppliedLayer = layer;
  }

  return { policy, diagnostics };
};
