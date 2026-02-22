import { fail } from "../../../utils";
import { validateBaseManifestRoot } from "./rootFields/validate";

export type BaseManifestRoot = {
  manifest: Record<string, unknown>;
  packId: string;
  version: string;
  label: string;
};

export const parseBaseManifestRoot = (
  value: unknown
): { ok: true; value: BaseManifestRoot } | { ok: false; value: ReturnType<typeof fail> } => {
  const validated = validateBaseManifestRoot(value);
  if (!validated.ok) return { ok: false, value: validated.value };

  return {
    ok: true,
    value: {
      manifest: validated.value.manifest,
      packId: validated.value.packId,
      version: validated.value.version,
      label: validated.value.label,
    },
  };
};
