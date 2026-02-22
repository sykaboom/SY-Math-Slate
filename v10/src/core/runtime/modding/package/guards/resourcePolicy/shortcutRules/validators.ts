import type { ModPackageShortcutRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import {
  KNOWN_SHORTCUT_OPERATIONS,
  fail,
  isNonEmptyString,
  isPlainRecord,
} from "../../utils";

const parseOperation = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: ModPackageShortcutRule["operation"] | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (
    value !== undefined &&
    (typeof value !== "string" || !KNOWN_SHORTCUT_OPERATIONS.has(value))
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

  return {
    ok: true,
    value: value as ModPackageShortcutRule["operation"] | undefined,
  };
};

const parseWhen = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: string | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (value !== undefined && !isNonEmptyString(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        `${entryPath}.when`,
        "when must be a non-empty string when provided."
      ),
    };
  }

  return { ok: true, value: typeof value === "string" ? value.trim() : undefined };
};

export const parseShortcutRuleEntry = (
  entry: unknown,
  index: number
):
  | { ok: true; value: ModPackageShortcutRule }
  | { ok: false; value: ModPackageValidationFailure } => {
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

  const parsedOperation = parseOperation(entry.operation, entryPath);
  if (!parsedOperation.ok) {
    return parsedOperation;
  }

  const parsedWhen = parseWhen(entry.when, entryPath);
  if (!parsedWhen.ok) {
    return parsedWhen;
  }

  return {
    ok: true,
    value: {
      shortcut: entry.shortcut.trim(),
      commandId: entry.commandId.trim(),
      ...(parsedWhen.value ? { when: parsedWhen.value } : {}),
      ...(parsedOperation.value ? { operation: parsedOperation.value } : {}),
    },
  };
};
