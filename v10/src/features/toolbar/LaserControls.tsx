"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@ui/components/toggle-group";
import { cn } from "@core/utils";
import { useUIStore, type LaserType } from "@features/store/useUIStore";

const laserColors = [
  { label: "Red", value: "#FF3B30" },
  { label: "Yellow", value: "#FFFF00" },
  { label: "Cyan", value: "#00FFFF" },
];

export function LaserControls() {
  const { laserType, laserColor, setLaserType, setLaserColor } = useUIStore();

  return (
    <div className="flex w-72 flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Laser Type
        </p>
        <ToggleGroup
          type="single"
          value={laserType}
          onValueChange={(value) => value && setLaserType(value as LaserType)}
          className="mt-3 grid grid-cols-2 gap-2"
        >
          <ToggleGroupItem value="standard" className="text-xs">
            Standard
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
          {laserColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setLaserColor(color.value)}
              className={cn(
                "h-7 w-7 rounded-full border border-white/10 transition",
                laserColor === color.value
                  ? "ring-2 ring-neon-cyan"
                  : "hover:scale-110"
              )}
              style={{ backgroundColor: color.value }}
              aria-label={color.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
