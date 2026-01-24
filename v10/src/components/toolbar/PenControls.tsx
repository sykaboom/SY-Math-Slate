"use client";

import { Slider } from "@/components/ui/slider";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useUIStore, type PenType } from "@/store/useUIStore";

const colorPresets = [
  { label: "Yellow", value: "#FFFF00" },
  { label: "Green", value: "#39FF14" },
  { label: "Cyan", value: "#00FFFF" },
  { label: "Pink", value: "#FF10F0" },
  { label: "White", value: "#FFFFFF" },
];

export function PenControls() {
  const {
    penColor,
    penWidth,
    penOpacity,
    penType,
    setColor,
    setPenWidth,
    setPenOpacity,
    setPenType,
  } = useUIStore();

  return (
    <div className="flex w-80 flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Pen Type
        </p>
        <ToggleGroup
          type="single"
          value={penType}
          onValueChange={(value) => value && setPenType(value as PenType)}
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Color
        </p>
        <div className="mt-3 flex items-center gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setColor(preset.value)}
              className={cn(
                "h-7 w-7 rounded-full border border-white/10 transition",
                penColor.toLowerCase() === preset.value.toLowerCase()
                  ? "ring-2 ring-neon-cyan"
                  : "hover:scale-110"
              )}
              style={{ backgroundColor: preset.value }}
              aria-label={preset.label}
            />
          ))}
          <label
            className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/10"
            style={{ backgroundColor: penColor }}
          >
            <input
              type="color"
              value={penColor}
              onChange={(event) => setColor(event.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Custom color"
            />
            <span className="text-[10px] font-semibold text-black/70">+</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Thickness</span>
          <span>{penWidth}px</span>
        </div>
        <Slider
          value={[penWidth]}
          min={1}
          max={18}
          step={1}
          onValueChange={(value) => setPenWidth(value[0] ?? penWidth)}
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Opacity</span>
          <span>{penOpacity}%</span>
        </div>
        <Slider
          value={[penOpacity]}
          min={10}
          max={100}
          step={5}
          onValueChange={(value) => setPenOpacity(value[0] ?? penOpacity)}
          className="mt-2"
        />
      </div>
    </div>
  );
}
