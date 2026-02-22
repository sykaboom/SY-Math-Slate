import type { ModPackageDefinition, ModPackageId } from "../../../types";
import { selectActiveModPackage } from "../sortingAndActive";
import { buildEmptyConflictSummary, buildRegisteredAndMissingConflictIds, selectDeclaredConflictIds, selectReverseConflictIds } from "./summary/helpers";

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
    return buildEmptyConflictSummary();
  }

  const activePackId = activeDefinition.packId;
  const declaredConflictIds = selectDeclaredConflictIds(activeDefinition, activePackId);
  const registeredPackIds = new Set(definitions.map((definition) => definition.packId));
  const reverseConflictIds = selectReverseConflictIds(definitions, activePackId);
  const { registeredConflictIds, missingConflictIds } = buildRegisteredAndMissingConflictIds(
    declaredConflictIds,
    reverseConflictIds,
    registeredPackIds
  );

  return { declaredConflictIds, reverseConflictIds, registeredConflictIds, missingConflictIds };
};
