import { fail, isNonEmptyString, isPlainRecord } from "../../../utils";

export type BaseManifestRoot = {
  manifest: Record<string, unknown>;
  packId: string;
  version: string;
  label: string;
};

export const parseBaseManifestRoot = (
  value: unknown
): { ok: true; value: BaseManifestRoot } | { ok: false; value: ReturnType<typeof fail> } => {
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

  return {
    ok: true,
    value: {
      manifest: value,
      packId: value.packId,
      version: value.version,
      label: value.label,
    },
  };
};
