import type { ModId } from "@core/runtime/modding/api";

import type { ModPackageDefinition, ModPackageId } from "../../../types";
import {
  selectActiveModPackage,
  selectModPackageById,
  selectPrimaryModPackage,
} from "./selection";

export type ActiveModPackageResolution = {
  requestedPackageId: ModPackageId | null;
  resolvedPackageId: ModPackageId | null;
  fallbackToPrimary: boolean;
};

export const selectActiveModPackageResolution = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ActiveModPackageResolution => {
  const requestedPackageId = activePackageId ?? null;
  const explicitActivePackage = selectModPackageById(definitions, requestedPackageId);
  const resolvedActivePackage = explicitActivePackage ?? selectPrimaryModPackage(definitions);
  return {
    requestedPackageId,
    resolvedPackageId: resolvedActivePackage?.packId ?? null,
    fallbackToPrimary:
      resolvedActivePackage !== null && explicitActivePackage === null,
  };
};

export const selectModPackageModIds = (
  definition: ModPackageDefinition | null | undefined
): readonly ModId[] => definition?.modIds ?? [];

export const selectModPackageContainsModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): boolean => {
  if (!definition || !modId) return false;
  return definition.modIds.includes(modId);
};

export const selectActiveModPackageContainsModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): boolean => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageContainsModId(activeDefinition, modId);
};
