import type { ModPanelContribution, ModToolbarItem } from "@core/runtime/modding/api";
import { isKnownUISlotName, type UISlotName } from "@core/runtime/plugin-runtime/registry";
import { getRuntimeModManager } from "@core/runtime/modding/host";
import {
  listRuntimeModPackages,
  mergeUIItemsByResourceLayerLoadOrder,
  selectActiveModPackageAllowsPanelSlot,
  selectActiveModPackageAllowsToolbarContributionGroup,
  selectActiveModPackagePanelItemRules,
  selectActiveModPackageToolbarItemRules,
  selectRuntimeModResourceOverridesForLayer,
  type ModPackageDefinition,
  type ModPackageId,
  type ModPackageUIItemRule,
} from "@core/runtime/modding/package";
import type { PanelRuntimeRole } from "@features/chrome/layout/windowing/panelBehavior.types";
import { useModStore } from "@features/platform/store/useModStore";

export type ModContributionMountMode = "legacy-shell" | "window-host";

export type ResolvedModPanelContribution = Omit<ModPanelContribution, "slot"> & {
  slot: UISlotName;
};

type ToolbarBridgeOptions = {
  mountMode: ModContributionMountMode;
  role: PanelRuntimeRole;
  reservedActionIds?: ReadonlySet<string>;
  activePackageId?: ModPackageId | null;
};

type PanelBridgeOptions = {
  role: PanelRuntimeRole;
  activePackageId?: ModPackageId | null;
};

type ActivePackagePolicyContext = {
  definitions: readonly ModPackageDefinition[];
  activePackageId: ModPackageId | null;
};

const normalizeOrder = (value: number | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;
  return value;
};

const compareContributionByOrderThenId = <
  T extends {
    id: string;
    order?: number;
  },
>(
  left: T,
  right: T
): number => {
  const orderDiff = normalizeOrder(left.order) - normalizeOrder(right.order);
  if (orderDiff !== 0) return orderDiff;
  return left.id.localeCompare(right.id);
};

const hasNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeContributionGroup = (value: string | undefined): string =>
  hasNonEmpty(value) ? value.trim() : "";

const resolveActivePackagePolicyContext = (
  activePackageIdOverride: ModPackageId | null | undefined
): ActivePackagePolicyContext => {
  const storeActivePackageId = useModStore.getState().activePackageId;
  return {
    definitions: listRuntimeModPackages(),
    activePackageId: activePackageIdOverride ?? storeActivePackageId ?? null,
  };
};

const normalizeToolbarContribution = (
  entry: ModToolbarItem
): ModToolbarItem | null => {
  if (!hasNonEmpty(entry.id) || !hasNonEmpty(entry.commandId) || !hasNonEmpty(entry.label)) {
    return null;
  }
  return {
    ...entry,
    id: entry.id.trim(),
    commandId: entry.commandId.trim(),
    label: entry.label.trim(),
    ...(entry.group ? { group: normalizeContributionGroup(entry.group) } : {}),
  };
};

const toToolbarContributionFromPolicyRule = (
  rule: ModPackageUIItemRule
): ModToolbarItem => ({
  id: rule.itemId.trim(),
  commandId: hasNonEmpty(rule.commandId) ? rule.commandId.trim() : "",
  label: hasNonEmpty(rule.label) ? rule.label.trim() : rule.itemId.trim(),
  ...(hasNonEmpty(rule.icon) ? { icon: rule.icon.trim() } : {}),
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
  itemId: contribution.id,
  ...(operation ? { operation } : {}),
  value: contribution,
});

const normalizePanelContribution = (
  entry: ModPanelContribution
): ResolvedModPanelContribution | null => {
  if (!hasNonEmpty(entry.id) || !hasNonEmpty(entry.title) || !hasNonEmpty(entry.slot)) {
    return null;
  }
  const slot = entry.slot.trim();
  if (!isKnownUISlotName(slot)) return null;
  return {
    ...entry,
    id: entry.id.trim(),
    title: entry.title.trim(),
    slot,
  };
};

const toPanelContributionFromPolicyRule = (
  rule: ModPackageUIItemRule
): ResolvedModPanelContribution | null => {
  const slot = rule.slotId.trim();
  if (!isKnownUISlotName(slot)) return null;
  return {
    id: rule.itemId.trim(),
    title: hasNonEmpty(rule.title) ? rule.title.trim() : rule.itemId.trim(),
    slot,
    ...(typeof rule.defaultOpen === "boolean"
      ? { defaultOpen: rule.defaultOpen }
      : {}),
    ...(typeof rule.order === "number" ? { order: rule.order } : {}),
  };
};

const toPanelMergeEntry = (
  contribution: ResolvedModPanelContribution,
  operation?: ModPackageUIItemRule["operation"]
) => ({
  slotId: contribution.slot,
  itemId: contribution.id,
  ...(operation ? { operation } : {}),
  value: contribution,
});

export const listResolvedModToolbarContributions = (
  options: ToolbarBridgeOptions
): readonly ModToolbarItem[] => {
  if (options.mountMode !== "window-host") return [];
  if (options.role !== "host") return [];

  const policyContext = resolveActivePackagePolicyContext(options.activePackageId);
  const manager = getRuntimeModManager();

  const modLayer = manager
    .listToolbarContributions()
    .map((entry) => normalizeToolbarContribution(entry))
    .filter((entry): entry is ModToolbarItem => entry !== null)
    .filter((entry) =>
      selectActiveModPackageAllowsToolbarContributionGroup(
        policyContext.definitions,
        policyContext.activePackageId,
        normalizeContributionGroup(entry.group)
      )
    )
    .sort(compareContributionByOrderThenId)
    .map((entry) => toToolbarMergeEntry(entry));

  const packageLayer = selectActiveModPackageToolbarItemRules(
    policyContext.definitions,
    policyContext.activePackageId
  ).map((rule) =>
    toToolbarMergeEntry(toToolbarContributionFromPolicyRule(rule), rule.operation)
  );

  const userLayer = (
    selectRuntimeModResourceOverridesForLayer("user")?.toolbarItems ?? []
  ).map((rule) =>
    toToolbarMergeEntry(toToolbarContributionFromPolicyRule(rule), rule.operation)
  );

  const merged = mergeUIItemsByResourceLayerLoadOrder({
    package: packageLayer,
    mod: modLayer,
    user: userLayer,
  });

  const normalized = merged.items
    .map((entry) => ({
      ...entry.value,
      id: entry.itemId,
      group: entry.slotId,
    }))
    .filter(
      (entry) =>
        hasNonEmpty(entry.id) && hasNonEmpty(entry.commandId) && hasNonEmpty(entry.label)
    )
    .filter((entry) =>
      selectActiveModPackageAllowsToolbarContributionGroup(
        policyContext.definitions,
        policyContext.activePackageId,
        normalizeContributionGroup(entry.group)
      )
    )
    .sort(compareContributionByOrderThenId);

  const reserved = options.reservedActionIds;
  if (!reserved || reserved.size === 0) {
    return normalized;
  }
  return normalized.filter((entry) => !reserved.has(entry.id));
};

export const listResolvedModPanelContributions = (
  options: PanelBridgeOptions
): readonly ResolvedModPanelContribution[] => {
  if (options.role !== "host") return [];

  const policyContext = resolveActivePackagePolicyContext(options.activePackageId);
  const manager = getRuntimeModManager();

  const modLayer = manager
    .listPanelContributions()
    .map((entry) => normalizePanelContribution(entry))
    .filter((entry): entry is ResolvedModPanelContribution => entry !== null)
    .filter((entry) =>
      selectActiveModPackageAllowsPanelSlot(
        policyContext.definitions,
        policyContext.activePackageId,
        entry.slot
      )
    )
    .sort(compareContributionByOrderThenId)
    .map((entry) => toPanelMergeEntry(entry));

  const packageLayer = selectActiveModPackagePanelItemRules(
    policyContext.definitions,
    policyContext.activePackageId
  )
    .map((rule) => ({
      rule,
      contribution: toPanelContributionFromPolicyRule(rule),
    }))
    .filter(
      (
        entry
      ): entry is {
        rule: ModPackageUIItemRule;
        contribution: ResolvedModPanelContribution;
      } => entry.contribution !== null
    )
    .map(({ rule, contribution }) => toPanelMergeEntry(contribution, rule.operation));

  const userLayer = (
    selectRuntimeModResourceOverridesForLayer("user")?.panelItems ?? []
  )
    .map((rule) => ({
      rule,
      contribution: toPanelContributionFromPolicyRule(rule),
    }))
    .filter(
      (
        entry
      ): entry is {
        rule: ModPackageUIItemRule;
        contribution: ResolvedModPanelContribution;
      } => entry.contribution !== null
    )
    .map(({ rule, contribution }) => toPanelMergeEntry(contribution, rule.operation));

  const merged = mergeUIItemsByResourceLayerLoadOrder({
    package: packageLayer,
    mod: modLayer,
    user: userLayer,
  });

  return merged.items
    .map((entry) => entry.value)
    .filter((entry) => isKnownUISlotName(entry.slot))
    .filter((entry) =>
      selectActiveModPackageAllowsPanelSlot(
        policyContext.definitions,
        policyContext.activePackageId,
        entry.slot
      )
    )
    .sort(compareContributionByOrderThenId);
};
