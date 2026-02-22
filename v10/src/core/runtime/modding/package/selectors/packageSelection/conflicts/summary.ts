import type { ModPackageDefinition, ModPackageId } from "../../../types";
import { comparePackIds, selectActiveModPackage } from "../sortingAndActive";
import { selectModPackageConflictIds } from "./normalize";

export type ActiveModPackageConflictSummary = {
  declaredConflictIds: ModPackageId[];
  reverseConflictIds: ModPackageId[];
  registeredConflictIds: ModPackageId[];
  missingConflictIds: ModPackageId[];
};

export const selectActiveModPackageConflictSummary = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ActiveModPackageConflictSummary => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  if (!activeDefinition) {
    return {
      declaredConflictIds: [],
      reverseConflictIds: [],
      registeredConflictIds: [],
      missingConflictIds: [],
    };
  }

  const activePackId = activeDefinition.packId;
  const declaredConflictIds = selectModPackageConflictIds(activeDefinition).filter(
    (packId) => packId !== activePackId
  );
  const registeredPackIds = new Set(definitions.map((definition) => definition.packId));
  const reverseConflictIds = definitions
    .filter((definition) => definition.packId !== activePackId)
    .filter((definition) =>
      selectModPackageConflictIds(definition).includes(activePackId)
    )
    .map((definition) => definition.packId)
    .sort(comparePackIds);

  const registeredConflictIds = [...new Set<ModPackageId>([
    ...declaredConflictIds.filter((packId) => registeredPackIds.has(packId)),
    ...reverseConflictIds,
  ])].sort(comparePackIds);

  const missingConflictIds = declaredConflictIds
    .filter((packId) => !registeredPackIds.has(packId))
    .sort(comparePackIds);

  return {
    declaredConflictIds,
    reverseConflictIds,
    registeredConflictIds,
    missingConflictIds,
  };
};
