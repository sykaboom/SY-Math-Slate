import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModPackageJsonObject,
  type ModPackageJsonValue,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
} from "../types";

export type ModResourcePolicyLayers = Partial<
  Record<ModResourceLayer, ModPackageJsonObject | null | undefined>
>;

export type ModResourcePolicyMergeResult = {
  policy: ModPackageJsonObject;
  diagnostics: ModResourceMergeDiagnostic[];
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneJsonValue = (value: ModPackageJsonValue): ModPackageJsonValue => {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneJsonValue(entry)) as ModPackageJsonValue;
  }
  if (isPlainRecord(value)) {
    return cloneJsonObject(value as ModPackageJsonObject);
  }
  return value;
};

const cloneJsonObject = (value: ModPackageJsonObject): ModPackageJsonObject => {
  const cloned: ModPackageJsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    cloned[key] = cloneJsonValue(entry);
  }
  return cloned;
};

const applyJsonMergePatchObject = (
  baseValue: ModPackageJsonObject,
  patchValue: ModPackageJsonObject
): ModPackageJsonObject => {
  const next = cloneJsonObject(baseValue);
  for (const [key, patchEntry] of Object.entries(patchValue)) {
    if (patchEntry === null) {
      delete next[key];
      continue;
    }
    if (Array.isArray(patchEntry)) {
      next[key] = patchEntry.map((entry) => cloneJsonValue(entry));
      continue;
    }
    if (isPlainRecord(patchEntry)) {
      const existing = next[key];
      const existingObject = isPlainRecord(existing)
        ? (existing as ModPackageJsonObject)
        : {};
      next[key] = applyJsonMergePatchObject(
        existingObject,
        patchEntry as ModPackageJsonObject
      );
      continue;
    }
    next[key] = patchEntry;
  }
  return next;
};

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
