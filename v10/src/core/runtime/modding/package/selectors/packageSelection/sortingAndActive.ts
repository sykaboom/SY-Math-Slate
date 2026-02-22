import type { ModId } from "@core/runtime/modding/api";

import type { ModPackageDefinition, ModPackageId } from "../../types";

export const comparePackIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

export const compareModPackageDefinitions = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => {
  const defaultEnabledDelta =
    Number(Boolean(right.defaultEnabled)) - Number(Boolean(left.defaultEnabled));
  if (defaultEnabledDelta !== 0) {
    return defaultEnabledDelta;
  }
  return comparePackIds(left.packId, right.packId);
};

export const listModPackagesDeterministically = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition[] => [...definitions].sort(compareModPackageDefinitions);

export const selectModPackageById = (
  definitions: readonly ModPackageDefinition[],
  packId: ModPackageId | null | undefined
): ModPackageDefinition | null => {
  if (!packId) return null;
  return definitions.find((definition) => definition.packId === packId) ?? null;
};

export const selectPrimaryModPackage = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition | null => {
  const ordered = listModPackagesDeterministically(definitions);
  return ordered[0] ?? null;
};

export const selectActiveModPackage = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageDefinition | null => {
  const activeDefinition = selectModPackageById(definitions, activePackageId);
  return activeDefinition ?? selectPrimaryModPackage(definitions);
};

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
