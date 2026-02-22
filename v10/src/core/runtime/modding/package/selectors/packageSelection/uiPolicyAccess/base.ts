import type { ModPackageDefinition } from "../../../types";

export const selectModPackageAllowedToolbarContributionGroups = (
  definition: ModPackageDefinition | null | undefined
): readonly string[] | null =>
  definition?.uiPolicy?.allowToolbarContributionGroups ?? null;

export const selectModPackageAllowedPanelSlots = (
  definition: ModPackageDefinition | null | undefined
): readonly string[] | null => definition?.uiPolicy?.allowPanelSlots ?? null;
