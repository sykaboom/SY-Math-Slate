import type { ModuleDraft } from "@features/mod-studio/core/types";
import type { ModDefinition, ModToolbarItem } from "@core/mod/contracts";

export type ModuleDiagnostic = {
  level: "error" | "warning";
  code: string;
  message: string;
};

export type RuntimeModOrderEntry = {
  id: string;
  priority: number;
};

export type RuntimeModDiagnostics = {
  activeModId: string | null;
  orderedMods: RuntimeModOrderEntry[];
  blockedContributionIds: string[];
  diagnostics: ModuleDiagnostic[];
};

type RuntimeModDiagnosticsInput = {
  activeModId: string | null;
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
      message: `${blockedContributionIds.length} toolbar contributions were filtered by host policy.`,
    });
  }

  return {
    activeModId: input.activeModId,
    orderedMods,
    blockedContributionIds,
    diagnostics,
  };
};
