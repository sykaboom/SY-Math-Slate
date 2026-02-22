import type { ModPackageId } from "../../../../types";
import { fail, hasDuplicateStrings, toStringArray } from "../../../utils";

export type ParsedModIds = {
  modIds: ModPackageId[];
  modIdSet: Set<string>;
};

export const parseModIds = (
  value: unknown
): { ok: true; value: ParsedModIds } | { ok: false; value: ReturnType<typeof fail> } => {
  const modIdsResult = toStringArray(
    value,
    "invalid-mod-ids",
    "manifest.modIds",
    "modIds must be an array of non-empty strings."
  );
  if (!modIdsResult.ok) {
    return { ok: false, value: modIdsResult.value };
  }

  const modIds = modIdsResult.value as ModPackageId[];
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

  return {
    ok: true,
    value: {
      modIds,
      modIdSet: new Set(modIds),
    },
  };
};
