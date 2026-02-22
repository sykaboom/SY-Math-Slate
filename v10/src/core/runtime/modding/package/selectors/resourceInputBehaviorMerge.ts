import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  type ModPackageInputBehaviorRule,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
} from "../types";

export type ResolvedModResourceInputBehaviorRule = ModPackageInputBehaviorRule & {
  source: ModResourceLayer;
};

export type ModResourceInputBehaviorLayers = Partial<
  Record<ModResourceLayer, ModPackageInputBehaviorRule | null | undefined>
>;

export type ModResourceInputBehaviorMergeResult = {
  inputBehavior: ResolvedModResourceInputBehaviorRule;
  diagnostics: ModResourceMergeDiagnostic[];
};

export const DEFAULT_INPUT_BEHAVIOR_RULE: ModPackageInputBehaviorRule = Object.freeze({
  strategy: "exclusive",
});

const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeInputBehaviorRule = (
  rule: ModPackageInputBehaviorRule
): ModPackageInputBehaviorRule => {
  if (rule.strategy === "exclusive") {
    return {
      strategy: "exclusive",
      ...(rule.modId ? { modId: normalizeLayerString(rule.modId) } : {}),
    };
  }
  const chain = [...new Set((rule.chain ?? []).map((entry) => normalizeLayerString(entry)).filter((entry) => entry.length > 0))];
  return {
    strategy: "handled-pass-chain",
    ...(rule.modId ? { modId: normalizeLayerString(rule.modId) } : {}),
    chain,
  };
};

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
