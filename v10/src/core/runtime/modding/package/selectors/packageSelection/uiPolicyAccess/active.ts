import type { ModPackageDefinition, ModPackageId } from "../../../types";
import { selectActiveModPackage } from "../sortingAndActive";
import {
  selectModPackageAllowedPanelSlots,
  selectModPackageAllowedToolbarContributionGroups,
} from "./base";

const selectActiveDefinition = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageDefinition | null =>
  selectActiveModPackage(definitions, activePackageId);

export const selectActiveModPackageAllowedToolbarContributionGroups = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly string[] | null => {
  const activeDefinition = selectActiveDefinition(definitions, activePackageId);
  return selectModPackageAllowedToolbarContributionGroups(activeDefinition);
};

export const selectActiveModPackageAllowedPanelSlots = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly string[] | null => {
  const activeDefinition = selectActiveDefinition(definitions, activePackageId);
  return selectModPackageAllowedPanelSlots(activeDefinition);
};
