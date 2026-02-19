"use client";

import { Slider } from "@ui/components/slider";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@ui/components/toggle-group";
import { cn } from "@core/utils";
import { useUIStore, type PenType } from "@features/store/useUIStoreBridge";
import { fireToolbarCommand } from "./toolbarFeedback";

const colorPresets = [
  { label: "Graphite", value: "#1F2937" },
  { label: "Blue", value: "#2563EB" },
  { label: "Green", value: "#15803D" },
  { label: "Orange", value: "#D97706" },
  { label: "Red", value: "#DC2626" },
  { label: "White", value: "#FFFFFF" },
];

export function PenControls() {
  const { penColor, penWidth, penOpacity, penType } = useUIStore();
  const normalizedPenColor = penColor.toLowerCase();

  const dispatchPenCommand = (commandId: string, payload: unknown) => {
    fireToolbarCommand({
      commandId,
      payload,
      source: "toolbar.pen-controls",
      errorMessage: "펜 설정을 적용하지 못했습니다.",
    });
  };

  return (
    <div className="flex w-80 flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-toolbar-muted/60">
          Pen Type
        </p>
        <ToggleGroup
          type="single"
          value={penType}
          onValueChange={(value) =>
            value &&
            dispatchPenCommand("setPenType", { penType: value as PenType })
          }
          className="mt-3 grid grid-cols-3 gap-2"
        >
          <ToggleGroupItem value="ink" className="text-xs">
            Ink
          </ToggleGroupItem>
          <ToggleGroupItem value="pencil" className="text-xs">
            Pencil
          </ToggleGroupItem>
          <ToggleGroupItem value="highlighter" className="text-xs">
            Highlighter
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-toolbar-muted/60">
          Color
        </p>
        <div className="mt-3 flex items-center gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() =>
                dispatchPenCommand("setPenColor", { color: preset.value })
              }
              className={cn(
                "h-7 w-7 rounded-full border border-toolbar-border/10 transition",
                normalizedPenColor === preset.value.toLowerCase()
                  ? "ring-2 ring-toolbar-active-bg"
                  : "hover:scale-110"
              )}
              style={{ backgroundColor: preset.value }}
              aria-label={preset.label}
            />
          ))}
          <label
            className="relative flex h-7 w-7 items-center justify-center rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 text-toolbar-text/70 transition hover:scale-110"
          >
            <input
              type="color"
              value={penColor}
              onChange={(event) =>
                dispatchPenCommand("setPenColor", { color: event.target.value })
              }
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Custom color"
            />
            <span className="text-[10px] font-semibold">+</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-toolbar-muted/60">
          <span>Thickness</span>
          <span>{penWidth}px</span>
        </div>
        <Slider
          value={[penWidth]}
          min={1}
          max={18}
          step={1}
          onValueChange={(value) =>
            dispatchPenCommand("setPenWidth", { width: value[0] ?? penWidth })
          }
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-toolbar-muted/60">
          <span>Opacity</span>
          <span>{penOpacity}%</span>
        </div>
        <Slider
          value={[penOpacity]}
          min={10}
          max={100}
          step={5}
          onValueChange={(value) =>
            dispatchPenCommand("setPenOpacity", { opacity: value[0] ?? penOpacity })
          }
          className="mt-2"
        />
      </div>
    </div>
  );
}
