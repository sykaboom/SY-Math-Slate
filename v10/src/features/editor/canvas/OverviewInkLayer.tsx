"use client";

import { cn } from "@core/utils";
import { useOverlayCanvas } from "@features/platform/hooks/useOverlayCanvas";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

export function OverviewInkLayer() {
  const { canvasRef, laserCanvasRef, bind } = useOverlayCanvas();
  const { activeTool } = useUIStore();
  const isDrawingMode = ["pen", "laser"].includes(activeTool);
  const pointerClass = isDrawingMode
    ? "pointer-events-auto"
    : "pointer-events-none";

  return (
    <div
      className={cn("absolute inset-0 z-30", pointerClass)}
      style={{ touchAction: "none" }}
      {...bind}
    >
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 h-full w-full", pointerClass)}
      />
      <canvas
        ref={laserCanvasRef}
        className={cn("absolute inset-0 h-full w-full", pointerClass)}
      />
    </div>
  );
}
