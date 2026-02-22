import { fail, isNonEmptyString, isPlainRecord } from "../../../../../utils";
import type { ParsedBaseManifestRoot } from "../validate";

export const parseRootManifestRecord = (
  value: unknown
): { ok: true; value: Record<string, unknown> } | { ok: false; value: ReturnType<typeof fail> } => {
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail("invalid-root", "manifest", "manifest must be a plain object."),
    };
  }
  return { ok: true, value };
};

export const parseRootFieldString = (
  manifest: Record<string, unknown>,
  field: "packId" | "version" | "label",
  code: "invalid-pack-id" | "invalid-version" | "invalid-label"
): { ok: true; value: string } | { ok: false; value: ReturnType<typeof fail> } => {
  const value = manifest[field];
  if (!isNonEmptyString(value)) {
    return {
      ok: false,
      value: fail(code, `manifest.${field}`, `${field} must be a string.`),
    };
  }
  return { ok: true, value };
};

export const buildParsedBaseManifestRoot = (
  manifest: Record<string, unknown>,
  packId: string,
  version: string,
  label: string
): ParsedBaseManifestRoot => ({
  manifest,
  packId,
  version,
  label,
});
