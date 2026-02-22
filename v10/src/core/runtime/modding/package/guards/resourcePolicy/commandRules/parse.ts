import type { ModPackageCommandRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import { fail } from "../../utils";
import { parseCommandRuleEntry } from "./validators";

export const parseCommandRules = (
  value: unknown
):
  | { ok: true; value: ModPackageCommandRule[] }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.commands",
        "commands must be an array."
      ),
    };
  }

  const normalized: ModPackageCommandRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const parsed = parseCommandRuleEntry(value[index], index);
    if (!parsed.ok) {
      return parsed;
    }
    normalized.push(parsed.value);
  }

  return { ok: true, value: normalized };
};
