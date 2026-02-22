import type { ModPackageId } from "../../types";
import { fail, hasDuplicateStrings, isNonEmptyString, isPlainRecord, toStringArray } from "../utils";

export type ValidationBaseContext = {
  manifest: Record<string, unknown>;
  packId: string;
  version: string;
  label: string;
  modIds: ModPackageId[];
  modIdSet: Set<string>;
  activation: Record<string, unknown>;
  defaultModId: string;
};

export const parseValidationBase = (
  value: unknown
): { ok: true; value: ValidationBaseContext } | { ok: false; value: ReturnType<typeof fail> } => {
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail("invalid-root", "manifest", "manifest must be a plain object."),
    };
  }

  if (!isNonEmptyString(value.packId)) {
    return {
      ok: false,
      value: fail("invalid-pack-id", "manifest.packId", "packId must be a string."),
    };
  }

  if (!isNonEmptyString(value.version)) {
    return {
      ok: false,
      value: fail("invalid-version", "manifest.version", "version must be a string."),
    };
  }

  if (!isNonEmptyString(value.label)) {
    return {
      ok: false,
      value: fail("invalid-label", "manifest.label", "label must be a string."),
    };
  }

  const modIdsResult = toStringArray(
    value.modIds,
    "invalid-mod-ids",
    "manifest.modIds",
    "modIds must be an array of non-empty strings."
  );
  if (!modIdsResult.ok) {
    return { ok: false, value: modIdsResult.value };
  }

  const modIds = modIdsResult.value as ModPackageId[];
  if (modIds.length === 0) {
    return {
      ok: false,
      value: fail(
        "invalid-mod-ids",
        "manifest.modIds",
        "modIds must contain at least one entry."
      ),
    };
  }
  if (hasDuplicateStrings(modIds)) {
    return {
      ok: false,
      value: fail(
        "invalid-mod-ids",
        "manifest.modIds",
        "modIds must not contain duplicates."
      ),
    };
  }
  const modIdSet = new Set(modIds);

  if (!isPlainRecord(value.activation)) {
    return {
      ok: false,
      value: fail(
        "invalid-activation",
        "manifest.activation",
        "activation must be an object."
      ),
    };
  }

  if (!isNonEmptyString(value.activation.defaultModId)) {
    return {
      ok: false,
      value: fail(
        "invalid-default-mod-id",
        "manifest.activation.defaultModId",
        "defaultModId must be a string."
      ),
    };
  }

  if (!modIdSet.has(value.activation.defaultModId)) {
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
      manifest: value,
      packId: value.packId,
      version: value.version,
      label: value.label,
      modIds,
      modIdSet,
      activation: value.activation,
      defaultModId: value.activation.defaultModId,
    },
  };
};
