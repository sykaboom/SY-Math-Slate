import type { ModPackageDefinition, ModPackageId } from "../../../../types";
import { comparePackIds } from "../../sortingAndActive";
import { selectModPackageConflictIds } from "../normalize";
import type { ActiveModPackageConflictSummary } from "../summary";

export const buildEmptyConflictSummary = (): ActiveModPackageConflictSummary => ({
  declaredConflictIds: [],
  reverseConflictIds: [],
  registeredConflictIds: [],
  missingConflictIds: [],
});

export const selectDeclaredConflictIds = (
  activeDefinition: ModPackageDefinition,
  activePackId: ModPackageId
) =>
  selectModPackageConflictIds(activeDefinition).filter((packId) => packId !== activePackId);

export const selectReverseConflictIds = (
  definitions: readonly ModPackageDefinition[],
  activePackId: ModPackageId
) =>
  definitions
    .filter((definition) => definition.packId !== activePackId)
    .filter((definition) => selectModPackageConflictIds(definition).includes(activePackId))
    .map((definition) => definition.packId)
    .sort(comparePackIds);

export const buildRegisteredAndMissingConflictIds = (
  declaredConflictIds: readonly ModPackageId[],
  reverseConflictIds: readonly ModPackageId[],
  registeredPackIds: ReadonlySet<ModPackageId>
) => ({
  registeredConflictIds: [
    ...new Set<ModPackageId>([
      ...declaredConflictIds.filter((packId) => registeredPackIds.has(packId)),
      ...reverseConflictIds,
    ]),
  ].sort(comparePackIds),
  missingConflictIds: declaredConflictIds
    .filter((packId) => !registeredPackIds.has(packId))
    .sort(comparePackIds),
});
