import type { ModId } from "@core/runtime/modding/api";
import {
  MOD_RESOURCE_LAYER_LOAD_ORDER,
  MOD_PACKAGE_TOOLBAR_MODES,
  type ModPackageActivationModIdResolution,
  type ModPackageJsonObject,
  type ModPackageJsonValue,
  type ModPackageCommandRule,
  type ModPackageDefinition,
  type ModPackageId,
  type ModPackageInputBehaviorRule,
  type ModPackageShortcutRule,
  type ModPackageToolbarMode,
  type ModPackageToolbarModeResolution,
  type ModPackageUIItemRule,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
  type ResolvedToolbarPlan,
  type ResolvedToolbarPlanInput,
  type ToolbarBaseActionCatalogEntry,
  type ToolbarBaseActionSurface,
  type ToolbarBaseActionSurfaceRule,
  type ToolbarBaseModeDefinition,
  type ToolbarBaseProvider,
} from "./types";
import {
  getRuntimeModResourceLayerOverrides,
  getRuntimeToolbarBaseProvider,
} from "./registry";
import {
  LEGACY_MOD_ID_TO_TOOLBAR_MODE_ALIAS_FALLBACK_SOURCE,
  LEGACY_TOOLBAR_MODE_TO_MOD_ID_ALIAS_FALLBACK_SOURCE,
  selectLegacyAliasModIdForToolbarMode,
  selectLegacyAliasToolbarModeForModId,
} from "./legacyAlias";

const EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([]);
const EMPTY_TOOLBAR_BASE_ACTION_CATALOG: readonly ToolbarBaseActionCatalogEntry[] =
  Object.freeze([]);
const EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES: readonly ToolbarBaseActionSurfaceRule[] =
  Object.freeze([]);
const DEFAULT_TOOLBAR_MODE: ModPackageToolbarMode = "draw";
const DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID: ModId = "draw";
const COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS: readonly ToolbarBaseModeDefinition[] =
  Object.freeze([
    { id: "draw", label: "Draw", fallbackModId: "draw" },
    { id: "playback", label: "Playback", fallbackModId: "lecture" },
    { id: "canvas", label: "Canvas", fallbackModId: "canvas" },
  ]);

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

export const selectModPackageActivationModIdForToolbarMode = (
  definition: ModPackageDefinition | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const resolution = selectModPackageActivationModIdResolutionForToolbarMode(
    definition,
    toolbarMode
  );
  return resolution.modId;
};

export const selectModPackageActivationModIdResolutionForToolbarMode = (
  definition: ModPackageDefinition | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModPackageActivationModIdResolution => {
  const mappedModId =
    definition?.activation.toolbarModeMap?.[toolbarMode] ?? null;
  if (mappedModId) {
    return {
      modId: mappedModId,
      source: "package-map",
      aliasFallbackSource: null,
    };
  }

  const fallbackModId = selectLegacyAliasModIdForToolbarMode(toolbarMode);
  if (fallbackModId) {
    return {
      modId: fallbackModId,
      source: "legacy-alias-fallback",
      aliasFallbackSource: LEGACY_TOOLBAR_MODE_TO_MOD_ID_ALIAS_FALLBACK_SOURCE,
    };
  }

  return {
    modId: null,
    source: "none",
    aliasFallbackSource: null,
  };
};

export const selectActiveModPackageActivationModIdForToolbarMode = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModId | null => {
  const resolution =
    selectActiveModPackageActivationModIdResolutionForToolbarMode(
      definitions,
      activePackageId,
      toolbarMode
    );
  return resolution.modId;
};

export const selectActiveModPackageActivationModIdResolutionForToolbarMode = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  toolbarMode: ModPackageToolbarMode
): ModPackageActivationModIdResolution => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageActivationModIdResolutionForToolbarMode(
    activeDefinition,
    toolbarMode
  );
};

export const selectModPackageToolbarModeForActivationModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarMode | null => {
  const resolution = selectModPackageToolbarModeResolutionForActivationModId(
    definition,
    modId
  );
  return resolution.toolbarMode;
};

export const selectModPackageToolbarModeResolutionForActivationModId = (
  definition: ModPackageDefinition | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarModeResolution => {
  if (!modId) {
    return {
      toolbarMode: null,
      source: "none",
      aliasFallbackSource: null,
    };
  }

  if (definition) {
    for (const toolbarMode of MOD_PACKAGE_TOOLBAR_MODES) {
      if (definition.activation.toolbarModeMap?.[toolbarMode] === modId) {
        return {
          toolbarMode,
          source: "package-map",
          aliasFallbackSource: null,
        };
      }
    }
  }

  const compatToolbarMode = selectLegacyAliasToolbarModeForModId(modId);
  if (compatToolbarMode) {
    return {
      toolbarMode: compatToolbarMode,
      source: "legacy-alias-fallback",
      aliasFallbackSource: LEGACY_MOD_ID_TO_TOOLBAR_MODE_ALIAS_FALLBACK_SOURCE,
    };
  }
  return {
    toolbarMode: null,
    source: "none",
    aliasFallbackSource: null,
  };
};

export const selectActiveModPackageToolbarModeForActivationModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarMode | null => {
  const resolution =
    selectActiveModPackageToolbarModeResolutionForActivationModId(
      definitions,
      activePackageId,
      modId
    );
  return resolution.toolbarMode;
};

export const selectActiveModPackageToolbarModeResolutionForActivationModId = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  modId: ModId | null | undefined
): ModPackageToolbarModeResolution => {
  const activeDefinition = selectActiveModPackage(definitions, activePackageId);
  return selectModPackageToolbarModeResolutionForActivationModId(
    activeDefinition,
    modId
  );
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

export const selectResolvedToolbarPlan = (
  plan: ResolvedToolbarPlan
): ResolvedToolbarPlan => plan;

export const selectToolbarBaseProvider = (): ToolbarBaseProvider | null =>
  getRuntimeToolbarBaseProvider();

export const selectToolbarBaseModeDefinitions = (): readonly ToolbarBaseModeDefinition[] =>
  selectToolbarBaseProvider()?.modeDefinitions ?? EMPTY_TOOLBAR_BASE_MODE_DEFINITIONS;

export const selectToolbarModeDefinitionsWithCompatFallback = (): readonly ToolbarBaseModeDefinition[] => {
  const definitions = selectToolbarBaseModeDefinitions();
  return definitions.length > 0
    ? definitions
    : COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS;
};

export const selectToolbarFallbackModIdForModeWithCompatFallback = (
  mode: ModPackageToolbarMode
): ModId | null =>
  selectToolbarModeDefinitionsWithCompatFallback().find(
    (definition) => definition.id === mode
  )?.fallbackModId ?? null;

export const selectToolbarDefaultModeWithCompatFallback =
  (): ModPackageToolbarMode =>
    (selectToolbarModeDefinitionsWithCompatFallback()[0]?.id as
      | ModPackageToolbarMode
      | undefined) ?? DEFAULT_TOOLBAR_MODE;

export const selectToolbarDefaultFallbackModIdWithCompatFallback =
  (): ModId =>
    selectToolbarFallbackModIdForModeWithCompatFallback(
      selectToolbarDefaultModeWithCompatFallback()
    ) ?? DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID;

export const selectRuntimeToolbarCutoverEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";

export const selectToolbarBaseActionCatalog = (): readonly ToolbarBaseActionCatalogEntry[] =>
  selectToolbarBaseProvider()?.actionCatalog ?? EMPTY_TOOLBAR_BASE_ACTION_CATALOG;

export const selectToolbarBaseActionSurfaceRules = (): readonly ToolbarBaseActionSurfaceRule[] =>
  selectToolbarBaseProvider()?.actionSurfaceRules ??
  EMPTY_TOOLBAR_BASE_ACTION_SURFACE_RULES;

export const selectResolvedToolbarPlanInputFromBaseProvider = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan | null => {
  const provider = selectToolbarBaseProvider();
  if (!provider) return null;
  return provider.resolvePlan(input);
};

const buildFallbackResolvedToolbarPlan = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan =>
  selectResolvedToolbarPlan({
    mode: input.mode,
    viewport: input.viewport,
    cutoverEnabled: input.cutoverEnabled,
    draw: {
      hand: false,
      pen: false,
      eraser: false,
      laser: false,
      text: false,
      image: false,
      clipboard: false,
      undoRedo: false,
      breakActions: false,
    },
    playback: {
      step: false,
      undoRedo: false,
      sound: false,
      extras: false,
    },
    canvas: {
      fullscreen: false,
      sound: false,
    },
    morePanel: {
      step: false,
      history: false,
    },
  });

export const selectResolvedToolbarPlanInputFromRuntimeResolver = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan =>
  selectResolvedToolbarPlanInputFromBaseProvider(input) ??
  buildFallbackResolvedToolbarPlan(input);

export type ToolbarSurfaceRuleMergeResult = {
  map: Map<string, ToolbarBaseActionSurface>;
  diagnostics: ModResourceMergeDiagnostic[];
};

const buildToolbarSurfaceMapKey = (
  mode: ResolvedToolbarPlanInput["mode"],
  viewport: ResolvedToolbarPlanInput["viewport"],
  actionId: string
): string => `${mode}:${viewport}:${actionId}`;

const toToolbarSurfaceMergeItems = (
  rules: readonly ToolbarBaseActionSurfaceRule[]
) =>
  [...rules]
    .reverse()
    .map((rule) => ({
      slotId: `${rule.mode}:${rule.viewport}`,
      itemId: rule.actionId,
      value: rule,
    }));

const resolveToolbarSurfaceFromMap = (
  map: ReadonlyMap<string, ToolbarBaseActionSurface>,
  mode: ResolvedToolbarPlanInput["mode"],
  viewport: ResolvedToolbarPlanInput["viewport"],
  actionId: string
): ToolbarBaseActionSurface =>
  map.get(buildToolbarSurfaceMapKey(mode, viewport, actionId)) ?? "hidden";

export const mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder = (
  baseRules: readonly ToolbarBaseActionSurfaceRule[],
  packageRules: readonly ToolbarBaseActionSurfaceRule[] = []
): ToolbarSurfaceRuleMergeResult => {
  const modOverrides =
    selectRuntimeModResourceOverridesForLayer("mod")?.toolbarSurfaceRules ?? [];
  const userOverrides =
    selectRuntimeModResourceOverridesForLayer("user")?.toolbarSurfaceRules ?? [];

  const merged = mergeUIItemsByResourceLayerLoadOrder({
    base: toToolbarSurfaceMergeItems(baseRules),
    package: toToolbarSurfaceMergeItems(packageRules),
    mod: toToolbarSurfaceMergeItems(modOverrides),
    user: toToolbarSurfaceMergeItems(userOverrides),
  });

  const map = new Map<string, ToolbarBaseActionSurface>();
  for (const entry of merged.items) {
    const rule = entry.value;
    map.set(
      buildToolbarSurfaceMapKey(rule.mode, rule.viewport, rule.actionId),
      rule.surface
    );
  }

  return {
    map,
    diagnostics: merged.diagnostics,
  };
};

export const resolveToolbarPlanFromActionSurfaceRules = (
  { mode, viewport, cutoverEnabled }: ResolvedToolbarPlanInput,
  baseRules: readonly ToolbarBaseActionSurfaceRule[],
  packageRules: readonly ToolbarBaseActionSurfaceRule[] = []
): ResolvedToolbarPlan => {
  const { map } = mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder(
    baseRules,
    packageRules
  );
  const isPrimary = (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) =>
    resolveToolbarSurfaceFromMap(map, candidateMode, viewport, actionId) ===
    "primary";
  const isMore = (candidateMode: ResolvedToolbarPlanInput["mode"], actionId: string) =>
    resolveToolbarSurfaceFromMap(map, candidateMode, viewport, actionId) ===
    "more";

  return selectResolvedToolbarPlan({
    mode,
    viewport,
    cutoverEnabled,
    draw: {
      hand: isPrimary("draw", "draw.hand"),
      pen: isPrimary("draw", "draw.pen"),
      eraser: isPrimary("draw", "draw.eraser"),
      laser: isPrimary("draw", "draw.laser"),
      text: isPrimary("draw", "draw.text"),
      image: isPrimary("draw", "draw.image"),
      clipboard: isPrimary("draw", "draw.clipboard"),
      undoRedo: isPrimary("draw", "draw.undo") && isPrimary("draw", "draw.redo"),
      breakActions:
        !cutoverEnabled &&
        isMore("draw", "draw.break.line") &&
        isMore("draw", "draw.break.column") &&
        isMore("draw", "draw.break.page"),
    },
    playback: {
      step:
        isPrimary("playback", "playback.step.prev") &&
        isPrimary("playback", "playback.step.next"),
      undoRedo:
        isPrimary("playback", "playback.undo") &&
        isPrimary("playback", "playback.redo"),
      sound: isPrimary("playback", "playback.sound.toggle"),
      extras:
        !cutoverEnabled && isPrimary("playback", "playback.extras"),
    },
    canvas: {
      fullscreen: isPrimary("canvas", "canvas.fullscreen.toggle"),
      sound: isPrimary("canvas", "canvas.sound.toggle"),
    },
    morePanel: {
      step:
        isMore(mode, "more.step.prev") && isMore(mode, "more.step.next"),
      history:
        mode === "playback"
          ? isMore("playback", "playback.undo") &&
            isMore("playback", "playback.redo")
          : isMore("draw", "draw.undo") && isMore("draw", "draw.redo"),
    },
  });
};

export type ModResourcePolicyLayers = Partial<
  Record<ModResourceLayer, ModPackageJsonObject | null | undefined>
>;

export type ModResourcePolicyMergeResult = {
  policy: ModPackageJsonObject;
  diagnostics: ModResourceMergeDiagnostic[];
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneJsonValue = (value: ModPackageJsonValue): ModPackageJsonValue => {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneJsonValue(entry)) as ModPackageJsonValue;
  }
  if (isPlainRecord(value)) {
    return cloneJsonObject(value as ModPackageJsonObject);
  }
  return value;
};

const cloneJsonObject = (value: ModPackageJsonObject): ModPackageJsonObject => {
  const cloned: ModPackageJsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    cloned[key] = cloneJsonValue(entry);
  }
  return cloned;
};

const applyJsonMergePatchObject = (
  baseValue: ModPackageJsonObject,
  patchValue: ModPackageJsonObject
): ModPackageJsonObject => {
  const next = cloneJsonObject(baseValue);
  for (const [key, patchEntry] of Object.entries(patchValue)) {
    if (patchEntry === null) {
      delete next[key];
      continue;
    }
    if (Array.isArray(patchEntry)) {
      next[key] = patchEntry.map((entry) => cloneJsonValue(entry));
      continue;
    }
    if (isPlainRecord(patchEntry)) {
      const existing = next[key];
      const existingObject = isPlainRecord(existing)
        ? (existing as ModPackageJsonObject)
        : {};
      next[key] = applyJsonMergePatchObject(
        existingObject,
        patchEntry as ModPackageJsonObject
      );
      continue;
    }
    next[key] = patchEntry;
  }
  return next;
};

export const mergePolicyByResourceLayerLoadOrder = (
  layers: ModResourcePolicyLayers
): ModResourcePolicyMergeResult => {
  let policy: ModPackageJsonObject = {};
  let lastAppliedLayer: ModResourceLayer | null = null;
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const patch = layers[layer];
    if (!patch) continue;
    const patchKeys = Object.keys(patch);
    if (patchKeys.length === 0) continue;

    if (lastAppliedLayer && lastAppliedLayer !== layer) {
      diagnostics.push({
        kind: "loser",
        resourceType: "policy",
        key: "*",
        source: lastAppliedLayer,
        againstSource: layer,
        reason: "policy patch superseded by higher precedence layer.",
      });
    }
    diagnostics.push({
      kind: "winner",
      resourceType: "policy",
      key: "*",
      source: layer,
      againstSource: lastAppliedLayer ?? undefined,
      reason: "policy json merge patch applied.",
    });
    policy = applyJsonMergePatchObject(policy, patch);
    lastAppliedLayer = layer;
  }

  return { policy, diagnostics };
};

export type ModResourceUIItem<TValue> = {
  slotId: string;
  itemId: string;
  operation?: ModPackageUIItemRule["operation"];
  value: TValue;
};

export type ResolvedModResourceUIItem<TValue> = ModResourceUIItem<TValue> & {
  source: ModResourceLayer;
};

export type ModResourceUIItemLayers<TValue> = Partial<
  Record<ModResourceLayer, readonly ModResourceUIItem<TValue>[]>
>;

export type ModResourceUIItemMergeResult<TValue> = {
  items: ResolvedModResourceUIItem<TValue>[];
  diagnostics: ModResourceMergeDiagnostic[];
};

const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const buildUIItemMergeKey = (slotId: string, itemId: string): string =>
  `${slotId}::${itemId}`;

const dedupeUIItemsWithinLayer = <TValue>(
  items: readonly ModResourceUIItem<TValue>[]
): ModResourceUIItem<TValue>[] => {
  const deduped: ModResourceUIItem<TValue>[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const key = buildUIItemMergeKey(
      normalizeLayerString(item.slotId),
      normalizeLayerString(item.itemId)
    );
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
};

export const mergeUIItemsByResourceLayerLoadOrder = <TValue>(
  layers: ModResourceUIItemLayers<TValue>
): ModResourceUIItemMergeResult<TValue> => {
  const merged = new Map<string, ResolvedModResourceUIItem<TValue>>();
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const rawItems = layers[layer];
    if (!rawItems || rawItems.length === 0) continue;
    const layerItems = dedupeUIItemsWithinLayer(rawItems);

    for (const item of layerItems) {
      const slotId = normalizeLayerString(item.slotId);
      const itemId = normalizeLayerString(item.itemId);
      if (slotId.length === 0 || itemId.length === 0) {
        diagnostics.push({
          kind: "blocked",
          resourceType: "ui-item",
          key: buildUIItemMergeKey(slotId, itemId),
          source: layer,
          reason: "ui item merge ignored because slotId/itemId is empty.",
        });
        continue;
      }

      const key = buildUIItemMergeKey(slotId, itemId);
      const operation = item.operation ?? "add";
      const existing = merged.get(key);

      if (operation === "remove") {
        if (!existing) {
          diagnostics.push({
            kind: "blocked",
            resourceType: "ui-item",
            key,
            source: layer,
            reason: "remove ignored because target ui item does not exist.",
          });
          continue;
        }
        merged.delete(key);
        diagnostics.push({
          kind: "loser",
          resourceType: "ui-item",
          key,
          source: existing.source,
          againstSource: layer,
          reason: "ui item removed by higher precedence layer.",
        });
        diagnostics.push({
          kind: "blocked",
          resourceType: "ui-item",
          key,
          source: layer,
          againstSource: existing.source,
          reason: "ui item removed.",
        });
        continue;
      }

      if (existing) {
        diagnostics.push({
          kind: "loser",
          resourceType: "ui-item",
          key,
          source: existing.source,
          againstSource: layer,
          reason: "ui item superseded by higher precedence layer.",
        });
        diagnostics.push({
          kind: "winner",
          resourceType: "ui-item",
          key,
          source: layer,
          againstSource: existing.source,
          reason: "ui item override applied.",
        });
      }

      merged.set(key, {
        slotId,
        itemId,
        operation,
        value: item.value,
        source: layer,
      });
    }
  }

  return {
    items: [...merged.values()],
    diagnostics,
  };
};

export type ResolvedModResourceCommandRule = ModPackageCommandRule & {
  source: ModResourceLayer;
};

export type ModResourceCommandLayers = Partial<
  Record<ModResourceLayer, readonly ModPackageCommandRule[]>
>;

export type ModResourceCommandMergeResult = {
  commands: ResolvedModResourceCommandRule[];
  diagnostics: ModResourceMergeDiagnostic[];
  blockedCommandIds: string[];
};

const dedupeCommandRulesWithinLayer = (
  rules: readonly ModPackageCommandRule[]
): ModPackageCommandRule[] => {
  const deduped: ModPackageCommandRule[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    const commandId = normalizeLayerString(rule.commandId);
    if (commandId.length === 0 || seen.has(commandId)) continue;
    seen.add(commandId);
    deduped.push({
      ...rule,
      commandId,
    });
  }
  return deduped;
};

export const mergeCommandsByResourceLayerLoadOrder = (
  layers: ModResourceCommandLayers
): ModResourceCommandMergeResult => {
  const merged = new Map<string, ResolvedModResourceCommandRule>();
  const diagnostics: ModResourceMergeDiagnostic[] = [];
  const blockedCommandIds = new Set<string>();

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerRules = layers[layer];
    if (!layerRules || layerRules.length === 0) continue;
    for (const rule of dedupeCommandRulesWithinLayer(layerRules)) {
      const commandId = rule.commandId;
      const operation = rule.operation ?? "upsert";
      const existing = merged.get(commandId);

      if (operation === "remove") {
        if (!existing) {
          diagnostics.push({
            kind: "blocked",
            resourceType: "command",
            key: commandId,
            source: layer,
            reason: "remove ignored because command does not exist.",
          });
          continue;
        }
        merged.delete(commandId);
        diagnostics.push({
          kind: "loser",
          resourceType: "command",
          key: commandId,
          source: existing.source,
          againstSource: layer,
          reason: "command removed by higher precedence layer.",
        });
        diagnostics.push({
          kind: "blocked",
          resourceType: "command",
          key: commandId,
          source: layer,
          againstSource: existing.source,
          reason: "command removed.",
        });
        continue;
      }

      if (!existing) {
        merged.set(commandId, {
          ...rule,
          commandId,
          source: layer,
        });
        continue;
      }

      if (rule.overrideAllowed !== true) {
        blockedCommandIds.add(commandId);
        diagnostics.push({
          kind: "blocked",
          resourceType: "command",
          key: commandId,
          source: layer,
          againstSource: existing.source,
          reason:
            "command conflict blocked. set overrideAllowed=true to replace the winner.",
        });
        continue;
      }

      diagnostics.push({
        kind: "loser",
        resourceType: "command",
        key: commandId,
        source: existing.source,
        againstSource: layer,
        reason: "command overridden by higher precedence layer with overrideAllowed.",
      });
      diagnostics.push({
        kind: "winner",
        resourceType: "command",
        key: commandId,
        source: layer,
        againstSource: existing.source,
        reason: "command override applied (overrideAllowed=true).",
      });
      merged.set(commandId, {
        ...rule,
        commandId,
        source: layer,
      });
    }
  }

  return {
    commands: [...merged.values()],
    diagnostics,
    blockedCommandIds: [...blockedCommandIds].sort((left, right) =>
      left.localeCompare(right)
    ),
  };
};

export type ResolvedModResourceShortcutRule = ModPackageShortcutRule & {
  mergeKey: string;
  source: ModResourceLayer;
};

export type ModResourceShortcutLayers = Partial<
  Record<ModResourceLayer, readonly ModPackageShortcutRule[]>
>;

export type ModResourceShortcutMergeResult = {
  shortcuts: ResolvedModResourceShortcutRule[];
  diagnostics: ModResourceMergeDiagnostic[];
};

const normalizeShortcutMergeKey = (
  shortcut: string,
  when: string | undefined
): string => {
  const normalizedShortcut = normalizeLayerString(shortcut).toLowerCase();
  const normalizedWhen = normalizeLayerString(when ?? "*").toLowerCase();
  return `${normalizedShortcut}::${normalizedWhen}`;
};

const dedupeShortcutsWithinLayer = (
  shortcuts: readonly ModPackageShortcutRule[]
): ModPackageShortcutRule[] => {
  const deduped: ModPackageShortcutRule[] = [];
  const seen = new Set<string>();
  for (const shortcut of shortcuts) {
    const key = normalizeShortcutMergeKey(shortcut.shortcut, shortcut.when);
    if (key.startsWith("::")) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      ...shortcut,
      shortcut: normalizeLayerString(shortcut.shortcut),
      commandId: normalizeLayerString(shortcut.commandId),
      ...(shortcut.when ? { when: normalizeLayerString(shortcut.when) } : {}),
    });
  }
  return deduped;
};

export const mergeShortcutsByResourceLayerLoadOrder = (
  layers: ModResourceShortcutLayers
): ModResourceShortcutMergeResult => {
  const merged = new Map<string, ResolvedModResourceShortcutRule>();
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerShortcuts = layers[layer];
    if (!layerShortcuts || layerShortcuts.length === 0) continue;
    for (const shortcut of dedupeShortcutsWithinLayer(layerShortcuts)) {
      const mergeKey = normalizeShortcutMergeKey(shortcut.shortcut, shortcut.when);
      const operation = shortcut.operation ?? "upsert";
      const existing = merged.get(mergeKey);

      if (operation === "remove") {
        if (!existing) {
          diagnostics.push({
            kind: "blocked",
            resourceType: "shortcut",
            key: mergeKey,
            source: layer,
            reason: "remove ignored because shortcut does not exist.",
          });
          continue;
        }
        merged.delete(mergeKey);
        diagnostics.push({
          kind: "loser",
          resourceType: "shortcut",
          key: mergeKey,
          source: existing.source,
          againstSource: layer,
          reason: "shortcut removed by higher precedence layer.",
        });
        diagnostics.push({
          kind: "blocked",
          resourceType: "shortcut",
          key: mergeKey,
          source: layer,
          againstSource: existing.source,
          reason: "shortcut removed.",
        });
        continue;
      }

      if (existing) {
        diagnostics.push({
          kind: "loser",
          resourceType: "shortcut",
          key: mergeKey,
          source: existing.source,
          againstSource: layer,
          reason: "shortcut conflict loser.",
        });
        diagnostics.push({
          kind: "winner",
          resourceType: "shortcut",
          key: mergeKey,
          source: layer,
          againstSource: existing.source,
          reason: "shortcut conflict winner.",
        });
      }

      merged.set(mergeKey, {
        ...shortcut,
        mergeKey,
        source: layer,
      });
    }
  }

  return {
    shortcuts: [...merged.values()],
    diagnostics,
  };
};

export type ResolvedModResourceInputBehaviorRule = ModPackageInputBehaviorRule & {
  source: ModResourceLayer;
};

export type ModResourceInputBehaviorLayers = Partial<
  Record<ModResourceLayer, ModPackageInputBehaviorRule | null | undefined>
>;

export type ModResourceInputBehaviorMergeResult = {
  inputBehavior: ResolvedModResourceInputBehaviorRule;
  diagnostics: ModResourceMergeDiagnostic[];
};

export const DEFAULT_INPUT_BEHAVIOR_RULE: ModPackageInputBehaviorRule = Object.freeze({
  strategy: "exclusive",
});

const normalizeInputBehaviorRule = (
  rule: ModPackageInputBehaviorRule
): ModPackageInputBehaviorRule => {
  if (rule.strategy === "exclusive") {
    return {
      strategy: "exclusive",
      ...(rule.modId ? { modId: normalizeLayerString(rule.modId) } : {}),
    };
  }
  const chain = [...new Set((rule.chain ?? []).map((entry) => normalizeLayerString(entry)).filter((entry) => entry.length > 0))];
  return {
    strategy: "handled-pass-chain",
    ...(rule.modId ? { modId: normalizeLayerString(rule.modId) } : {}),
    chain,
  };
};

export const mergeInputBehaviorByResourceLayerLoadOrder = (
  layers: ModResourceInputBehaviorLayers
): ModResourceInputBehaviorMergeResult => {
  let resolved: ResolvedModResourceInputBehaviorRule = {
    ...DEFAULT_INPUT_BEHAVIOR_RULE,
    source: "base",
  };
  let hasExplicitRule = false;
  const diagnostics: ModResourceMergeDiagnostic[] = [];

  for (const layer of MOD_RESOURCE_LAYER_LOAD_ORDER) {
    const layerRule = layers[layer];
    if (!layerRule) continue;
    const normalized = normalizeInputBehaviorRule(layerRule);
    if (hasExplicitRule) {
      diagnostics.push({
        kind: "loser",
        resourceType: "input-behavior",
        key: "input-behavior",
        source: resolved.source,
        againstSource: layer,
        reason: "input behavior replaced by higher precedence layer.",
      });
    }
    diagnostics.push({
      kind: "winner",
      resourceType: "input-behavior",
      key: "input-behavior",
      source: layer,
      againstSource: hasExplicitRule ? resolved.source : undefined,
      reason:
        normalized.strategy === "exclusive"
          ? "exclusive input behavior selected."
          : "handled/pass chain input behavior selected.",
    });
    resolved = {
      ...normalized,
      source: layer,
    };
    hasExplicitRule = true;
  }

  return {
    inputBehavior: resolved,
    diagnostics,
  };
};

export const selectModPackageToolbarItemRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageUIItemRule[] => definition?.uiPolicy?.toolbarItems ?? [];

export const selectModPackagePanelItemRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageUIItemRule[] => definition?.uiPolicy?.panelItems ?? [];

export const selectModPackageResourcePolicyPatch = (
  definition: ModPackageDefinition | null | undefined
): ModPackageJsonObject | null => definition?.resourcePolicy?.policyPatch ?? null;

export const selectModPackageResourceCommandRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageCommandRule[] => definition?.resourcePolicy?.commands ?? [];

export const selectModPackageResourceShortcutRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageShortcutRule[] => definition?.resourcePolicy?.shortcuts ?? [];

export const selectModPackageResourceInputBehaviorRule = (
  definition: ModPackageDefinition | null | undefined
): ModPackageInputBehaviorRule | null =>
  definition?.resourcePolicy?.inputBehavior ?? null;

export const selectActiveModPackageToolbarItemRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageUIItemRule[] =>
  selectModPackageToolbarItemRules(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackagePanelItemRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageUIItemRule[] =>
  selectModPackagePanelItemRules(selectActiveModPackage(definitions, activePackageId));

export const selectActiveModPackageResourcePolicyPatch = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageJsonObject | null =>
  selectModPackageResourcePolicyPatch(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackageResourceCommandRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageCommandRule[] =>
  selectModPackageResourceCommandRules(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackageResourceShortcutRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageShortcutRule[] =>
  selectModPackageResourceShortcutRules(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackageResourceInputBehaviorRule = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageInputBehaviorRule | null =>
  selectModPackageResourceInputBehaviorRule(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectRuntimeModResourceOverridesForLayer = (
  layer: "mod" | "user"
) => getRuntimeModResourceLayerOverrides(layer);
