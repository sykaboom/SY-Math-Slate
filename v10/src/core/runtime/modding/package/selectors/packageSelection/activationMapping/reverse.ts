import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageDefinition,
  ModPackageId,
  ModPackageToolbarMode,
  ModPackageToolbarModeResolution,
} from "../../../types";
import { selectActiveModPackage } from "../sortingAndActive";
import { selectModPackageToolbarModeResolutionForActivationModId } from "./base";

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
