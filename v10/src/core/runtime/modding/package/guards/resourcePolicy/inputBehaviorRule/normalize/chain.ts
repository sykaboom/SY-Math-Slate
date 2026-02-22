import { toStringArray } from "../../../utils";
import type { ModPackageValidationFailure } from "../../../types";

export const normalizeChain = (
  value: unknown,
  modIdSet: Set<string>
): { ok: true; value: string[] | undefined } | { ok: false; value: ModPackageValidationFailure } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  const chainResult = toStringArray(
    value,
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
        value: {
          ok: false,
          code: "invalid-resource-policy",
          path: "manifest.resourcePolicy.inputBehavior.chain",
          message: "chain entries must exist in modIds.",
        },
      };
    }
  }

  return {
    ok: true,
    value: [...new Set(chainResult.value.map((entry) => entry.trim()))],
  };
};
