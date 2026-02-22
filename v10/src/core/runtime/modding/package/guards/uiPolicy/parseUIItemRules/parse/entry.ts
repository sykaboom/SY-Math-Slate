import type { ModPackageUIItemRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import {
  applyOptionalFields,
  validateUIItemBaseFields,
  validateUIItemRuleRecord,
} from "../validators";

export const parseUIItemRuleEntry = (
  entry: unknown,
  entryPath: string
):
  | { ok: true; value: ModPackageUIItemRule }
  | { ok: false; value: ModPackageValidationFailure } => {
  const entryResult = validateUIItemRuleRecord(entry, entryPath);
  if (!entryResult.ok) return { ok: false, value: entryResult.value };

  const baseResult = validateUIItemBaseFields(entryResult.value, entryPath);
  if (!baseResult.ok) return { ok: false, value: baseResult.value };

  const normalizedEntry: ModPackageUIItemRule = {
    ...baseResult.value,
  };

  const optionalResult = applyOptionalFields(
    normalizedEntry,
    entryResult.value,
    entryPath
  );
  if (!optionalResult.ok) return { ok: false, value: optionalResult.value };

  return { ok: true, value: normalizedEntry };
};
