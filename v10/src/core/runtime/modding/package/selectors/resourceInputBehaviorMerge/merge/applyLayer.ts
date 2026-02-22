import type { ModResourceMergeDiagnostic } from "../../../types";
import type { ResolvedModResourceInputBehaviorRule } from "../types";

type NextInputBehaviorLayer = {
  resolved: ResolvedModResourceInputBehaviorRule;
  hasExplicitRule: boolean;
};

export const applyInputBehaviorLayer = (
  resolved: ResolvedModResourceInputBehaviorRule,
  hasExplicitRule: boolean,
  diagnostics: ModResourceMergeDiagnostic[],
  layer: ResolvedModResourceInputBehaviorRule["source"],
  normalized: Omit<ResolvedModResourceInputBehaviorRule, "source">
): NextInputBehaviorLayer => {
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
  return {
    resolved: { ...normalized, source: layer },
    hasExplicitRule: true,
  };
};
