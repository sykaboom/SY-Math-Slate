import type { ModPackageValidationFailure } from "../../../../../../types";
import { fail, isNonEmptyString, isPlainRecord } from "../../../../../../utils";

type ShortcutRuleEntryRecord = {
  shortcut: string;
  commandId: string;
  when: unknown;
  operation: unknown;
};

export const validateShortcutRuleEntryShapeCore = (
  entry: unknown,
  entryPath: string
):
  | { ok: true; value: ShortcutRuleEntryRecord }
  | { ok: false; value: ModPackageValidationFailure } => {
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
  return {
    ok: true,
    value: {
      shortcut: entry.shortcut,
      commandId: entry.commandId,
      when: entry.when,
      operation: entry.operation,
    },
  };
};
