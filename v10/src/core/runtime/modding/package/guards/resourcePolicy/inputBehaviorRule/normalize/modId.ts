import { isNonEmptyString } from "../../../utils";
import type { ModPackageValidationFailure } from "../../../types";

export const normalizeModId = (
  value: unknown,
  modIdSet: Set<string>
): { ok: true; value: string | undefined } | { ok: false; value: ModPackageValidationFailure } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (!isNonEmptyString(value)) {
    return {
      ok: false,
      value: {
        ok: false,
        code: "invalid-resource-policy",
        path: "manifest.resourcePolicy.inputBehavior.modId",
        message: "modId must be a non-empty string when provided.",
      },
    };
  }

  if (!modIdSet.has(value)) {
    return {
      ok: false,
      value: {
        ok: false,
        code: "invalid-resource-policy",
        path: "manifest.resourcePolicy.inputBehavior.modId",
        message: "modId must exist in modIds.",
      },
    };
  }

  return { ok: true, value: value.trim() };
};
