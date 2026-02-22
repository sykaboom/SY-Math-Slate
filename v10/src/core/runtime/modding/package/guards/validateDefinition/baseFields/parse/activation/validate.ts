import { fail, isNonEmptyString, isPlainRecord } from "../../../../utils";

export type ParsedActivationValue = {
  activation: Record<string, unknown>;
  defaultModId: string;
};

export const validateActivation = (
  value: unknown,
  modIdSet: Set<string>
): { ok: true; value: ParsedActivationValue } | { ok: false; value: ReturnType<typeof fail> } => {
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail("invalid-activation", "manifest.activation", "activation must be an object."),
    };
  }

  if (!isNonEmptyString(value.defaultModId)) {
    return {
      ok: false,
      value: fail(
        "invalid-default-mod-id",
        "manifest.activation.defaultModId",
        "defaultModId must be a string."
      ),
    };
  }

  if (!modIdSet.has(value.defaultModId)) {
    return {
      ok: false,
      value: fail(
        "invalid-default-mod-id",
        "manifest.activation.defaultModId",
        "defaultModId must exist in modIds."
      ),
    };
  }

  return {
    ok: true,
    value: {
      activation: value,
      defaultModId: value.defaultModId,
    },
  };
};
