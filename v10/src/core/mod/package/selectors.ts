import type { ModId } from "@core/mod/contracts";
import {
  MOD_PACKAGE_TOOLBAR_MODES,
  type ModPackageDefinition,
  type ModPackageId,
  type ModPackageToolbarMode,
} from "./types";

// Transitional compatibility policy centralized in package selectors.
// Toolbar mode mapping must not be redefined in feature-layer code.
const COMPAT_TOOLBAR_MODE_TO_MOD_ID: Readonly<
  Record<ModPackageToolbarMode, ModId>
> = {
  draw: "draw",
  playback: "lecture",
  canvas: "canvas",
};

const COMPAT_MOD_ID_TO_TOOLBAR_MODE: Readonly<
  Record<string, ModPackageToolbarMode>
> = {
  draw: "draw",
  lecture: "playback",
  playback: "playback",
  canvas: "canvas",
};

const comparePackIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

export const compareModPackageDefinitions = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => {
  const defaultEnabledDelta = Number(Boolean(right.defaultEnabled)) - Number(Boolean(left.defaultEnabled));
  if (defaultEnabledDelta !== 0) {
    return defaultEnabledDelta;
  }
  return comparePackIds(left.packId, right.packId);
};

export const listModPackagesDeterministically = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition[] => [...definitions].sort(compareModPackageDefinitions);

export const selectModPackageById = (
  definitions: readonly ModPackageDefinition[],
  packId: ModPackageId | null | undefined
): ModPackageDefinition | null => {
  if (!packId) return null;
  return definitions.find((definition) => definition.packId === packId) ?? null;
};

export const selectPrimaryModPackage = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition | null => {
  const ordered = listModPackagesDeterministically(definitions);
  return ordered[0] ?? null;
};

export const selectActiveModPackage = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageDefinition | null => {
  const activeDefinition = selectModPackageById(definitions, activePackageId);
  return activeDefinition ?? selectPrimaryModPackage(definitions);
};

export type ActiveModPackageResolution = {
  requestedPackageId: ModPackageId | null;
  resolvedPackageId: ModPackageId | null;
  fallbackToPrimary: boolean;
};

const normalizeModPackageIds = (
  packIds: readonly ModPackageId[] | undefined
): ModPackageId[] => {
  const values = new Set<ModPackageId>();
  for (const packId of packIds ?? []) {
    const normalized = packId.trim();
    if (normalized.length === 0) continue;
    values.add(normalized);
  }
  return [...values].sort(comparePackIds);
};

export const selectActiveModPackageResolution = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ActiveModPackageResolution => {
  const requestedPackageId = activePackageId ?? null;
  const explicitActivePackage = selectModPackageById(definitions, requestedPackageId);
  const resolvedActivePackage =
    explicitActivePackage ?? selectPrimaryModPackage(definitions);
  return {
    requestedPackageId,
    resolvedPackageId: resolvedActivePackage?.packId ?? null,
    fallbackToPrimary:
      resolvedActivePackage !== null && explicitActivePackage === null,
  };
};

export const selectModPackageConflictIds = (
  definition: ModPackageDefinition | null | undefined
): ModPackageId[] => normalizeModPackageIds(definition?.conflicts);

export type ActiveModPackageConflictSummary = {
  declaredConflictIds: ModPackageId[];
  reverseConflictIds: ModPackageId[];
  registeredConflictIds: ModPackageId[];
  missingConflictIds: ModPackageId[];
};

export const selectActiveModPackageConflictSummary = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ActiveModPackageConflictSummary => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  if (!activeDefinition) {
    return {
      declaredConflictIds: [],
      reverseConflictIds: [],
      registeredConflictIds: [],
      missingConflictIds: [],
    };
  }

  const activePackId = activeDefinition.packId;
  const declaredConflictIds = selectModPackageConflictIds(activeDefinition).filter(
    (packId) => packId !== activePackId
  );
  const registeredPackIds = new Set(definitions.map((definition) => definition.packId));
  const reverseConflictIds = definitions
    .filter((definition) => definition.packId !== activePackId)
    .filter((definition) =>
      selectModPackageConflictIds(definition).includes(activePackId)
    )
    .map((definition) => definition.packId)
    .sort(comparePackIds);

  const registeredConflictIds = [...new Set<ModPackageId>([
    ...declaredConflictIds.filter((packId) => registeredPackIds.has(packId)),
    ...reverseConflictIds,
  ])].sort(comparePackIds);

  const missingConflictIds = declaredConflictIds
    .filter((packId) => !registeredPackIds.has(packId))
    .sort(comparePackIds);

  return {
    declaredConflictIds,
    reverseConflictIds,
    registeredConflictIds,
    missingConflictIds,
  };
};

export const selectModPackageModIds = (
  definition: ModPackageDefinition | null | undefined
): readonly ModId[] => definition?.modIds ?? [];

export const selectModPackageContainsModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): boolean => {
  if (!definition || !modId) return false;
  return definition.modIds.includes(modId);
};

export const selectActiveModPackageContainsModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): boolean => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageContainsModId(activeDefinition, modId);
};

export const selectModPackageActivationDefaultModId = (
  definition: ModPackageDefinition | null | undefined
): ModId | null => definition?.activation.defaultModId ?? null;

/**
 * @deprecated Use selectModPackageActivationModIdForToolbarMode for canonical behavior.
 */
export const selectModPackageActivationToolbarModeMappedModId = (
  definition: ModPackageDefinition | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  if (!definition) return null;
  return definition.activation.toolbarModeMap?.[toolbarMode] ?? null;
};

export const selectModPackageActivationModIdForToolbarMode = (
  definition: ModPackageDefinition | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const mappedModId =
    definition?.activation.toolbarModeMap?.[toolbarMode] ?? null;
  if (mappedModId) return mappedModId;
  return COMPAT_TOOLBAR_MODE_TO_MOD_ID[toolbarMode] ?? null;
};

export const selectActiveModPackageActivationModIdForToolbarMode = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageActivationModIdForToolbarMode(
    activeDefinition,
    toolbarMode
  );
};

/**
 * @deprecated Use selectActiveModPackageActivationModIdForToolbarMode for canonical behavior.
 */
export const selectActiveModPackageActivationToolbarModeMappedModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageActivationToolbarModeMappedModId(
    activeDefinition,
    toolbarMode
  );
};

export const selectModPackageToolbarModeForActivationModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarMode | null => {
  if (!modId) return null;

  if (definition) {
    for (const toolbarMode of MOD_PACKAGE_TOOLBAR_MODES) {
      if (definition.activation.toolbarModeMap?.[toolbarMode] === modId) {
        return toolbarMode;
      }
    }
  }

  const compatToolbarMode = COMPAT_MOD_ID_TO_TOOLBAR_MODE[modId];
  if (compatToolbarMode) {
    return compatToolbarMode;
  }
  return null;
};

export const selectActiveModPackageToolbarModeForActivationModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarMode | null => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageToolbarModeForActivationModId(activeDefinition, modId);
};

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
