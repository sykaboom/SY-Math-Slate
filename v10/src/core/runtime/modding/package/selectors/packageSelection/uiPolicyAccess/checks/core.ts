import type { ModPackageDefinition, ModPackageId } from "../../../../types";
import {
  selectActiveModPackageAllowedPanelSlots,
  selectActiveModPackageAllowedToolbarContributionGroups,
} from "../active";
import {
  selectModPackageAllowedPanelSlots,
  selectModPackageAllowedToolbarContributionGroups,
} from "../base";
import { allowsValueWhenDefined } from "./helpers";

export const selectModPackageAllowsToolbarContributionGroup = (
  definition: ModPackageDefinition | null | undefined,
  group: string
): boolean =>
  allowsValueWhenDefined(selectModPackageAllowedToolbarContributionGroups(definition), group);

export const selectModPackageAllowsPanelSlot = (
  definition: ModPackageDefinition | null | undefined,
  slot: string
): boolean => allowsValueWhenDefined(selectModPackageAllowedPanelSlots(definition), slot);

export const selectActiveModPackageAllowsToolbarContributionGroup = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  group: string
): boolean =>
  allowsValueWhenDefined(
    selectActiveModPackageAllowedToolbarContributionGroups(definitions, activePackageId),
    group
  );

export const selectActiveModPackageAllowsPanelSlot = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  slot: string
): boolean =>
  allowsValueWhenDefined(selectActiveModPackageAllowedPanelSlots(definitions, activePackageId), slot);
