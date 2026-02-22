import type { ModPackageInputBehaviorRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import {
  KNOWN_INPUT_BEHAVIOR_STRATEGIES,
  fail,
  isPlainRecord,
} from "../../utils";
import {
  buildInputBehaviorRule,
  normalizeChain,
  normalizeModId,
} from "./normalize";

export const parseInputBehaviorRule = (
  value: unknown,
  modIdSet: Set<string>
):
  | { ok: true; value: ModPackageInputBehaviorRule }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.inputBehavior",
        "inputBehavior must be an object."
      ),
    };
  }

  if (
    typeof value.strategy !== "string" ||
    !KNOWN_INPUT_BEHAVIOR_STRATEGIES.has(value.strategy)
  ) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.inputBehavior.strategy",
        "strategy must be one of exclusive/handled-pass-chain."
      ),
    };
  }

  const modIdResult = normalizeModId(value.modId, modIdSet);
  if (!modIdResult.ok) {
    return { ok: false, value: modIdResult.value };
  }

  const chainResult = normalizeChain(value.chain, modIdSet);
  if (!chainResult.ok) {
    return { ok: false, value: chainResult.value };
  }

  return {
    ok: true,
    value: buildInputBehaviorRule(
      value.strategy as ModPackageInputBehaviorRule["strategy"],
      modIdResult.value,
      chainResult.value
    ),
  };
};
