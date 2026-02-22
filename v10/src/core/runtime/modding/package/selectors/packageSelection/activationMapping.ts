import type { ModId } from "@core/runtime/modding/api";

import {
  MOD_PACKAGE_TOOLBAR_MODES,
  type ModPackageActivationModIdResolution,
  type ModPackageDefinition,
  type ModPackageId,
  type ModPackageToolbarMode,
  type ModPackageToolbarModeResolution,
} from "../../types";
import { selectActiveModPackage } from "./sortingAndActive";

export const selectModPackageActivationDefaultModId = (
  definition: ModPackageDefinition | null | undefined
): ModId | null => definition?.activation.defaultModId ?? null;

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

export const selectActiveModPackageActivationModIdForToolbarMode = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const resolution =
    selectActiveModPackageActivationModIdResolutionForToolbarMode(
      definitions,
      activePackageId,
      toolbarMode
    );
  return resolution.modId;
};

export const selectActiveModPackageActivationModIdResolutionForToolbarMode = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModPackageActivationModIdResolution => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageActivationModIdResolutionForToolbarMode(
    activeDefinition,
    toolbarMode
  );
};

export const selectModPackageToolbarModeForActivationModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarMode | null => {
  const resolution = selectModPackageToolbarModeResolutionForActivationModId(
    definition,
    modId
  );
  return resolution.toolbarMode;
};

export const selectModPackageToolbarModeResolutionForActivationModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarModeResolution => {
  if (!modId) {
    return {
      toolbarMode: null,
      source: "none",
      aliasFallbackSource: null,
    };
  }

  if (definition) {
    for (const toolbarMode of MOD_PACKAGE_TOOLBAR_MODES) {
      if (definition.activation.toolbarModeMap?.[toolbarMode] === modId) {
        return {
          toolbarMode,
          source: "package-map",
          aliasFallbackSource: null,
        };
      }
    }
  }

  return {
    toolbarMode: null,
    source: "none",
    aliasFallbackSource: null,
  };
};

export const selectActiveModPackageToolbarModeForActivationModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarMode | null => {
  const resolution = selectActiveModPackageToolbarModeResolutionForActivationModId(
    definitions,
    activePackageId,
    modId
  );
  return resolution.toolbarMode;
};

export const selectActiveModPackageToolbarModeResolutionForActivationModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarModeResolution => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageToolbarModeResolutionForActivationModId(
    activeDefinition,
    modId
  );
};
