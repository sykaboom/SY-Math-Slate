import type { ModPackageCommandRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import {
  KNOWN_COMMAND_OPERATIONS,
  fail,
  isNonEmptyString,
  isPlainRecord,
} from "../../utils";

const parseOperation = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: ModPackageCommandRule["operation"] | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (
    value !== undefined &&
    (typeof value !== "string" || !KNOWN_COMMAND_OPERATIONS.has(value))
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
    value: value as ModPackageCommandRule["operation"] | undefined,
  };
};

const parseOverrideAllowed = (
  value: unknown,
  entryPath: string
):
  | { ok: true; value: boolean | undefined }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (value !== undefined && typeof value !== "boolean") {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        `${entryPath}.overrideAllowed`,
        "overrideAllowed must be boolean when provided."
      ),
    };
  }

  return { ok: true, value };
};

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

  const parsedOperation = parseOperation(entry.operation, entryPath);
  if (!parsedOperation.ok) {
    return parsedOperation;
  }

  const parsedOverrideAllowed = parseOverrideAllowed(
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
