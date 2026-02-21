import {
  listRuntimeModPackages,
  selectActiveModPackageActivationModIdForToolbarMode,
  selectActiveModPackageActivationToolbarModeMappedModId,
  selectActiveModPackageToolbarModeForActivationModId,
  type ModPackageDefinition,
  type ModPackageId,
} from "@core/runtime/modding/package";
import type { ModId } from "@core/runtime/modding/api";
import { DEFAULT_ACTIVE_MOD_ID } from "@features/platform/store/useModStore";

export type ToolbarMod = "draw" | "playback" | "canvas";
export type ToolbarMode = ToolbarMod;
export type ToolbarModeActivationContext = {
  activePackageId?: ModPackageId | null;
  packageDefinitions?: readonly ModPackageDefinition[];
};

export const DEFAULT_TOOLBAR_MODE: ToolbarMode = "draw";

const resolvePackageDefinitions = (
  activationContext: ToolbarModeActivationContext
): readonly ModPackageDefinition[] =>
  activationContext.packageDefinitions ?? listRuntimeModPackages();

export const resolveActiveModIdFromToolbarMode = (
  mode: ToolbarMode,
  activationContext: ToolbarModeActivationContext = {}
): ModId => {
  const packageDefinitions = resolvePackageDefinitions(activationContext);
  const mappedActivationPolicyModId =
    selectActiveModPackageActivationToolbarModeMappedModId(
      packageDefinitions,
      activationContext.activePackageId,
      mode
    );
  if (mappedActivationPolicyModId) {
    return mappedActivationPolicyModId;
  }
  const activationPolicyModId =
    selectActiveModPackageActivationModIdForToolbarMode(
      packageDefinitions,
      activationContext.activePackageId,
      mode
    );
  if (activationPolicyModId) {
    return activationPolicyModId;
  }
  return DEFAULT_ACTIVE_MOD_ID;
};

export const resolveToolbarModeFromActiveModId = (
  activeModId: ModId | null | undefined,
  activationContext: ToolbarModeActivationContext = {}
): ToolbarMode => {
  if (!activeModId) return DEFAULT_TOOLBAR_MODE;
  const packageDefinitions = resolvePackageDefinitions(activationContext);
  const activationPolicyMode = selectActiveModPackageToolbarModeForActivationModId(
    packageDefinitions,
    activationContext.activePackageId,
    activeModId
  );
  if (activationPolicyMode) {
    return activationPolicyMode;
  }
  const resolvedDefaultMode = selectActiveModPackageToolbarModeForActivationModId(
    packageDefinitions,
    activationContext.activePackageId,
    DEFAULT_ACTIVE_MOD_ID
  );
  if (resolvedDefaultMode) {
    return resolvedDefaultMode;
  }
  return DEFAULT_TOOLBAR_MODE;
};

export type ToolbarRenderPolicy = {
  cutoverEnabled: boolean;
  showDrawCoreTools: boolean;
  showBreakActions: boolean;
  showPlaybackExtras: boolean;
};

export const isCoreToolbarCutoverEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";

export const resolveToolbarRenderPolicy = (
  mode: ToolbarMode,
  cutoverEnabled = isCoreToolbarCutoverEnabled()
): ToolbarRenderPolicy => {
  const isDrawMode = mode === "draw";
  const isPlaybackMode = mode === "playback";

  return {
    cutoverEnabled,
    // Draw core tools should always be reachable regardless of cutover state.
    showDrawCoreTools: isDrawMode,
    // Transitional break controls still follow fallback gating until declarative parity lands.
    showBreakActions: isDrawMode && !cutoverEnabled,
    // Heavy playback/page widgets remain fallback-gated to avoid toolbar overload.
    showPlaybackExtras: isPlaybackMode && !cutoverEnabled,
  };
};
