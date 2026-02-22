import type { ModPackageDefinition, ModPackageId } from "../../../types";
import {
  selectActiveModPackageAllowedPanelSlots,
  selectActiveModPackageAllowedToolbarContributionGroups,
} from "./active";
import {
  selectModPackageAllowedPanelSlots,
  selectModPackageAllowedToolbarContributionGroups,
} from "./base";

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
  const allowedGroups = selectActiveModPackageAllowedToolbarContributionGroups(
    definitions,
    activePackageId
  );
  if (!allowedGroups) return true;
  return allowedGroups.includes(group);
};

export const selectActiveModPackageAllowsPanelSlot = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  slot: string
): boolean => {
  const allowedSlots = selectActiveModPackageAllowedPanelSlots(
    definitions,
    activePackageId
  );
  if (!allowedSlots) return true;
  return allowedSlots.includes(slot);
};
