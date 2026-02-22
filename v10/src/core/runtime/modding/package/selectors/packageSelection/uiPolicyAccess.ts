import type { ModPackageDefinition, ModPackageId } from "../../types";
import { selectActiveModPackage } from "./sortingAndActive";

export const selectModPackageAllowedToolbarContributionGroups = (
  definition: ModPackageDefinition | null | undefined
): readonly string[] | null =>
  definition?.uiPolicy?.allowToolbarContributionGroups ?? null;

export const selectModPackageAllowedPanelSlots = (
  definition: ModPackageDefinition | null | undefined
): readonly string[] | null => definition?.uiPolicy?.allowPanelSlots ?? null;

export const selectActiveModPackageAllowedToolbarContributionGroups = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly string[] | null => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageAllowedToolbarContributionGroups(activeDefinition);
};

export const selectActiveModPackageAllowedPanelSlots = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly string[] | null => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageAllowedPanelSlots(activeDefinition);
};

export const selectModPackageAllowsToolbarContributionGroup = (
  definition: ModPackageDefinition | null | undefined,
  group: string
): boolean => {
  const allowedGroups = selectModPackageAllowedToolbarContributionGroups(definition);
  if (!allowedGroups) return true;
  return allowedGroups.includes(group);
};

export const selectModPackageAllowsPanelSlot = (
  definition: ModPackageDefinition | null | undefined,
  slot: string
): boolean => {
  const allowedSlots = selectModPackageAllowedPanelSlots(definition);
  if (!allowedSlots) return true;
  return allowedSlots.includes(slot);
};

export const selectActiveModPackageAllowsToolbarContributionGroup = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  group: string
): boolean => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageAllowsToolbarContributionGroup(activeDefinition, group);
};

export const selectActiveModPackageAllowsPanelSlot = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  slot: string
): boolean => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageAllowsPanelSlot(activeDefinition, slot);
};
