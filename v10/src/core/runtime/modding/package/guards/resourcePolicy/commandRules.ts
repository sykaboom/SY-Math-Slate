import type { ModPackageCommandRule } from "../../types";
import type { ModPackageValidationFailure } from "../types";
import { KNOWN_COMMAND_OPERATIONS, fail, isNonEmptyString, isPlainRecord } from "../utils";

export const parseCommandRules = (
  value: unknown
):
  | { ok: true; value: ModPackageCommandRule[] }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.commands",
        "commands must be an array."
      ),
    };
  }

  const normalized: ModPackageCommandRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
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

    const operationValue = entry.operation;
    if (
      operationValue !== undefined &&
      (typeof operationValue !== "string" ||
        !KNOWN_COMMAND_OPERATIONS.has(operationValue))
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
    const operation = operationValue as ModPackageCommandRule["operation"] | undefined;

    if (
      entry.overrideAllowed !== undefined &&
      typeof entry.overrideAllowed !== "boolean"
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.overrideAllowed`,
          "overrideAllowed must be boolean when provided."
        ),
      };
    }

    normalized.push({
      commandId: entry.commandId.trim(),
      ...(operation ? { operation } : {}),
      ...(entry.overrideAllowed !== undefined
        ? { overrideAllowed: entry.overrideAllowed }
        : {}),
    });
  }

  return { ok: true, value: normalized };
};
