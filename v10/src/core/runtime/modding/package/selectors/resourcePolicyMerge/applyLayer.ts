import type { ModPackageJsonObject, ModResourceMergeDiagnostic } from "../../types";
import { applyJsonMergePatchObject } from "./helpers";

type PolicyLayerApplyResult = {
  policy: ModPackageJsonObject;
  lastAppliedLayer: ModResourceMergeDiagnostic["source"];
};

export const applyPolicyLayerPatch = (
  policy: ModPackageJsonObject,
  lastAppliedLayer: ModResourceMergeDiagnostic["source"] | null,
  diagnostics: ModResourceMergeDiagnostic[],
  layer: ModResourceMergeDiagnostic["source"],
  patch: ModPackageJsonObject
): PolicyLayerApplyResult => {
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
  return {
    policy: applyJsonMergePatchObject(policy, patch),
    lastAppliedLayer: layer,
  };
};
