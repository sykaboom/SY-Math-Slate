import type { ModPackageCommandRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { KNOWN_COMMAND_OPERATIONS, fail } from "../../../utils";

export const parseCommandOperation = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: ModPackageCommandRule["operation"] | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (
    value !== undefined &&
    (typeof value !== "string" || !KNOWN_COMMAND_OPERATIONS.has(value))
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
    value: value as ModPackageCommandRule["operation"] | undefined,
  };
};
