import type { ModPackageValidationFailure } from "../../../types";
import { fail, isPlainRecord } from "../../../utils";

export const ensureInputBehaviorRecord = (
  value: unknown
):
  | { ok: true; value: Record<string, unknown> }
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
  return { ok: true, value };
};
