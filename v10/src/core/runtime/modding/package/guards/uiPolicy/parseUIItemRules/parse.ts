import type { ModPackageUIItemRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import { fail } from "../../utils";
import {
  applyOptionalFields,
  validateUIItemBaseFields,
  validateUIItemRuleRecord,
} from "./validators";

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

    const entryResult = validateUIItemRuleRecord(entry, entryPath);
    if (!entryResult.ok) {
      return { ok: false, value: entryResult.value };
    }

    const baseResult = validateUIItemBaseFields(entryResult.value, entryPath);
    if (!baseResult.ok) {
      return { ok: false, value: baseResult.value };
    }

    const normalizedEntry: ModPackageUIItemRule = {
      ...baseResult.value,
    };

    const optionalResult = applyOptionalFields(
      normalizedEntry,
      entryResult.value,
      entryPath
    );
    if (!optionalResult.ok) {
      return { ok: false, value: optionalResult.value };
    }

    normalized.push(normalizedEntry);
  }

  return { ok: true, value: normalized };
};
