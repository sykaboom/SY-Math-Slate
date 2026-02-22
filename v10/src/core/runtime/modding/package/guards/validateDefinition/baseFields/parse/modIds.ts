import type { ModPackageId } from "../../../../types";
import { fail, toStringArray } from "../../../utils";
import { validateModIdsArray } from "./modIds/validate";

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
  const validation = validateModIdsArray(modIds);
  if (!validation.ok) return { ok: false, value: validation.value };

  return {
    ok: true,
    value: {
      modIds,
      modIdSet: new Set(modIds),
    },
  };
};
