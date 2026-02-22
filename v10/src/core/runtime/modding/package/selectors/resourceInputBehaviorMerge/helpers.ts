import type { ModPackageInputBehaviorRule } from "../../types";

export const DEFAULT_INPUT_BEHAVIOR_RULE: ModPackageInputBehaviorRule = Object.freeze({
  strategy: "exclusive",
});

const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const normalizeInputBehaviorRule = (
  rule: ModPackageInputBehaviorRule
): ModPackageInputBehaviorRule => {
  if (rule.strategy === "exclusive") {
    return {
      strategy: "exclusive",
      ...(rule.modId ? { modId: normalizeLayerString(rule.modId) } : {}),
    };
  }
  const chain = [
    ...new Set(
      (rule.chain ?? [])
        .map((entry) => normalizeLayerString(entry))
        .filter((entry) => entry.length > 0)
    ),
  ];
  return {
    strategy: "handled-pass-chain",
    ...(rule.modId ? { modId: normalizeLayerString(rule.modId) } : {}),
    chain,
  };
};
