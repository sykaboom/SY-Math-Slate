import { fail } from "../../../../utils";
import {
  buildParsedBaseManifestRoot,
  parseRootFieldString,
  parseRootManifestRecord,
} from "./validate/helpers";

export type ParsedBaseManifestRoot = {
  manifest: Record<string, unknown>;
  packId: string;
  version: string;
  label: string;
};

export const validateBaseManifestRoot = (
  value: unknown
): { ok: true; value: ParsedBaseManifestRoot } | { ok: false; value: ReturnType<typeof fail> } => {
  const manifest = parseRootManifestRecord(value);
  if (!manifest.ok) return manifest;

  const packId = parseRootFieldString(manifest.value, "packId", "invalid-pack-id");
  if (!packId.ok) return packId;

  const version = parseRootFieldString(manifest.value, "version", "invalid-version");
  if (!version.ok) return version;

  const label = parseRootFieldString(manifest.value, "label", "invalid-label");
  if (!label.ok) return label;

  return {
    ok: true,
    value: buildParsedBaseManifestRoot(manifest.value, packId.value, version.value, label.value),
  };
};
