import type { ModPackageDefinition } from "../../../types";
import type { BuildValidatedDefinitionInput } from "./types";

export const buildValidatedDefinitionImpl = (
  input: BuildValidatedDefinitionInput
): ModPackageDefinition => ({
  packId: input.packId,
  version: input.version,
  label: input.label,
  modIds: input.modIds,
  activation: {
    defaultModId: input.defaultModId,
    toolbarModeMap: input.toolbarModeMap,
  },
  uiPolicy: input.uiPolicy,
  resourcePolicy: input.resourcePolicy,
  dependencies: input.dependencies,
  conflicts: input.conflicts,
  defaultEnabled: input.defaultEnabled,
});
