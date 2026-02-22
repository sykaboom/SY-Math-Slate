import type { ModPackageValidationFailure } from "../../../types";
import { fail, isPlainRecord } from "../../../utils";

export const validateUIItemRuleRecord = (
  entry: unknown,
  entryPath: string
): { ok: true; value: Record<string, unknown> } | { ok: false; value: ModPackageValidationFailure } => {
  if (!isPlainRecord(entry)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        entryPath,
        "ui item rule must be an object."
      ),
    };
  }
  return { ok: true, value: entry };
};
