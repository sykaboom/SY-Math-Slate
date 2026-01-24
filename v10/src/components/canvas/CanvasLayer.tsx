"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

export function CanvasLayer() {
  const { canvasRef, laserCanvasRef, bind } = useCanvas();
  const { activeTool } = useUIStore();
  const isDrawingMode = ["pen", "eraser", "laser"].includes(activeTool);
  const pointerClass = isDrawingMode
    ? "pointer-events-auto"
    : "pointer-events-none";

  return (
    <div
      className={cn("absolute inset-0 z-20", pointerClass)}
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
