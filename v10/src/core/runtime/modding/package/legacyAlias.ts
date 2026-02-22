import type { ModId } from "@core/runtime/modding/api";
import type {
  ModPackageAliasFallbackSource,
  ModPackageToolbarMode,
} from "./types";

const LEGACY_TOOLBAR_MODE_TO_MOD_ID: Readonly<
  Record<ModPackageToolbarMode, ModId>
> = {
  draw: "draw",
  playback: "lecture",
  canvas: "canvas",
};

const LEGACY_MOD_ID_TO_TOOLBAR_MODE: Readonly<
  Record<string, ModPackageToolbarMode>
> = {
  draw: "draw",
  lecture: "playback",
  playback: "playback",
  canvas: "canvas",
};

export const LEGACY_TOOLBAR_MODE_TO_MOD_ID_ALIAS_FALLBACK_SOURCE: ModPackageAliasFallbackSource =
  "legacy.toolbar-mode-to-mod-id";
export const LEGACY_MOD_ID_TO_TOOLBAR_MODE_ALIAS_FALLBACK_SOURCE: ModPackageAliasFallbackSource =
  "legacy.mod-id-to-toolbar-mode";

export const selectLegacyAliasModIdForToolbarMode = (
  toolbarMode: ModPackageToolbarMode
): ModId | null => LEGACY_TOOLBAR_MODE_TO_MOD_ID[toolbarMode] ?? null;

export const selectLegacyAliasToolbarModeForModId = (
  modId: string
): ModPackageToolbarMode | null => LEGACY_MOD_ID_TO_TOOLBAR_MODE[modId] ?? null;

