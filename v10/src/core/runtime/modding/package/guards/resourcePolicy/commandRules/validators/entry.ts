import type { ModPackageCommandRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { parseCommandOperation } from "./operation";
import { parseCommandOverrideAllowed } from "./override";
import {
  buildCommandRule,
  validateCommandRuleEntryShape,
} from "./entry/helpers";

export const parseCommandRuleEntry = (
  entry: unknown,
  index: number
): 
  | { ok: true; value: ModPackageCommandRule }
  | { ok: false; value: ModPackageValidationFailure } => {
  const entryPath = `manifest.resourcePolicy.commands.${index}`;
  const entryShape = validateCommandRuleEntryShape(entry, entryPath);
  if (!entryShape.ok) return entryShape;

  const parsedOperation = parseCommandOperation(entryShape.value.operation, entryPath);
  if (!parsedOperation.ok) {
    return parsedOperation;
  }

  const parsedOverrideAllowed = parseCommandOverrideAllowed(
    entryShape.value.overrideAllowed,
    entryPath
  );
  if (!parsedOverrideAllowed.ok) {
    return parsedOverrideAllowed;
  }

  return { ok: true, value: buildCommandRule(entryShape.value.commandId, parsedOperation.value, parsedOverrideAllowed.value) };
};
