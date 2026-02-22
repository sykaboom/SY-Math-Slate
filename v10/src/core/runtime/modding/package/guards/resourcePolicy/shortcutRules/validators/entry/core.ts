import type { ModPackageShortcutRule } from "../../../../../types";
import type { ModPackageValidationFailure } from "../../../../types";
import { parseShortcutOperation } from "../operation";
import { parseShortcutWhen } from "../when";
import {
  buildShortcutRule,
  validateShortcutRuleEntryShape,
} from "../entry/helpers";

export const parseShortcutRuleEntryCore = (
  entry: unknown,
  index: number
):
  | { ok: true; value: ModPackageShortcutRule }
  | { ok: false; value: ModPackageValidationFailure } => {
  const entryPath = `manifest.resourcePolicy.shortcuts.${index}`;
  const entryShape = validateShortcutRuleEntryShape(entry, entryPath);
  if (!entryShape.ok) return entryShape;

  const parsedOperation = parseShortcutOperation(entryShape.value.operation, entryPath);
  if (!parsedOperation.ok) {
    return parsedOperation;
  }

  const parsedWhen = parseShortcutWhen(entryShape.value.when, entryPath);
  if (!parsedWhen.ok) {
    return parsedWhen;
  }

  return {
    ok: true,
    value: buildShortcutRule(
      entryShape.value.shortcut,
      entryShape.value.commandId,
      parsedWhen.value,
      parsedOperation.value
    ),
  };
};
