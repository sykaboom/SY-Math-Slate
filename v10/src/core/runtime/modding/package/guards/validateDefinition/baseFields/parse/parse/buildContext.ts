import type { ValidationBaseContext } from "../../types";
import type { ParsedActivation } from "../activation";
import type { ParsedModIds } from "../modIds";
import type { BaseManifestRoot } from "../rootFields";

export const buildValidationBaseContext = (
  root: BaseManifestRoot,
  modIds: ParsedModIds,
  activation: ParsedActivation
): ValidationBaseContext => ({
  manifest: root.manifest,
  packId: root.packId,
  version: root.version,
  label: root.label,
  modIds: modIds.modIds,
  modIdSet: modIds.modIdSet,
  activation: activation.activation,
  defaultModId: activation.defaultModId,
});
