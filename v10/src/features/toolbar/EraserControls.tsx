"use client";

import { dispatchCommand } from "@core/engine/commandBus";
import {
  ERASER_WIDTH_MAX,
  ERASER_WIDTH_MIN,
  useToolStore,
} from "@features/store/useToolStore";
import { Slider } from "@ui/components/slider";

export function EraserControls() {
  const eraserWidth = useToolStore((state) => state.eraserWidth);

  const dispatchEraserCommand = (commandId: string, payload: unknown) => {
    void dispatchCommand(commandId, payload, {
      meta: { source: "toolbar.eraser-controls" },
    }).catch(() => undefined);
  };

  return (
    <div className="flex w-72 flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-toolbar-muted/60">
          Eraser
        </p>
        <p className="mt-1 text-[11px] text-toolbar-muted/60">
          Adjust erase footprint.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-toolbar-muted/60">
          <span>Width</span>
          <span>{eraserWidth}px</span>
        </div>
        <Slider
          value={[eraserWidth]}
          min={ERASER_WIDTH_MIN}
          max={ERASER_WIDTH_MAX}
          step={1}
          onValueChange={(value) =>
            dispatchEraserCommand("setEraserWidth", {
              width: value[0] ?? eraserWidth,
            })
          }
          className="mt-2"
        />
      </div>
    </div>
  );
}
