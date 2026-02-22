import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageActivationModIdResolution,
  ModPackageDefinition,
  ModPackageToolbarMode,
} from "../../../../types";

export const selectModPackageActivationModIdResolutionForToolbarMode = (
  definition: ModPackageDefinition | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModPackageActivationModIdResolution => {
  const mappedModId = definition?.activation.toolbarModeMap?.[toolbarMode] ?? null;
  if (mappedModId) {
    return {
      modId: mappedModId,
      source: "package-map",
      aliasFallbackSource: null,
    };
  }

  return {
    modId: null,
    source: "none",
    aliasFallbackSource: null,
  };
};

export const selectModPackageActivationModIdForToolbarMode = (
  definition: ModPackageDefinition | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const resolution = selectModPackageActivationModIdResolutionForToolbarMode(
    definition,
    toolbarMode
  );
  return resolution.modId;
};
