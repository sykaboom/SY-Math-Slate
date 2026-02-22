import type { ModPackageDefinition, ModPackageId } from "../../../types";
import {
  compareModPackageDefinitions,
  selectPrimaryModPackageDefinition,
} from "../comparators";

export const listSortedDefinitions = (
  definitions: Map<ModPackageId, ModPackageDefinition>
): ModPackageDefinition[] => [...definitions.values()].sort(compareModPackageDefinitions);

export const selectPrimaryDefinitionFromMap = (
  definitions: Map<ModPackageId, ModPackageDefinition>
): ModPackageDefinition | null =>
  selectPrimaryModPackageDefinition(listSortedDefinitions(definitions));
