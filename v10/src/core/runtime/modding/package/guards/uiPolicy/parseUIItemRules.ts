import type { ModPackageUIItemRule } from "../../types";
import type { ModPackageValidationFailure } from "../types";
import {
  KNOWN_UI_ITEM_OPERATIONS,
  fail,
  isNonEmptyString,
  isPlainRecord,
} from "../utils";

const OPTIONAL_STRING_KEYS: Array<keyof ModPackageUIItemRule> = [
  "commandId",
  "label",
  "icon",
  "title",
  "group",
  "when",
];

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
    const operation = operationValue as ModPackageUIItemRule["operation"] | undefined;

    const normalizedEntry: ModPackageUIItemRule = {
      slotId: entry.slotId.trim(),
      itemId: entry.itemId.trim(),
      ...(operation ? { operation } : {}),
    };

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

    normalized.push(normalizedEntry);
  }

  return { ok: true, value: normalized };
};
