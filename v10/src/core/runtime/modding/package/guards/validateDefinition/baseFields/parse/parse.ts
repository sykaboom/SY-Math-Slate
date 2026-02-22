import { parseActivation } from "./activation";
import { buildValidationBaseContext } from "./parse/buildContext";
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
    value: buildValidationBaseContext(
      rootResult.value,
      modIdsResult.value,
      activationResult.value
    ),
  };
};
