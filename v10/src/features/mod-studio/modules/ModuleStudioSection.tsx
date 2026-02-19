"use client";

import { useMemo, useState } from "react";

import { listAppCommands } from "@core/engine/commandBus";
import { listKnownUISlotNames, type UISlotName } from "@core/extensions/registry";
import type { ModuleDraft } from "@features/mod-studio/core/types";
import { getModuleDiagnostics } from "@features/mod-studio/modules/moduleDiagnostics";
import { useModStudioStore } from "@features/store/useModStudioStore";

const createModuleSeed = (): ModuleDraft => ({
  id: "",
  label: "",
  slot: listKnownUISlotNames()[0],
  enabled: true,
  order: 0,
  action: {
    commandId: "nextStep",
    payload: {},
  },
});

export function ModuleStudioSection() {
  const modules = useModStudioStore((state) => state.draft.modules);
  const upsertModuleDraft = useModStudioStore((state) => state.upsertModuleDraft);
  const removeModuleDraft = useModStudioStore((state) => state.removeModuleDraft);
  const [seed, setSeed] = useState<ModuleDraft>(createModuleSeed);

  const knownCommands = listAppCommands();
  const knownCommandIds = useMemo(
    () => new Set(knownCommands.map((command) => command.id)),
    [knownCommands]
  );
  const diagnostics = useMemo(
    () => getModuleDiagnostics(modules, knownCommandIds),
    [modules, knownCommandIds]
  );

  const handleAdd = () => {
    const normalizedId = seed.id.trim();
    if (!normalizedId) return;
    upsertModuleDraft({
      ...seed,
      id: normalizedId,
      label: seed.label.trim() || normalizedId,
    });
    setSeed(createModuleSeed());
  };

  const knownSlots = listKnownUISlotNames();

  return (
    <div className="grid gap-3 text-xs text-theme-text/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">
        Module Manager
      </div>

      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
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
            onChange={(event) =>
              setSeed((prev) => ({ ...prev, label: event.target.value }))
            }
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
        {modules
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((module) => (
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
                  onClick={() => removeModuleDraft(module.id)}
                  className="rounded border border-theme-border/20 px-2 py-0.5 text-[11px] text-theme-text/70 hover:bg-theme-surface-soft"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-theme-text/65">
                <span>slot: {module.slot}</span>
                <span>order: {module.order}</span>
                <span>command: {module.action.commandId}</span>
              </div>
            </article>
          ))}
      </section>

      <section className="grid gap-1 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/75">Diagnostics</div>
        {diagnostics.length === 0 ? (
          <div className="text-[11px] text-[var(--theme-success)]">no conflicts</div>
        ) : (
          diagnostics.map((item, index) => (
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
