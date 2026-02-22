import type { ModPackageValidationFailure } from "../../../../../types";
import { fail, isNonEmptyString, isPlainRecord } from "../../../../../utils";

type CommandRuleEntryRecord = {
  commandId: string;
  operation: unknown;
  overrideAllowed: unknown;
};

export const validateCommandRuleEntryShape = (
  entry: unknown,
  entryPath: string
):
  | { ok: true; value: CommandRuleEntryRecord }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!isPlainRecord(entry) || !isNonEmptyString(entry.commandId)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        `${entryPath}.commandId`,
        "commandId must be a non-empty string."
      ),
    };
  }
  return {
    ok: true,
    value: {
      commandId: entry.commandId,
      operation: entry.operation,
      overrideAllowed: entry.overrideAllowed,
    },
  };
};
