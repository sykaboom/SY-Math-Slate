"use client";

import { useMemo, useState } from "react";

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

  const diagnostics = useMemo(() => getModuleDiagnostics(modules), [modules]);

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
    <div className="grid gap-3 text-xs text-white/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        Module Manager
      </div>

      <section className="grid gap-2 rounded border border-white/10 bg-white/5 p-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="module id"
            value={seed.id}
            onChange={(event) => setSeed((prev) => ({ ...prev, id: event.target.value }))}
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <input
            type="text"
            placeholder="label"
            value={seed.label}
            onChange={(event) =>
              setSeed((prev) => ({ ...prev, label: event.target.value }))
            }
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <select
            value={seed.slot}
            onChange={(event) =>
              setSeed((prev) => ({ ...prev, slot: event.target.value as UISlotName }))
            }
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
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
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <input
            type="text"
            placeholder="command id"
            value={seed.action.commandId}
            onChange={(event) =>
              setSeed((prev) => ({
                ...prev,
                action: { ...prev.action, commandId: event.target.value },
              }))
            }
            className="col-span-2 rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="w-fit rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
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
              className="grid gap-2 rounded border border-white/10 bg-black/30 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-white/80">
                  {module.label} ({module.id})
                </div>
                <button
                  type="button"
                  onClick={() => removeModuleDraft(module.id)}
                  className="rounded border border-white/20 px-2 py-0.5 text-[11px] text-white/70 hover:bg-white/10"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/65">
                <span>slot: {module.slot}</span>
                <span>order: {module.order}</span>
                <span>command: {module.action.commandId}</span>
              </div>
            </article>
          ))}
      </section>

      <section className="grid gap-1 rounded border border-white/10 bg-white/5 p-2">
        <div className="text-[11px] font-semibold text-white/75">Diagnostics</div>
        {diagnostics.length === 0 ? (
          <div className="text-[11px] text-emerald-200">no conflicts</div>
        ) : (
          diagnostics.map((item, index) => (
            <div
              key={`${item.code}-${index}`}
              className={
                item.level === "error"
                  ? "text-[11px] text-rose-200"
                  : "text-[11px] text-amber-200"
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
