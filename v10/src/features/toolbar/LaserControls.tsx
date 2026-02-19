"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@ui/components/toggle-group";
import { dispatchCommand } from "@core/engine/commandBus";
import { cn } from "@core/utils";
import { useUIStore, type LaserType } from "@features/store/useUIStoreBridge";

const laserColors = [
  { label: "Red", value: "#FF3B30", className: "bg-toolbar-danger" },
  { label: "Yellow", value: "#FFFF00", className: "bg-swatch-yellow" },
  { label: "Cyan", value: "#00FFFF", className: "bg-swatch-cyan" },
];

export function LaserControls() {
  const { laserType, laserColor } = useUIStore();
  const normalizedLaserColor = laserColor.toLowerCase();

  const dispatchLaserCommand = (commandId: string, payload: unknown) => {
    void dispatchCommand(commandId, payload, {
      meta: { source: "toolbar.laser-controls" },
    }).catch(() => undefined);
  };

  return (
    <div className="flex w-72 flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-toolbar-muted/60">
          Laser Type
        </p>
        <ToggleGroup
          type="single"
          value={laserType}
          onValueChange={(value) =>
            value &&
            dispatchLaserCommand("setLaserType", { laserType: value as LaserType })
          }
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-toolbar-muted/60">
          Color
        </p>
        <div className="mt-3 flex items-center gap-2">
          {laserColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() =>
                dispatchLaserCommand("setLaserColor", { color: color.value })
              }
              className={cn(
                "h-7 w-7 rounded-full border border-toolbar-border/10 transition",
                color.className,
                normalizedLaserColor === color.value.toLowerCase()
                  ? "ring-2 ring-toolbar-active-bg"
                  : "hover:scale-110"
              )}
              aria-label={color.label}
            />
          ))}
          <label className="relative flex h-7 w-7 items-center justify-center rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 text-toolbar-text/70 transition hover:scale-110">
            <input
              type="color"
              value={laserColor}
              onChange={(event) =>
                dispatchLaserCommand("setLaserColor", {
                  color: event.target.value,
                })
              }
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Custom color"
            />
            <span className="text-[10px] font-semibold">+</span>
          </label>
        </div>
      </div>
    </div>
  );
}
