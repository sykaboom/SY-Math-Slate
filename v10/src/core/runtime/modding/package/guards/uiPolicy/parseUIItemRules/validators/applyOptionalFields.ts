import type { ModPackageUIItemRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { fail, isNonEmptyString } from "../../../utils";
import { OPTIONAL_STRING_KEYS } from "../constants";

export const applyOptionalFields = (
  normalizedEntry: ModPackageUIItemRule,
  entry: Record<string, unknown>,
  entryPath: string
): { ok: true } | { ok: false; value: ModPackageValidationFailure } => {
  for (const key of OPTIONAL_STRING_KEYS) {
    const raw = entry[key];
    if (raw === undefined) continue;
    if (!isNonEmptyString(raw)) {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          `${entryPath}.${key}`,
          `${key} must be a non-empty string when provided.`
        ),
      };
    }
    (normalizedEntry as Record<string, unknown>)[key] = raw.trim();
  }

  if (entry.order !== undefined) {
    if (typeof entry.order !== "number" || !Number.isFinite(entry.order)) {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          `${entryPath}.order`,
          "order must be a finite number when provided."
        ),
      };
    }
    normalizedEntry.order = entry.order;
  }

  if (entry.defaultOpen !== undefined) {
    if (typeof entry.defaultOpen !== "boolean") {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          `${entryPath}.defaultOpen`,
          "defaultOpen must be a boolean when provided."
        ),
      };
    }
    normalizedEntry.defaultOpen = entry.defaultOpen;
  }

  return { ok: true };
};
