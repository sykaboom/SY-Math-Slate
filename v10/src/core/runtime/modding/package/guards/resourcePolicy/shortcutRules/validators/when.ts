import type { ModPackageValidationFailure } from "../../../types";
import { fail, isNonEmptyString } from "../../../utils";

export const parseShortcutWhen = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: string | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (value !== undefined && !isNonEmptyString(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        `${entryPath}.when`,
        "when must be a non-empty string when provided."
      ),
    };
  }

  return { ok: true, value: typeof value === "string" ? value.trim() : undefined };
};
