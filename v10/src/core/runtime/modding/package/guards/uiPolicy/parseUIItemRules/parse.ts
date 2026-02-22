import type { ModPackageUIItemRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import { fail } from "../../utils";
import { parseUIItemRuleEntry } from "./parse/entry";

export const parseUIItemRules = (
  value: unknown,
  path: string
):
  | { ok: true; value: ModPackageUIItemRule[] }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail("invalid-ui-policy", path, "ui item rules must be an array."),
    };
  }

  const normalized: ModPackageUIItemRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    const entryPath = `${path}.${index}`;
    const entryResult = parseUIItemRuleEntry(entry, entryPath);
    if (!entryResult.ok) return { ok: false, value: entryResult.value };
    normalized.push(entryResult.value);
  }

  return { ok: true, value: normalized };
};
