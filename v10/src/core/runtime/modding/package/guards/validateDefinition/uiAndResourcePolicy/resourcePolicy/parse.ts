import type { ModPackageDefinition } from "../../../../types";
import { fail, isPlainRecord } from "../../../utils";
import { parseResourcePolicySections } from "./parse/helpers";

export const parseResourcePolicy = (
  value: unknown,
  modIdSet: Set<string>
):
  | { ok: true; value: ModPackageDefinition["resourcePolicy"] }
  | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy",
        "resourcePolicy must be an object."
      ),
    };
  }
  return parseResourcePolicySections(value, modIdSet);
};
