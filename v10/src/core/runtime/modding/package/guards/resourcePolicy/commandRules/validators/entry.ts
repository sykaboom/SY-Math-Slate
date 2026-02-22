import type { ModPackageCommandRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { fail, isNonEmptyString, isPlainRecord } from "../../../utils";
import { parseCommandOperation } from "./operation";
import { parseCommandOverrideAllowed } from "./override";

export const parseCommandRuleEntry = (
  entry: unknown,
  index: number
):
  | { ok: true; value: ModPackageCommandRule }
  | { ok: false; value: ModPackageValidationFailure } => {
  const entryPath = `manifest.resourcePolicy.commands.${index}`;
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

  const parsedOperation = parseCommandOperation(entry.operation, entryPath);
  if (!parsedOperation.ok) {
    return parsedOperation;
  }

  const parsedOverrideAllowed = parseCommandOverrideAllowed(
    entry.overrideAllowed,
    entryPath
  );
  if (!parsedOverrideAllowed.ok) {
    return parsedOverrideAllowed;
  }

  return {
    ok: true,
    value: {
      commandId: entry.commandId.trim(),
      ...(parsedOperation.value ? { operation: parsedOperation.value } : {}),
      ...(parsedOverrideAllowed.value !== undefined
        ? { overrideAllowed: parsedOverrideAllowed.value }
        : {}),
    },
  };
};
