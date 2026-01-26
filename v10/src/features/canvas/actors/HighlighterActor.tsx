"use client";

import { cn } from "@core/utils";

type HighlighterActorProps = {
  x: number;
  y: number;
  visible: boolean;
  isMoving: boolean;
};

const TIP_OFFSET = { x: 10, y: 18 };

export function HighlighterActor({ x, y, visible, isMoving }: HighlighterActorProps) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-[15] transition-transform duration-100 ease-linear"
      style={{ transform: `translate(${x - TIP_OFFSET.x}px, ${y - TIP_OFFSET.y}px)` }}
    >
      <div
        className={cn(
          "relative h-11 w-7 rounded-md bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 shadow-[0_0_12px_rgba(255,255,0,0.35)]",
          "border border-yellow-100/60"
        )}
      >
        <div className="absolute -bottom-2 left-1/2 h-3 w-5 -translate-x-1/2 rounded-sm bg-yellow-100" />
      </div>
    </div>
  );
}
