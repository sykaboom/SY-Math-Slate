import type { ModPackageDefinition } from "../../types";

const comparePackIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

export const compareModPackageDefinitions = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => {
  const defaultEnabledDelta = Number(Boolean(right.defaultEnabled)) - Number(Boolean(left.defaultEnabled));
  if (defaultEnabledDelta !== 0) {
    return defaultEnabledDelta;
  }
  return comparePackIds(left.packId, right.packId);
};

const selectPrimaryModPackage = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition | null => {
  const ordered = [...definitions].sort(compareModPackageDefinitions);
  return ordered[0] ?? null;
};

export const sortModPackageDefinitionsByPackId = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition[] => [...definitions].sort((left, right) => comparePackIds(left.packId, right.packId));

export const selectPrimaryModPackageDefinition = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition | null => selectPrimaryModPackage(definitions);
