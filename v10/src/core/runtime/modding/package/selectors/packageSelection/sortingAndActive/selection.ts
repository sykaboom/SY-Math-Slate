import type { ModPackageDefinition, ModPackageId } from "../../../types";
import { listModPackagesDeterministically } from "./comparators";

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
