import type { ModPackageId } from "../../../../../types";
import { fail, hasDuplicateStrings } from "../../../../utils";

export const validateModIdsArray = (
  modIds: ModPackageId[]
): { ok: true } | { ok: false; value: ReturnType<typeof fail> } => {
  if (modIds.length === 0) {
    return {
      ok: false,
      value: fail(
        "invalid-mod-ids",
        "manifest.modIds",
        "modIds must contain at least one entry."
      ),
    };
  }

  if (hasDuplicateStrings(modIds)) {
    return {
      ok: false,
      value: fail(
        "invalid-mod-ids",
        "manifest.modIds",
        "modIds must not contain duplicates."
      ),
    };
  }

  return { ok: true };
};
