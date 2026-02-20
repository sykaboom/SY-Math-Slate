import type { ModId } from "@core/mod/contracts";

export const MOD_PACKAGE_TOOLBAR_MODES = [
  "draw",
  "playback",
  "canvas",
] as const;

export type ModPackageToolbarMode =
  (typeof MOD_PACKAGE_TOOLBAR_MODES)[number];

export type ModPackageId = string;

export type ModPackageActivationPolicy = {
  toolbarModeMap?: Partial<Record<ModPackageToolbarMode, ModId>>;
  defaultModId: ModId;
};

export type ModPackageUIPolicy = {
  allowToolbarContributionGroups?: readonly string[];
  allowPanelSlots?: readonly string[];
};

export type ModPackageDefinition = {
  packId: ModPackageId;
  version: string;
  label: string;
  modIds: readonly ModId[];
  activation: ModPackageActivationPolicy;
  uiPolicy?: ModPackageUIPolicy;
  dependencies?: readonly ModPackageId[];
  conflicts?: readonly ModPackageId[];
  defaultEnabled?: boolean;
};
