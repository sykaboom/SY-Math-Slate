import type { ModPanelContribution, ModToolbarItem } from "@core/mod/contracts";
import { isKnownUISlotName, type UISlotName } from "@core/extensions/registry";
import { getRuntimeModManager } from "@core/mod/host";
import {
  listRuntimeModPackages,
  selectActiveModPackageAllowsPanelSlot,
  selectActiveModPackageAllowsToolbarContributionGroup,
  type ModPackageDefinition,
  type ModPackageId,
} from "@core/mod/package";
import type { PanelRuntimeRole } from "@features/layout/windowing/panelBehavior.types";
import { useModStore } from "@features/store/useModStore";

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

const dedupeById = <T extends { id: string }>(entries: readonly T[]): T[] => {
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const entry of entries) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    deduped.push(entry);
  }
  return deduped;
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

export const listResolvedModToolbarContributions = (
  options: ToolbarBridgeOptions
): readonly ModToolbarItem[] => {
  if (options.mountMode !== "window-host") return [];
  if (options.role !== "host") return [];

  const policyContext = resolveActivePackagePolicyContext(options.activePackageId);
  const manager = getRuntimeModManager();
  const raw = manager.listToolbarContributions();
  const normalized = raw
    .filter(
      (entry) => hasNonEmpty(entry.id) && hasNonEmpty(entry.commandId) && hasNonEmpty(entry.label)
    )
    .map((entry) => ({
      ...entry,
      id: entry.id.trim(),
      commandId: entry.commandId.trim(),
      label: entry.label.trim(),
    }))
    .filter((entry) =>
      selectActiveModPackageAllowsToolbarContributionGroup(
        policyContext.definitions,
        policyContext.activePackageId,
        normalizeContributionGroup(entry.group)
      )
    )
    .sort(compareContributionByOrderThenId);

  const deduped = dedupeById(normalized);
  const reserved = options.reservedActionIds;
  if (!reserved || reserved.size === 0) {
    return deduped;
  }
  return deduped.filter((entry) => !reserved.has(entry.id));
};

export const listResolvedModPanelContributions = (
  options: PanelBridgeOptions
): readonly ResolvedModPanelContribution[] => {
  if (options.role !== "host") return [];

  const policyContext = resolveActivePackagePolicyContext(options.activePackageId);
  const manager = getRuntimeModManager();
  const raw = manager.listPanelContributions();
  const normalized: ResolvedModPanelContribution[] = [];

  for (const entry of raw) {
    if (!hasNonEmpty(entry.id) || !hasNonEmpty(entry.title) || !hasNonEmpty(entry.slot)) {
      continue;
    }
    const slot = entry.slot.trim();
    if (!isKnownUISlotName(slot)) continue;
    if (
      !selectActiveModPackageAllowsPanelSlot(
        policyContext.definitions,
        policyContext.activePackageId,
        slot
      )
    ) {
      continue;
    }
    normalized.push({
      ...entry,
      id: entry.id.trim(),
      title: entry.title.trim(),
      slot,
    });
  }

  const ordered = normalized.sort(compareContributionByOrderThenId);
  return dedupeById(ordered);
};
