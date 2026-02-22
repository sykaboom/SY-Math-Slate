import {
  listRuntimeModPackages,
  selectActiveModPackageActivationModIdResolutionForToolbarMode,
  selectActiveModPackageToolbarModeForActivationModId,
  selectActiveModPackageToolbarModeResolutionForActivationModId,
  selectToolbarDefaultFallbackModIdWithCompatFallback,
  selectToolbarDefaultModeWithCompatFallback,
  selectToolbarFallbackModIdForModeWithCompatFallback,
  selectToolbarModeDefinitionsWithCompatFallback,
  selectRuntimeToolbarCutoverEnabled,
  type ModPackageDefinition,
  type ModPackageId,
  type ToolbarBaseModeDefinition,
} from "@core/runtime/modding/package";
import type { ModId } from "@core/runtime/modding/api";

export type ToolbarMod = "draw" | "playback" | "canvas";
export type ToolbarMode = ToolbarMod;
export type ToolbarModeActivationContext = {
  activePackageId?: ModPackageId | null;
  packageDefinitions?: readonly ModPackageDefinition[];
};

const resolvePackageDefinitions = (
  activationContext: ToolbarModeActivationContext
): readonly ModPackageDefinition[] =>
  activationContext.packageDefinitions ?? listRuntimeModPackages();

const resolveFallbackModIdForMode = (mode: ToolbarMode): ModId | null =>
  selectToolbarFallbackModIdForModeWithCompatFallback(mode);

export const listToolbarModeDefinitions = (): readonly ToolbarBaseModeDefinition[] =>
  selectToolbarModeDefinitionsWithCompatFallback();

export const resolveActiveModIdFromToolbarMode = (
  mode: ToolbarMode,
  activationContext: ToolbarModeActivationContext = {}
): ModId => {
  const packageDefinitions = resolvePackageDefinitions(activationContext);
  const activationPolicyResolution =
    selectActiveModPackageActivationModIdResolutionForToolbarMode(
      packageDefinitions,
      activationContext.activePackageId,
      mode
    );
  if (activationPolicyResolution.modId) {
    return activationPolicyResolution.modId;
  }
  return (
    resolveFallbackModIdForMode(mode) ??
    selectToolbarDefaultFallbackModIdWithCompatFallback()
  );
};

export const resolveToolbarModeFromActiveModId = (
  activeModId: ModId | null | undefined,
  activationContext: ToolbarModeActivationContext = {}
): ToolbarMode => {
  if (!activeModId) return selectToolbarDefaultModeWithCompatFallback();
  const packageDefinitions = resolvePackageDefinitions(activationContext);
  const activationPolicyModeResolution =
    selectActiveModPackageToolbarModeResolutionForActivationModId(
      packageDefinitions,
      activationContext.activePackageId,
      activeModId
    );
  if (activationPolicyModeResolution.toolbarMode) {
    return activationPolicyModeResolution.toolbarMode;
  }
  const fallbackModId = selectToolbarDefaultFallbackModIdWithCompatFallback();
  const resolvedDefaultMode =
    selectActiveModPackageToolbarModeForActivationModId(
      packageDefinitions,
      activationContext.activePackageId,
      fallbackModId
    );
  if (resolvedDefaultMode) {
    return resolvedDefaultMode;
  }
  return selectToolbarDefaultModeWithCompatFallback();
};

export type ToolbarRenderPolicy = {
  cutoverEnabled: boolean;
  showDrawCoreTools: boolean;
  showBreakActions: boolean;
  showPlaybackExtras: boolean;
};

export const resolveToolbarRenderPolicy = (
  mode: ToolbarMode,
  cutoverEnabled = selectRuntimeToolbarCutoverEnabled()
): ToolbarRenderPolicy => {
  const isDrawMode = mode === "draw";
  const isPlaybackMode = mode === "playback";

  return {
    cutoverEnabled,
    showDrawCoreTools: isDrawMode,
    showBreakActions: isDrawMode && !cutoverEnabled,
    showPlaybackExtras: isPlaybackMode && !cutoverEnabled,
  };
};
