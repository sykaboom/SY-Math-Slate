import type { ModId } from "@core/runtime/modding/api";

export const MOD_PACKAGE_TOOLBAR_MODES = [
  "draw",
  "playback",
  "canvas",
] as const;

export type ModPackageToolbarMode =
  (typeof MOD_PACKAGE_TOOLBAR_MODES)[number];

export type ModPackageId = string;

export type ModPackageAliasFallbackSource = never;

export type ModPackageResolutionSource =
  | "package-map"
  | "none";

export type ModPackageActivationModIdResolution = {
  modId: ModId | null;
  source: ModPackageResolutionSource;
  aliasFallbackSource: ModPackageAliasFallbackSource | null;
};

export type ModPackageToolbarModeResolution = {
  toolbarMode: ModPackageToolbarMode | null;
  source: ModPackageResolutionSource;
  aliasFallbackSource: ModPackageAliasFallbackSource | null;
};
