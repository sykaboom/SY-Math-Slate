"use client";

import { useCanvas } from "@features/hooks/useCanvas";
import { cn } from "@core/utils";
import { useLocalStore } from "@features/store/useLocalStore";
import { useUIStore } from "@features/store/useUIStoreBridge";

export function CanvasLayer() {
  const { canvasRef, laserCanvasRef, bind } = useCanvas();
  const role = useLocalStore((state) => state.role);
  const { activeTool, viewMode } = useUIStore();
  const isStudent = role === "student";
  const isDrawingMode =
    viewMode !== "presentation" && ["pen", "eraser", "laser"].includes(activeTool);
  const pointerClass = isStudent
    ? "pointer-events-none"
    : isDrawingMode
      ? "pointer-events-auto"
      : "pointer-events-none";

  return (
    <div
      className={cn("absolute inset-0 z-20", pointerClass)}
      style={{ touchAction: "none" }}
      {...(isDrawingMode && !isStudent ? bind : {})}
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
