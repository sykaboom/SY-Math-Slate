"use client";

import { useMemo, useState } from "react";

import type { AppCommandMetadata } from "@core/runtime/command/commandBus";
import type { UISlotName } from "@core/runtime/plugin-runtime/registry";
import type { ModuleDraft } from "@features/platform/mod-studio/core/types";
import type { ModuleDiagnostic } from "@features/platform/mod-studio/modules/moduleDiagnostics";

type ModuleStudioAuthorPanelProps = {
  modules: ModuleDraft[];
  moduleDiagnostics: ModuleDiagnostic[];
  knownSlots: readonly UISlotName[];
  knownCommands: readonly AppCommandMetadata[];
  onUpsertModuleDraft: (module: ModuleDraft) => void;
  onRemoveModuleDraft: (moduleId: string) => void;
};

const compareModuleDrafts = (left: ModuleDraft, right: ModuleDraft): number => {
  const orderDelta = left.order - right.order;
  if (orderDelta !== 0) return orderDelta;
  return left.id.localeCompare(right.id);
};

const createModuleSeed = (
  knownSlots: readonly UISlotName[],
  knownCommands: readonly AppCommandMetadata[]
): ModuleDraft => ({
  id: "",
  label: "",
  slot: knownSlots[0],
  enabled: true,
  order: 0,
  action: {
    commandId: knownCommands[0]?.id ?? "nextStep",
    payload: {},
  },
});

export function ModuleStudioAuthorPanel({
  modules,
  moduleDiagnostics,
  knownSlots,
  knownCommands,
  onUpsertModuleDraft,
  onRemoveModuleDraft,
}: ModuleStudioAuthorPanelProps) {
  const [seed, setSeed] = useState<ModuleDraft>(() =>
    createModuleSeed(knownSlots, knownCommands)
  );

  const sortedModules = useMemo(
    () => modules.slice().sort(compareModuleDrafts),
    [modules]
  );

  const handleAdd = () => {
    const normalizedId = seed.id.trim();
    if (!normalizedId) return;
    onUpsertModuleDraft({
      ...seed,
      id: normalizedId,
      label: seed.label.trim() || normalizedId,
      action: {
        ...seed.action,
        commandId: seed.action.commandId.trim(),
      },
    });
    setSeed(createModuleSeed(knownSlots, knownCommands));
  };

  return (
    <div className="grid gap-3">
      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/80">Authoring</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="module id"
            value={seed.id}
            onChange={(event) => setSeed((prev) => ({ ...prev, id: event.target.value }))}
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
          <input
            type="text"
            placeholder="label"
            value={seed.label}
            onChange={(event) => setSeed((prev) => ({ ...prev, label: event.target.value }))}
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
          <select
            value={seed.slot}
            onChange={(event) =>
              setSeed((prev) => ({ ...prev, slot: event.target.value as UISlotName }))
            }
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          >
            {knownSlots.map((slotName) => (
              <option key={slotName} value={slotName}>
                {slotName}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={seed.order}
            onChange={(event) =>
              setSeed((prev) => ({
                ...prev,
                order: Number.parseInt(event.target.value, 10) || 0,
              }))
            }
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
          {knownCommands.length > 0 ? (
            <select
              value={seed.action.commandId}
              onChange={(event) =>
                setSeed((prev) => ({
                  ...prev,
                  action: { ...prev.action, commandId: event.target.value },
                }))
              }
              className="col-span-2 rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
            >
              {knownCommands.map((command) => (
                <option key={command.id} value={command.id}>
                  {command.id}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="command id (command catalog empty)"
              value={seed.action.commandId}
              onChange={(event) =>
                setSeed((prev) => ({
                  ...prev,
                  action: { ...prev.action, commandId: event.target.value },
                }))
              }
              className="col-span-2 rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="w-fit rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
        >
          Upsert Module
        </button>
      </section>

      <section className="grid gap-2">
        {sortedModules.length === 0 ? (
          <div className="rounded border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/65">
            No module drafts yet.
          </div>
        ) : (
          sortedModules.map((module) => (
            <article
              key={module.id}
              className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface/30 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-theme-text/80">
                  {module.label} ({module.id})
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveModuleDraft(module.id)}
                  className="rounded border border-theme-border/20 px-2 py-0.5 text-[11px] text-theme-text/70 hover:bg-theme-surface-soft"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-theme-text/65">
                <span>slot: {module.slot}</span>
                <span>order: {module.order}</span>
                <span>enabled: {module.enabled ? "yes" : "no"}</span>
                <span>command: {module.action.commandId}</span>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="grid gap-1 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/75">Draft Diagnostics</div>
        {moduleDiagnostics.length === 0 ? (
          <div className="text-[11px] text-[var(--theme-success)]">no conflicts</div>
        ) : (
          moduleDiagnostics.map((item, index) => (
            <div
              key={`${item.code}-${index}`}
              className={
                item.level === "error"
                  ? "text-[11px] text-[var(--theme-danger)]"
                  : "text-[11px] text-[var(--theme-warning)]"
              }
            >
              [{item.code}] {item.message}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
