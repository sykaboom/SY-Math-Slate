import type { ModPackageValidationFailure } from "../../../types";
import { fail } from "../../../utils";

export const parseCommandOverrideAllowed = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: boolean | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (value !== undefined && typeof value !== "boolean") {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        `${entryPath}.overrideAllowed`,
        "overrideAllowed must be boolean when provided."
      ),
    };
  }

  return { ok: true, value };
};
