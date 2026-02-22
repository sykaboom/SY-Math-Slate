import type { ModPackageShortcutRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { KNOWN_SHORTCUT_OPERATIONS, fail } from "../../../utils";

export const parseShortcutOperation = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: ModPackageShortcutRule["operation"] | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (
    value !== undefined &&
    (typeof value !== "string" || !KNOWN_SHORTCUT_OPERATIONS.has(value))
  ) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        `${entryPath}.operation`,
        "operation must be one of upsert/remove."
      ),
    };
  }

  return {
    ok: true,
    value: value as ModPackageShortcutRule["operation"] | undefined,
  };
};
