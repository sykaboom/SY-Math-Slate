"use client";

import { useCanvas } from "@features/hooks/useCanvas";
import { cn } from "@core/utils";
import { useUIStore } from "@features/store/useUIStore";

export function CanvasLayer() {
  const { canvasRef, laserCanvasRef, bind } = useCanvas();
  const { activeTool, viewMode } = useUIStore();
  const isDrawingMode =
    viewMode !== "presentation" && ["pen", "eraser", "laser"].includes(activeTool);
  const pointerClass = isDrawingMode
    ? "pointer-events-auto"
    : "pointer-events-none";

  return (
    <div
      className={cn("absolute inset-0 z-20", pointerClass)}
      style={{ touchAction: "none" }}
      {...(isDrawingMode ? bind : {})}
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
