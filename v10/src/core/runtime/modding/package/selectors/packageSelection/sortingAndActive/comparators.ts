import type { ModPackageDefinition } from "../../../types";

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
