import type { ModPackageShortcutRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { fail, isNonEmptyString, isPlainRecord } from "../../../utils";
import { parseShortcutOperation } from "./operation";
import { parseShortcutWhen } from "./when";

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

  const parsedOperation = parseShortcutOperation(entry.operation, entryPath);
  if (!parsedOperation.ok) {
    return parsedOperation;
  }

  const parsedWhen = parseShortcutWhen(entry.when, entryPath);
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
