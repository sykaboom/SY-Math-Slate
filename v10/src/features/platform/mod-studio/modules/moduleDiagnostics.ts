import type { ModuleDraft } from "@features/platform/mod-studio/core/types";
import type { ModDefinition, ModToolbarItem } from "@core/runtime/modding/api";
import {
  mergeCommandsByResourceLayerLoadOrder,
  mergeInputBehaviorByResourceLayerLoadOrder,
  mergeShortcutsByResourceLayerLoadOrder,
  mergeUIItemsByResourceLayerLoadOrder,
  selectActiveModPackage,
  selectActiveModPackageConflictSummary,
  selectActiveModPackageContainsModId,
  selectActiveModPackageResourceCommandRules,
  selectActiveModPackageResourceInputBehaviorRule,
  selectActiveModPackageResourceShortcutRules,
  selectActiveModPackageResolution,
  selectActiveModPackageToolbarItemRules,
  selectModPackageActivationModIdForToolbarMode,
  selectRuntimeModResourceOverridesForLayer,
  type ModPackageDefinition,
  type ModPackageId,
  type ModPackageShortcutRule,
  type ModPackageToolbarMode,
  type ModPackageUIItemRule,
  type ModResourceLayer,
  type ModResourceMergeDiagnostic,
  type ModResourceMergeDiagnosticKind,
  type ModResourceMergeDiagnosticResourceType,
} from "@core/runtime/modding/package";

export type ModuleDiagnostic = {
  level: "error" | "warning";
  code: string;
  message: string;
};

export type RuntimeModOrderEntry = {
  id: string;
  priority: number;
};

export type RuntimeMergeDiagnosticEntry = {
  kind: ModResourceMergeDiagnosticKind;
  resourceType: ModResourceMergeDiagnosticResourceType;
  key: string;
  source: ModResourceLayer;
  againstSource: ModResourceLayer | null;
  reason: string;
};

export type RuntimeToolbarContributionPreview = {
  id: string;
  commandId: string;
  group: string;
  order: number | null;
};

export type RuntimeModDiagnostics = {
  activeModId: string | null;
  requestedActivePackageId: ModPackageId | null;
  resolvedActivePackageId: ModPackageId | null;
  activePackageFallbackToPrimary: boolean;
  activePackageModIds: string[];
  declaredConflictPackageIds: ModPackageId[];
  reverseConflictPackageIds: ModPackageId[];
  conflictPackageIds: ModPackageId[];
  missingConflictPackageIds: ModPackageId[];
  toolbarMode: ModPackageToolbarMode;
  expectedActiveModIdForToolbarMode: string | null;
  orderedMods: RuntimeModOrderEntry[];
  blockedContributionIds: string[];
  blockedCommandIds: string[];
  shortcutConflictKeys: string[];
  mergeDiagnostics: RuntimeMergeDiagnosticEntry[];
  resolvedToolbarContributionOrder: RuntimeToolbarContributionPreview[];
  resolvedInputBehaviorStrategy: "exclusive" | "handled-pass-chain";
  resolvedInputBehaviorSource: ModResourceLayer;
  diagnostics: ModuleDiagnostic[];
};

type RuntimeModDiagnosticsInput = {
  activeModId: string | null;
  activePackageId: ModPackageId | null;
  registeredPackages: readonly ModPackageDefinition[];
  toolbarMode: ModPackageToolbarMode;
  registeredMods: readonly ModDefinition[];
  rawToolbarContributions: readonly ModToolbarItem[];
  resolvedToolbarContributions: readonly ModToolbarItem[];
};

export const getModuleDiagnostics = (
  modules: ModuleDraft[],
  knownCommandIds?: Set<string>
): ModuleDiagnostic[] => {
  const diagnostics: ModuleDiagnostic[] = [];
  const enabled = modules.filter((module) => module.enabled);
  const idSeen = new Set<string>();
  const orderSeen = new Set<number>();

  enabled.forEach((module) => {
    if (knownCommandIds) {
      const commandId = module.action.commandId.trim();
      if (commandId.length === 0) {
        diagnostics.push({
          level: "error",
          code: "empty-command-id",
          message: "commandId is empty.",
        });
      } else if (knownCommandIds.size === 0) {
        diagnostics.push({
          level: "warning",
          code: "command-catalog-empty",
          message: "command catalog is empty. commandId cannot be validated.",
        });
      } else if (!knownCommandIds.has(commandId)) {
        diagnostics.push({
          level: "error",
          code: "unknown-command-id",
          message: `commandId '${commandId}' is not registered in command bus.`,
        });
      }
    }

    const trimmedId = module.id.trim();
    if (trimmedId.length === 0) {
      diagnostics.push({
        level: "error",
        code: "empty-id",
        message: "enabled module has an empty id.",
      });
      return;
    }
    if (idSeen.has(trimmedId)) {
      diagnostics.push({
        level: "error",
        code: "duplicate-id",
        message: `duplicate enabled module id: '${trimmedId}'.`,
      });
    }
    idSeen.add(trimmedId);

    if (orderSeen.has(module.order)) {
      diagnostics.push({
        level: "warning",
        code: "duplicate-order",
        message: `duplicate order value detected: ${module.order}.`,
      });
    }
    orderSeen.add(module.order);
  });

  return diagnostics;
};

const toContributionIdSet = (items: readonly ModToolbarItem[]): Set<string> => {
  const values = new Set<string>();
  for (const item of items) {
    const id = item.id.trim();
    if (id.length === 0) continue;
    values.add(id);
  }
  return values;
};

const collectDuplicateKeys = (
  items: readonly ModToolbarItem[],
  selector: (item: ModToolbarItem) => string
): string[] => {
  const countByKey = new Map<string, number>();
  for (const item of items) {
    const key = selector(item).trim();
    if (key.length === 0) continue;
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
  }
  return [...countByKey.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
    .sort((left, right) => left.localeCompare(right));
};

const hasNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeContributionGroup = (value: string | undefined): string =>
  hasNonEmpty(value) ? value.trim() : "";

const toToolbarContributionFromPolicyRule = (
  rule: ModPackageUIItemRule
): ModToolbarItem => ({
  id: rule.itemId.trim(),
  commandId: hasNonEmpty(rule.commandId) ? rule.commandId.trim() : "",
  label: hasNonEmpty(rule.label) ? rule.label.trim() : rule.itemId.trim(),
  ...(hasNonEmpty(rule.group)
    ? { group: normalizeContributionGroup(rule.group) }
    : { group: normalizeContributionGroup(rule.slotId) }),
  ...(typeof rule.order === "number" ? { order: rule.order } : {}),
  ...(hasNonEmpty(rule.when) ? { when: rule.when.trim() } : {}),
});

const toToolbarMergeEntry = (
  contribution: ModToolbarItem,
  operation?: ModPackageUIItemRule["operation"]
) => ({
  slotId: normalizeContributionGroup(contribution.group),
  itemId: contribution.id.trim(),
  ...(operation ? { operation } : {}),
  value: contribution,
});

const mergeDiagnosticsToModuleDiagnostics = (
  items: readonly ModResourceMergeDiagnostic[]
): ModuleDiagnostic[] =>
  items.map((item) => ({
    level: item.kind === "blocked" ? "warning" : "warning",
    code: `merge-${item.resourceType}-${item.kind}`,
    message: `${item.resourceType} ${item.kind} [${item.key}] (${item.source}${item.againstSource ? ` <- ${item.againstSource}` : ""}): ${item.reason}`,
  }));

const toRuntimeMergeDiagnosticEntries = (
  items: readonly ModResourceMergeDiagnostic[]
): RuntimeMergeDiagnosticEntry[] =>
  [...items]
    .map((item) => ({
      kind: item.kind,
      resourceType: item.resourceType,
      key: item.key,
      source: item.source,
      againstSource: item.againstSource ?? null,
      reason: item.reason,
    }))
    .sort((left, right) => {
      const resourceTypeDelta = left.resourceType.localeCompare(right.resourceType);
      if (resourceTypeDelta !== 0) return resourceTypeDelta;
      const keyDelta = left.key.localeCompare(right.key);
      if (keyDelta !== 0) return keyDelta;
      return left.kind.localeCompare(right.kind);
    });

const normalizeContributionOrder = (value: number | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toRuntimeToolbarContributionOrder = (
  items: readonly ModToolbarItem[]
): RuntimeToolbarContributionPreview[] =>
  [...items]
    .filter((item) => hasNonEmpty(item.id))
    .map((item) => ({
      id: item.id.trim(),
      commandId: hasNonEmpty(item.commandId) ? item.commandId.trim() : "(none)",
      group: hasNonEmpty(item.group) ? item.group.trim() : "(ungrouped)",
      order: normalizeContributionOrder(item.order),
    }))
    .sort((left, right) => {
      const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
      const orderDelta = leftOrder - rightOrder;
      if (orderDelta !== 0) return orderDelta;
      return left.id.localeCompare(right.id);
    });

const BASE_AUTHORING_SHORTCUT_RULES: readonly ModPackageShortcutRule[] = [
  { shortcut: "mod+z", commandId: "undo" },
  { shortcut: "mod+shift+z", commandId: "redo" },
  { shortcut: "mod+y", commandId: "redo" },
  { shortcut: "alt+arrowleft", commandId: "prevStep" },
  { shortcut: "alt+arrowright", commandId: "nextStep" },
  { shortcut: "pageup", commandId: "prevPage" },
  { shortcut: "pagedown", commandId: "nextPage" },
] as const;

export const getRuntimeModDiagnostics = (
  input: RuntimeModDiagnosticsInput
): RuntimeModDiagnostics => {
  const orderedMods = [...input.registeredMods]
    .map((mod) => ({
      id: mod.meta.id,
      priority: mod.meta.priority,
    }))
    .sort((left, right) => {
      const priorityDelta = right.priority - left.priority;
      if (priorityDelta !== 0) return priorityDelta;
      return left.id.localeCompare(right.id);
    });

  const diagnostics: ModuleDiagnostic[] = [];
  const registeredModIdSet = new Set(orderedMods.map((mod) => mod.id));

  const activePackageResolution = selectActiveModPackageResolution(
    input.registeredPackages,
    input.activePackageId
  );
  const activePackage = selectActiveModPackage(
    input.registeredPackages,
    input.activePackageId
  );
  const packageConflictSummary = selectActiveModPackageConflictSummary(
    input.registeredPackages,
    input.activePackageId
  );
  const expectedActiveModIdForToolbarMode =
    selectModPackageActivationModIdForToolbarMode(
      activePackage,
      input.toolbarMode
    );
  const activeModIsInResolvedPackage = selectActiveModPackageContainsModId(
    input.registeredPackages,
    input.activePackageId,
    input.activeModId
  );
  const modLayerOverrides = selectRuntimeModResourceOverridesForLayer("mod");
  const userLayerOverrides = selectRuntimeModResourceOverridesForLayer("user");

  const modsByPriority = new Map<number, string[]>();
  for (const mod of orderedMods) {
    const ids = modsByPriority.get(mod.priority) ?? [];
    ids.push(mod.id);
    modsByPriority.set(mod.priority, ids);
  }
  for (const [priority, ids] of modsByPriority.entries()) {
    if (ids.length <= 1) continue;
    diagnostics.push({
      level: "warning",
      code: "priority-conflict",
      message: `mod priority collision (${priority}): ${ids.join(", ")}`,
    });
  }

  const duplicateToolbarIds = collectDuplicateKeys(
    input.rawToolbarContributions,
    (item) => item.id
  );
  for (const duplicateId of duplicateToolbarIds) {
    diagnostics.push({
      level: "error",
      code: "toolbar-id-collision",
      message: `duplicate toolbar contribution id: '${duplicateId}'.`,
    });
  }

  const duplicateCommandIds = collectDuplicateKeys(
    input.rawToolbarContributions,
    (item) => item.commandId
  );
  for (const duplicateCommandId of duplicateCommandIds) {
    diagnostics.push({
      level: "warning",
      code: "toolbar-command-collision",
      message: `multiple toolbar contributions call commandId '${duplicateCommandId}'.`,
    });
  }

  const rawContributionIds = toContributionIdSet(input.rawToolbarContributions);
  const resolvedContributionIds = toContributionIdSet(input.resolvedToolbarContributions);
  const blockedContributionIds = [...rawContributionIds]
    .filter((id) => !resolvedContributionIds.has(id))
    .sort((left, right) => left.localeCompare(right));

  if (blockedContributionIds.length > 0) {
    diagnostics.push({
      level: "warning",
      code: "blocked-contributions",
      message: `${blockedContributionIds.length} toolbar contributions were filtered by host/package policy.`,
    });
  }

  const packageToolbarItemRules = selectActiveModPackageToolbarItemRules(
    input.registeredPackages,
    input.activePackageId
  );
  const uiItemMerge = mergeUIItemsByResourceLayerLoadOrder({
    package: packageToolbarItemRules.map((rule) =>
      toToolbarMergeEntry(toToolbarContributionFromPolicyRule(rule), rule.operation)
    ),
    mod: input.rawToolbarContributions
      .filter(
        (item) =>
          hasNonEmpty(item.id) &&
          hasNonEmpty(item.commandId) &&
          hasNonEmpty(item.label)
      )
      .map((item) =>
        toToolbarMergeEntry({
          ...item,
          id: item.id.trim(),
          commandId: item.commandId.trim(),
          label: item.label.trim(),
          group: normalizeContributionGroup(item.group),
        })
      ),
    user: (userLayerOverrides?.toolbarItems ?? []).map((rule) =>
      toToolbarMergeEntry(toToolbarContributionFromPolicyRule(rule), rule.operation)
    ),
  });

  const packageCommandRules = selectActiveModPackageResourceCommandRules(
    input.registeredPackages,
    input.activePackageId
  );
  const modCommandRules = input.rawToolbarContributions
    .map((item) => item.commandId.trim())
    .filter((commandId) => commandId.length > 0)
    .map((commandId) => ({
      commandId,
      operation: "upsert" as const,
    }));
  const commandMerge = mergeCommandsByResourceLayerLoadOrder({
    package: packageCommandRules,
    mod: [...modCommandRules, ...(modLayerOverrides?.commands ?? [])],
    user: userLayerOverrides?.commands ?? [],
  });

  const packageShortcutRules = selectActiveModPackageResourceShortcutRules(
    input.registeredPackages,
    input.activePackageId
  );
  const shortcutMerge = mergeShortcutsByResourceLayerLoadOrder({
    base: BASE_AUTHORING_SHORTCUT_RULES,
    package: packageShortcutRules,
    mod: modLayerOverrides?.shortcuts ?? [],
    user: userLayerOverrides?.shortcuts ?? [],
  });

  const inputBehaviorMerge = mergeInputBehaviorByResourceLayerLoadOrder({
    base: { strategy: "exclusive" },
    package: selectActiveModPackageResourceInputBehaviorRule(
      input.registeredPackages,
      input.activePackageId
    ),
    mod: modLayerOverrides?.inputBehavior,
    user: userLayerOverrides?.inputBehavior,
  });

  const mergeDiagnostics = [
    ...uiItemMerge.diagnostics,
    ...commandMerge.diagnostics,
    ...shortcutMerge.diagnostics,
    ...inputBehaviorMerge.diagnostics,
  ];
  const mergeDiagnosticEntries = toRuntimeMergeDiagnosticEntries(mergeDiagnostics);
  const resolvedToolbarContributionOrder = toRuntimeToolbarContributionOrder(
    input.resolvedToolbarContributions
  );
  diagnostics.push(...mergeDiagnosticsToModuleDiagnostics(mergeDiagnostics));

  if (commandMerge.blockedCommandIds.length > 0) {
    diagnostics.push({
      level: "warning",
      code: "merge-command-conflict-blocked",
      message: `blocked command conflicts: ${commandMerge.blockedCommandIds.join(", ")}`,
    });
  }

  const shortcutConflictKeys = [
    ...new Set(
      shortcutMerge.diagnostics
        .filter((item) => item.resourceType === "shortcut")
        .filter((item) => item.kind === "winner" || item.kind === "loser")
        .map((item) => item.key)
    ),
  ].sort((left, right) => left.localeCompare(right));

  if (
    activePackageResolution.fallbackToPrimary &&
    activePackageResolution.requestedPackageId
  ) {
    diagnostics.push({
      level: "warning",
      code: "active-package-fallback",
      message: `requested active package '${activePackageResolution.requestedPackageId}' is unavailable; using '${activePackageResolution.resolvedPackageId ?? "(none)"}'.`,
    });
  }

  if (packageConflictSummary.registeredConflictIds.length > 0) {
    diagnostics.push({
      level: "warning",
      code: "package-conflicts-active",
      message: `active package conflicts: ${packageConflictSummary.registeredConflictIds.join(", ")}`,
    });
  }

  if (packageConflictSummary.missingConflictIds.length > 0) {
    diagnostics.push({
      level: "warning",
      code: "package-conflicts-missing-packages",
      message: `active package declares unknown conflicts: ${packageConflictSummary.missingConflictIds.join(", ")}`,
    });
  }

  if (activePackage && input.activeModId && !activeModIsInResolvedPackage) {
    diagnostics.push({
      level: "warning",
      code: "policy-mismatch-active-mod-not-in-package",
      message: `active mod '${input.activeModId}' is outside active package '${activePackage.packId}'.`,
    });
  }

  if (
    input.activeModId &&
    expectedActiveModIdForToolbarMode &&
    input.activeModId !== expectedActiveModIdForToolbarMode
  ) {
    diagnostics.push({
      level: "warning",
      code: "policy-mismatch-toolbar-mode-target",
      message: `toolbar mode '${input.toolbarMode}' expects mod '${expectedActiveModIdForToolbarMode}' but runtime active mod is '${input.activeModId}'.`,
    });
  }

  if (
    expectedActiveModIdForToolbarMode &&
    !registeredModIdSet.has(expectedActiveModIdForToolbarMode)
  ) {
    diagnostics.push({
      level: "warning",
      code: "policy-mismatch-unregistered-target-mod",
      message: `active package policy targets '${expectedActiveModIdForToolbarMode}' for toolbar mode '${input.toolbarMode}', but runtime registry does not contain it.`,
    });
  }

  return {
    activeModId: input.activeModId,
    requestedActivePackageId: activePackageResolution.requestedPackageId,
    resolvedActivePackageId: activePackageResolution.resolvedPackageId,
    activePackageFallbackToPrimary: activePackageResolution.fallbackToPrimary,
    activePackageModIds: activePackage ? [...activePackage.modIds] : [],
    declaredConflictPackageIds: packageConflictSummary.declaredConflictIds,
    reverseConflictPackageIds: packageConflictSummary.reverseConflictIds,
    conflictPackageIds: packageConflictSummary.registeredConflictIds,
    missingConflictPackageIds: packageConflictSummary.missingConflictIds,
    toolbarMode: input.toolbarMode,
    expectedActiveModIdForToolbarMode,
    orderedMods,
    blockedContributionIds,
    blockedCommandIds: commandMerge.blockedCommandIds,
    shortcutConflictKeys,
    mergeDiagnostics: mergeDiagnosticEntries,
    resolvedToolbarContributionOrder,
    resolvedInputBehaviorStrategy: inputBehaviorMerge.inputBehavior.strategy,
    resolvedInputBehaviorSource: inputBehaviorMerge.inputBehavior.source,
    diagnostics,
  };
};
