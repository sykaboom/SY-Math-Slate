import type { ModPackageInputBehaviorRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { KNOWN_INPUT_BEHAVIOR_STRATEGIES, fail } from "../../../utils";

export const validateInputBehaviorStrategy = (
  value: unknown
):
  | { ok: true; value: ModPackageInputBehaviorRule["strategy"] }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (typeof value !== "string" || !KNOWN_INPUT_BEHAVIOR_STRATEGIES.has(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.inputBehavior.strategy",
        "strategy must be one of exclusive/handled-pass-chain."
      ),
    };
  }
  return { ok: true, value: value as ModPackageInputBehaviorRule["strategy"] };
};
