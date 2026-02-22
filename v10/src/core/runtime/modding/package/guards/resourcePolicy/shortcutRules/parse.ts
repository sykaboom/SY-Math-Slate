import type { ModPackageShortcutRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import { fail } from "../../utils";
import { parseShortcutRuleEntry } from "./validators";

export const parseShortcutRules = (
  value: unknown
):
  | { ok: true; value: ModPackageShortcutRule[] }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.shortcuts",
        "shortcuts must be an array."
      ),
    };
  }

  const normalized: ModPackageShortcutRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const parsed = parseShortcutRuleEntry(value[index], index);
    if (!parsed.ok) {
      return parsed;
    }
    normalized.push(parsed.value);
  }

  return { ok: true, value: normalized };
};
