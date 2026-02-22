import type { ModPackageShortcutRule } from "../../types";
import type { ModPackageValidationFailure } from "../types";
import {
  KNOWN_SHORTCUT_OPERATIONS,
  fail,
  isNonEmptyString,
  isPlainRecord,
} from "../utils";

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
    const entry = value[index];
    const entryPath = `manifest.resourcePolicy.shortcuts.${index}`;
    if (
      !isPlainRecord(entry) ||
      !isNonEmptyString(entry.shortcut) ||
      !isNonEmptyString(entry.commandId)
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          entryPath,
          "shortcut and commandId must be non-empty strings."
        ),
      };
    }

    const operationValue = entry.operation;
    if (
      operationValue !== undefined &&
      (typeof operationValue !== "string" ||
        !KNOWN_SHORTCUT_OPERATIONS.has(operationValue))
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.operation`,
          "operation must be one of upsert/remove."
        ),
      };
    }
    const operation = operationValue as ModPackageShortcutRule["operation"] | undefined;

    if (entry.when !== undefined && !isNonEmptyString(entry.when)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.when`,
          "when must be a non-empty string when provided."
        ),
      };
    }

    normalized.push({
      shortcut: entry.shortcut.trim(),
      commandId: entry.commandId.trim(),
      ...(entry.when ? { when: entry.when.trim() } : {}),
      ...(operation ? { operation } : {}),
    });
  }

  return { ok: true, value: normalized };
};
