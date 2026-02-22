import type { ModPackageUIItemRule } from "../../../../types";
import type { ModPackageValidationFailure } from "../../../types";
import { KNOWN_UI_ITEM_OPERATIONS, fail, isNonEmptyString } from "../../../utils";

export const validateUIItemBaseFields = (
  entry: Record<string, unknown>,
  entryPath: string
):
  | { ok: true; value: Pick<ModPackageUIItemRule, "slotId" | "itemId" | "operation"> }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!isNonEmptyString(entry.slotId)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        `${entryPath}.slotId`,
        "slotId must be a non-empty string."
      ),
    };
  }
  if (!isNonEmptyString(entry.itemId)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        `${entryPath}.itemId`,
        "itemId must be a non-empty string."
      ),
    };
  }

  const operationValue = entry.operation;
  if (
    operationValue !== undefined &&
    (typeof operationValue !== "string" || !KNOWN_UI_ITEM_OPERATIONS.has(operationValue))
  ) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        `${entryPath}.operation`,
        "operation must be one of add/override/remove."
      ),
    };
  }

  return {
    ok: true,
    value: {
      slotId: entry.slotId.trim(),
      itemId: entry.itemId.trim(),
      ...(operationValue
        ? { operation: operationValue as ModPackageUIItemRule["operation"] }
        : {}),
    },
  };
};
