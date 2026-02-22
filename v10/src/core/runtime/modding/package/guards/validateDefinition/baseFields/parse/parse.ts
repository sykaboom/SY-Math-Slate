import { parseActivation } from "./activation";
import { parseModIds } from "./modIds";
import { parseBaseManifestRoot } from "./rootFields";
import type { ValidationBaseContext } from "../types";
import { fail } from "../../../utils";

export const parseValidationBase = (
  value: unknown
): { ok: true; value: ValidationBaseContext } | { ok: false; value: ReturnType<typeof fail> } => {
  const rootResult = parseBaseManifestRoot(value);
  if (!rootResult.ok) {
    return { ok: false, value: rootResult.value };
  }

  const modIdsResult = parseModIds(rootResult.value.manifest.modIds);
  if (!modIdsResult.ok) {
    return { ok: false, value: modIdsResult.value };
  }

  const activationResult = parseActivation(
    rootResult.value.manifest.activation,
    modIdsResult.value.modIdSet
  );
  if (!activationResult.ok) {
    return { ok: false, value: activationResult.value };
  }

  return {
    ok: true,
    value: {
      manifest: rootResult.value.manifest,
      packId: rootResult.value.packId,
      version: rootResult.value.version,
      label: rootResult.value.label,
      modIds: modIdsResult.value.modIds,
      modIdSet: modIdsResult.value.modIdSet,
      activation: activationResult.value.activation,
      defaultModId: activationResult.value.defaultModId,
    },
  };
};
