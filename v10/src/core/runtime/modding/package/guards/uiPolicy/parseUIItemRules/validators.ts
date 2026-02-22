import type { ModPackageUIItemRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import {
  KNOWN_UI_ITEM_OPERATIONS,
  fail,
  isNonEmptyString,
  isPlainRecord,
} from "../../utils";
import { OPTIONAL_STRING_KEYS } from "./constants";

export const validateUIItemRuleRecord = (
  entry: unknown,
  entryPath: string
): { ok: true; value: Record<string, unknown> } | { ok: false; value: ModPackageValidationFailure } => {
  if (!isPlainRecord(entry)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        entryPath,
        "ui item rule must be an object."
      ),
    };
  }
  return { ok: true, value: entry };
};

export const validateUIItemBaseFields = (
  entry: Record<string, unknown>,
  entryPath: string
):
  | { ok: true; value: Pick<ModPackageUIItemRule, "slotId" | "itemId" | "operation"> }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!isNonEmptyString(entry.slotId)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        `${entryPath}.slotId`,
        "slotId must be a non-empty string."
      ),
    };
  }
  if (!isNonEmptyString(entry.itemId)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        `${entryPath}.itemId`,
        "itemId must be a non-empty string."
      ),
    };
  }

  const operationValue = entry.operation;
  if (
    operationValue !== undefined &&
    (typeof operationValue !== "string" ||
      !KNOWN_UI_ITEM_OPERATIONS.has(operationValue))
  ) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        `${entryPath}.operation`,
        "operation must be one of add/override/remove."
      ),
    };
  }

  return {
    ok: true,
    value: {
      slotId: entry.slotId.trim(),
      itemId: entry.itemId.trim(),
      ...(operationValue
        ? { operation: operationValue as ModPackageUIItemRule["operation"] }
        : {}),
    },
  };
};

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
