import type { ModPackageInputBehaviorRule } from "../../types";
import type { ModPackageValidationFailure } from "../types";
import {
  KNOWN_INPUT_BEHAVIOR_STRATEGIES,
  fail,
  isNonEmptyString,
  isPlainRecord,
  toStringArray,
} from "../utils";

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

  let modId: string | undefined;
  if (value.modId !== undefined) {
    if (!isNonEmptyString(value.modId)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.inputBehavior.modId",
          "modId must be a non-empty string when provided."
        ),
      };
    }
    if (!modIdSet.has(value.modId)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.inputBehavior.modId",
          "modId must exist in modIds."
        ),
      };
    }
    modId = value.modId.trim();
  }

  let chain: string[] | undefined;
  if (value.chain !== undefined) {
    const chainResult = toStringArray(
      value.chain,
      "invalid-resource-policy",
      "manifest.resourcePolicy.inputBehavior.chain",
      "chain must be an array of non-empty strings."
    );
    if (!chainResult.ok) {
      return { ok: false, value: chainResult.value };
    }

    for (const chainModId of chainResult.value) {
      if (!modIdSet.has(chainModId)) {
        return {
          ok: false,
          value: fail(
            "invalid-resource-policy",
            "manifest.resourcePolicy.inputBehavior.chain",
            "chain entries must exist in modIds."
          ),
        };
      }
    }

    chain = [...new Set(chainResult.value.map((entry) => entry.trim()))];
  }

  return {
    ok: true,
    value: {
      strategy: value.strategy as ModPackageInputBehaviorRule["strategy"],
      ...(modId ? { modId } : {}),
      ...(chain ? { chain } : {}),
    },
  };
};
