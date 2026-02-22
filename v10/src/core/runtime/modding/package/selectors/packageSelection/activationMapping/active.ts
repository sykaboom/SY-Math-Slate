import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageActivationModIdResolution,
  ModPackageDefinition,
  ModPackageId,
  ModPackageToolbarMode,
} from "../../../types";
import { selectActiveModPackage } from "../sortingAndActive";
import { selectModPackageActivationModIdResolutionForToolbarMode } from "./base";

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
