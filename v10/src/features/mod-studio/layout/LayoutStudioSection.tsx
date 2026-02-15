"use client";

import { type UISlotName } from "@core/extensions/registry";
import { useModStudioStore } from "@features/store/useModStudioStore";

const normalizeModuleOrder = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export function LayoutStudioSection() {
  const layoutSlots = useModStudioStore((state) => state.draft.layout.slots);
  const updateLayoutSlot = useModStudioStore((state) => state.updateLayoutSlot);

  const handleModuleOrderChange = (slot: UISlotName, value: string) => {
    updateLayoutSlot(slot, { moduleOrder: normalizeModuleOrder(value) });
  };

  return (
    <div className="grid gap-3 text-xs text-white/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        Slot Layout Composer
      </div>
      {layoutSlots.map((slot) => (
        <section
          key={slot.slot}
          className="grid gap-2 rounded border border-white/10 bg-white/5 p-2"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-white/80">{slot.slot}</div>
            <label className="flex items-center gap-1 text-[11px] text-white/65">
              <input
                type="checkbox"
                checked={slot.hidden}
                onChange={(event) =>
                  updateLayoutSlot(slot.slot, { hidden: event.target.checked })
                }
              />
              hidden
            </label>
          </div>
          <label className="grid gap-1 text-[11px] text-white/65">
            Module order (comma-separated IDs)
            <input
              type="text"
              value={slot.moduleOrder.join(", ")}
              onChange={(event) =>
                handleModuleOrderChange(slot.slot, event.target.value)
              }
              className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
            />
          </label>
        </section>
      ))}
    </div>
  );
}
