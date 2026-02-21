"use client";

import { type UISlotName } from "@core/runtime/plugin-runtime/registry";
import { useModStudioStore } from "@features/platform/store/useModStudioStore";

const normalizeModuleOrder = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export function LayoutStudioSection() {
  const layoutSlots = useModStudioStore((state) => state.draft.layout.slots);
  const template = useModStudioStore((state) => state.draft.template);
  const updateLayoutSlot = useModStudioStore((state) => state.updateLayoutSlot);
  const updateTemplateDraft = useModStudioStore(
    (state) => state.updateTemplateDraft
  );

  const handleModuleOrderChange = (slot: UISlotName, value: string) => {
    updateLayoutSlot(slot, { moduleOrder: normalizeModuleOrder(value) });
  };

  return (
    <div className="grid gap-3 text-xs text-theme-text/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">
        Slot Layout Composer
      </div>
      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/80">
          Template Metadata
        </div>
        <label className="grid gap-1 text-[11px] text-theme-text/65">
          Template Pack ID
          <input
            type="text"
            value={template.packId}
            onChange={(event) =>
              updateTemplateDraft({ packId: event.target.value })
            }
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
        </label>
        <label className="grid gap-1 text-[11px] text-theme-text/65">
          Template Title
          <input
            type="text"
            value={template.title}
            onChange={(event) =>
              updateTemplateDraft({ title: event.target.value })
            }
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
        </label>
        <label className="grid gap-1 text-[11px] text-theme-text/65">
          Description
          <input
            type="text"
            value={template.description}
            onChange={(event) =>
              updateTemplateDraft({ description: event.target.value })
            }
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-theme-text/65">
          <input
            type="checkbox"
            checked={template.defaultEnabled}
            onChange={(event) =>
              updateTemplateDraft({ defaultEnabled: event.target.checked })
            }
          />
          Default enabled
        </label>
      </section>
      {layoutSlots.map((slot) => (
        <section
          key={slot.slot}
          className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-theme-text/80">{slot.slot}</div>
            <label className="flex items-center gap-1 text-[11px] text-theme-text/65">
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
          <label className="grid gap-1 text-[11px] text-theme-text/65">
            Module order (comma-separated IDs)
            <input
              type="text"
              value={slot.moduleOrder.join(", ")}
              onChange={(event) =>
                handleModuleOrderChange(slot.slot, event.target.value)
              }
              className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
            />
          </label>
        </section>
      ))}
    </div>
  );
}
