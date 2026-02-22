import {
  listRuntimeModPackages,
  selectActiveModPackage,
  selectActiveModPackageActivationModIdResolutionForToolbarMode,
  selectActiveModPackageToolbarModeForActivationModId,
  selectActiveModPackageToolbarModeResolutionForActivationModId,
  selectToolbarBaseModeDefinitions,
  type ModPackageDefinition,
  type ModPackageId,
  type ToolbarBaseModeDefinition,
} from "@core/runtime/modding/package";
import { emitModAliasFallbackHitAuditEvent } from "@features/platform/observability";
import type { ModId } from "@core/runtime/modding/api";
import { BASE_EDUCATION_TOOLBAR_MODE_DEFINITIONS } from "@/mod/packs/base-education/modules";

export type ToolbarMod = "draw" | "playback" | "canvas";
export type ToolbarMode = ToolbarMod;
export type ToolbarModeActivationContext = {
  activePackageId?: ModPackageId | null;
  packageDefinitions?: readonly ModPackageDefinition[];
};

export const DEFAULT_TOOLBAR_MODE: ToolbarMode = "draw";
const DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID: ModId = "draw";

const COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  BASE_EDUCATION_TOOLBAR_MODE_DEFINITIONS;

const resolvePackageDefinitions = (
  activationContext: ToolbarModeActivationContext
): readonly ModPackageDefinition[] =>
  activationContext.packageDefinitions ?? listRuntimeModPackages();

const resolveToolbarBaseModes = (): readonly ToolbarBaseModeDefinition[] => {
  const providerModes = selectToolbarBaseModeDefinitions();
  return providerModes.length > 0
    ? providerModes
    : COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS;
};

const resolveFallbackModIdForMode = (mode: ToolbarMode): ModId | null =>
  resolveToolbarBaseModes().find((definition) => definition.id === mode)
    ?.fallbackModId ?? null;

const resolveDefaultToolbarMode = (): ToolbarMode =>
  (resolveToolbarBaseModes()[0]?.id as ToolbarMode | undefined) ??
  DEFAULT_TOOLBAR_MODE;

const resolveDefaultToolbarModeFallbackModId = (): ModId =>
  resolveFallbackModIdForMode(resolveDefaultToolbarMode()) ??
  DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID;

export const listToolbarModeDefinitions = (): readonly ToolbarBaseModeDefinition[] =>
  resolveToolbarBaseModes();

export const resolveActiveModIdFromToolbarMode = (
  mode: ToolbarMode,
  activationContext: ToolbarModeActivationContext = {}
): ModId => {
  const packageDefinitions = resolvePackageDefinitions(activationContext);
  const activeDefinition = selectActiveModPackage(
    packageDefinitions,
    activationContext.activePackageId
  );
  const activationPolicyResolution =
    selectActiveModPackageActivationModIdResolutionForToolbarMode(
      packageDefinitions,
      activationContext.activePackageId,
      mode
    );
  if (activationPolicyResolution.modId) {
    if (activationPolicyResolution.source === "legacy-alias-fallback") {
      emitModAliasFallbackHitAuditEvent({
        toolbarMode: mode,
        activePackageId: activeDefinition?.packId ?? null,
        requestedModId: activeDefinition?.activation.toolbarModeMap?.[mode] ?? null,
        fallbackModId: activationPolicyResolution.modId,
        source:
          activationPolicyResolution.aliasFallbackSource ??
          "legacy.toolbar-mode-to-mod-id",
      });
    }
    return activationPolicyResolution.modId;
  }
  return (
    resolveFallbackModIdForMode(mode) ?? resolveDefaultToolbarModeFallbackModId()
  );
};

export const resolveToolbarModeFromActiveModId = (
  activeModId: ModId | null | undefined,
  activationContext: ToolbarModeActivationContext = {}
): ToolbarMode => {
  if (!activeModId) return resolveDefaultToolbarMode();
  const packageDefinitions = resolvePackageDefinitions(activationContext);
  const activeDefinition = selectActiveModPackage(
    packageDefinitions,
    activationContext.activePackageId
  );
  const activationPolicyModeResolution =
    selectActiveModPackageToolbarModeResolutionForActivationModId(
      packageDefinitions,
      activationContext.activePackageId,
      activeModId
    );
  if (activationPolicyModeResolution.toolbarMode) {
    if (activationPolicyModeResolution.source === "legacy-alias-fallback") {
      emitModAliasFallbackHitAuditEvent({
        toolbarMode: activationPolicyModeResolution.toolbarMode,
        activePackageId: activeDefinition?.packId ?? null,
        requestedModId: activeModId,
        fallbackModId: activeModId,
        source:
          activationPolicyModeResolution.aliasFallbackSource ??
          "legacy.mod-id-to-toolbar-mode",
      });
    }
    return activationPolicyModeResolution.toolbarMode;
  }
  const fallbackModId = resolveDefaultToolbarModeFallbackModId();
  const resolvedDefaultMode =
    selectActiveModPackageToolbarModeForActivationModId(
      packageDefinitions,
      activationContext.activePackageId,
      fallbackModId
    );
  if (resolvedDefaultMode) {
    return resolvedDefaultMode;
  }
  return resolveDefaultToolbarMode();
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
