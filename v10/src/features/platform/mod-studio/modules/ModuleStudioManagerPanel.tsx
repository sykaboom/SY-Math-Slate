"use client";

import { useMemo } from "react";

import type {
  ModPackageDefinition,
  ModPackageId,
} from "@core/runtime/modding/package";
import type { ModuleDraft } from "@features/platform/mod-studio/core/types";
import type {
  ModuleDiagnostic,
  RuntimeMergeDiagnosticEntry,
  RuntimeModDiagnostics,
} from "@features/platform/mod-studio/modules/moduleDiagnostics";

type ModuleStudioManagerPanelProps = {
  modules: ModuleDraft[];
  moduleDiagnostics: ModuleDiagnostic[];
  runtimeModDiagnostics: RuntimeModDiagnostics;
  activePackageId: ModPackageId | null;
  activeModId: string;
  runtimePackages: readonly ModPackageDefinition[];
  onSetActivePackageContext: (packId: ModPackageId | null) => void;
  onSetActiveModId: (modId: string) => void;
  onSetModuleEnabled: (moduleId: string, enabled: boolean) => void;
  onSetModuleOrder: (moduleId: string, order: number) => void;
  onMoveModuleOrder: (moduleId: string, direction: "up" | "down") => void;
};

const compareModuleDrafts = (left: ModuleDraft, right: ModuleDraft): number => {
  const orderDelta = left.order - right.order;
  if (orderDelta !== 0) return orderDelta;
  return left.id.localeCompare(right.id);
};

const toneByMergeKind: Record<RuntimeMergeDiagnosticEntry["kind"], string> = {
  winner: "text-[var(--theme-success)]",
  loser: "text-[var(--theme-warning)]",
  blocked: "text-[var(--theme-danger)]",
};

export function ModuleStudioManagerPanel({
  modules,
  moduleDiagnostics,
  runtimeModDiagnostics,
  activePackageId,
  activeModId,
  runtimePackages,
  onSetActivePackageContext,
  onSetActiveModId,
  onSetModuleEnabled,
  onSetModuleOrder,
  onMoveModuleOrder,
}: ModuleStudioManagerPanelProps) {
  const sortedModules = useMemo(
    () => modules.slice().sort(compareModuleDrafts),
    [modules]
  );

  const modPriorityMap = useMemo(
    () =>
      new Map(
        runtimeModDiagnostics.orderedMods.map((mod) => [mod.id, mod.priority])
      ),
    [runtimeModDiagnostics.orderedMods]
  );

  const availableModIds = useMemo(() => {
    const packageScopedModIds = runtimeModDiagnostics.activePackageModIds;
    const seed =
      packageScopedModIds.length > 0
        ? [...packageScopedModIds]
        : runtimeModDiagnostics.orderedMods.map((entry) => entry.id);
    if (activeModId.trim().length > 0 && !seed.includes(activeModId)) {
      seed.unshift(activeModId);
    }
    return [...new Set(seed)];
  }, [
    activeModId,
    runtimeModDiagnostics.activePackageModIds,
    runtimeModDiagnostics.orderedMods,
  ]);

  const runtimeConflictLedger = useMemo(
    () =>
      runtimeModDiagnostics.mergeDiagnostics.filter(
        (entry) =>
          entry.kind === "winner" ||
          entry.kind === "loser" ||
          entry.kind === "blocked"
      ),
    [runtimeModDiagnostics.mergeDiagnostics]
  );

  return (
    <div className="grid gap-3">
      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/80">
          Runtime Manager Context
        </div>
        <label className="grid gap-1 text-[11px] text-theme-text/65">
          Active Package
          <select
            value={activePackageId ?? ""}
            onChange={(event) =>
              onSetActivePackageContext(event.target.value || null)
            }
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          >
            <option value="">(primary fallback)</option>
            {runtimePackages.map((pkg) => (
              <option key={pkg.packId} value={pkg.packId}>
                {pkg.packId} ({pkg.label})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-theme-text/65">
          Active Mod
          <select
            value={activeModId}
            onChange={(event) => {
              const nextModId = event.target.value.trim();
              if (!nextModId) return;
              onSetActiveModId(nextModId);
            }}
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          >
            {availableModIds.map((modId) => (
              <option key={modId} value={modId}>
                {modId}
                {typeof modPriorityMap.get(modId) === "number"
                  ? ` (p${modPriorityMap.get(modId)})`
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="text-[11px] text-theme-text/70">
          policy target ({runtimeModDiagnostics.toolbarMode}):{" "}
          <span className="font-semibold text-theme-text/85">
            {runtimeModDiagnostics.expectedActiveModIdForToolbarMode ?? "(none)"}
          </span>
        </div>
      </section>

      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/80">
          Enable / Disable / Order
        </div>
        {sortedModules.length === 0 ? (
          <div className="text-[11px] text-theme-text/60">No module drafts yet.</div>
        ) : (
          sortedModules.map((module, index) => (
            <article
              key={`manager-${module.id}`}
              className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface/35 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-theme-text/80">
                  {module.label} ({module.id})
                </div>
                <label className="flex items-center gap-1 text-[11px] text-theme-text/65">
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={(event) =>
                      onSetModuleEnabled(module.id, event.target.checked)
                    }
                  />
                  enabled
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-theme-text/65">
                <span>slot: {module.slot}</span>
                <span>command: {module.action.commandId}</span>
                <label className="flex items-center gap-1">
                  order
                  <input
                    type="number"
                    value={module.order}
                    onChange={(event) => {
                      const parsed = Number.parseInt(event.target.value, 10);
                      onSetModuleOrder(
                        module.id,
                        Number.isFinite(parsed) ? parsed : 0
                      );
                    }}
                    className="w-16 rounded border border-theme-border/20 bg-theme-surface/40 px-1.5 py-0.5 text-[11px] text-theme-text"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onMoveModuleOrder(module.id, "up")}
                  disabled={index === 0}
                  className="rounded border border-theme-border/20 px-2 py-0.5 text-[11px] text-theme-text/75 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => onMoveModuleOrder(module.id, "down")}
                  disabled={index >= sortedModules.length - 1}
                  className="rounded border border-theme-border/20 px-2 py-0.5 text-[11px] text-theme-text/75 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Down
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="grid gap-1 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/75">Load-Order Preview</div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-theme-text/70">
          {runtimeModDiagnostics.orderedMods.length === 0 ? (
            <span>no registered mods</span>
          ) : (
            runtimeModDiagnostics.orderedMods.map((mod) => (
              <span
                key={`${mod.id}-${mod.priority}`}
                className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-0.5"
              >
                {mod.id} (p{mod.priority})
              </span>
            ))
          )}
        </div>
        <div className="grid gap-1 text-[11px] text-theme-text/70">
          <div>resolved toolbar contribution order</div>
          {runtimeModDiagnostics.resolvedToolbarContributionOrder.length === 0 ? (
            <div className="text-theme-text/55">(none)</div>
          ) : (
            runtimeModDiagnostics.resolvedToolbarContributionOrder.map((entry) => (
              <div
                key={`${entry.id}:${entry.commandId}:${entry.group}`}
                className="rounded border border-theme-border/10 bg-theme-surface/30 px-2 py-0.5"
              >
                {entry.id} {"->"} {entry.commandId} [{entry.group}] order:{" "}
                {entry.order ?? "auto"}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-1 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/75">
          Conflict Diagnostics (winner / loser / blocked)
        </div>
        {runtimeConflictLedger.length === 0 ? (
          <div className="text-[11px] text-[var(--theme-success)]">
            no merge conflict diagnostics
          </div>
        ) : (
          runtimeConflictLedger.map((entry, index) => (
            <div
              key={`merge-${entry.resourceType}-${entry.key}-${entry.kind}-${index}`}
              className={`text-[11px] ${toneByMergeKind[entry.kind]}`}
            >
              [{entry.kind}] {entry.resourceType} {entry.key} ({entry.source}
              {entry.againstSource ? ` <- ${entry.againstSource}` : ""}): {entry.reason}
            </div>
          ))
        )}

        {moduleDiagnostics.length > 0 ? (
          moduleDiagnostics.map((entry, index) => (
            <div
              key={`draft-${entry.code}-${index}`}
              className={
                entry.level === "error"
                  ? "text-[11px] text-[var(--theme-danger)]"
                  : "text-[11px] text-[var(--theme-warning)]"
              }
            >
              [draft:{entry.code}] {entry.message}
            </div>
          ))
        ) : (
          <div className="text-[11px] text-[var(--theme-success)]">
            draft diagnostics clean
          </div>
        )}

        {runtimeModDiagnostics.declaredConflictPackageIds.length > 0 ? (
          <div className="text-[11px] text-theme-text/70">
            declared package conflicts: {runtimeModDiagnostics.declaredConflictPackageIds.join(", ")}
          </div>
        ) : (
          <div className="text-[11px] text-[var(--theme-success)]">
            no declared package conflicts
          </div>
        )}
        {runtimeModDiagnostics.reverseConflictPackageIds.length > 0 ? (
          <div className="text-[11px] text-[var(--theme-warning)]">
            incoming conflicts from other packages:{" "}
            {runtimeModDiagnostics.reverseConflictPackageIds.join(", ")}
          </div>
        ) : null}
        {runtimeModDiagnostics.missingConflictPackageIds.length > 0 ? (
          <div className="text-[11px] text-[var(--theme-warning)]">
            unknown conflict targets:{" "}
            {runtimeModDiagnostics.missingConflictPackageIds.join(", ")}
          </div>
        ) : null}
        {runtimeModDiagnostics.blockedContributionIds.length > 0 ? (
          <div className="text-[11px] text-[var(--theme-warning)]">
            blocked contributions: {runtimeModDiagnostics.blockedContributionIds.join(", ")}
          </div>
        ) : (
          <div className="text-[11px] text-[var(--theme-success)]">
            no blocked contributions
          </div>
        )}
        {runtimeModDiagnostics.blockedCommandIds.length > 0 ? (
          <div className="text-[11px] text-[var(--theme-warning)]">
            blocked commands: {runtimeModDiagnostics.blockedCommandIds.join(", ")}
          </div>
        ) : (
          <div className="text-[11px] text-[var(--theme-success)]">no blocked commands</div>
        )}
      </section>
    </div>
  );
}
