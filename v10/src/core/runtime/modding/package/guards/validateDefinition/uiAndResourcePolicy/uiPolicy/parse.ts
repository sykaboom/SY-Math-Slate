import type { ModPackageDefinition } from "../../../../types";
import { fail, isPlainRecord } from "../../../utils";
import { parseUiPolicySections } from "./parse/helpers";

export const parseUiPolicy = (
  value: unknown
):
  | { ok: true; value: ModPackageDefinition["uiPolicy"] }
  | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail("invalid-ui-policy", "manifest.uiPolicy", "uiPolicy must be an object."),
    };
  }
  return parseUiPolicySections(value);
};
