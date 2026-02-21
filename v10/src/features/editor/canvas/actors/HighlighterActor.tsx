"use client";

import { cn } from "@core/utils";

type HighlighterActorProps = {
  isMoving: boolean;
};

export function HighlighterActor({ isMoving }: HighlighterActorProps) {
  return (
    <div
      className={cn(
        "relative h-11 w-7 rounded-md bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 shadow-[0_0_12px_rgba(255,255,0,0.35)]",
        "border border-yellow-100/60",
        isMoving && "actor-bob"
      )}
    >
      <div className="absolute -bottom-2 left-1/2 h-3 w-5 -translate-x-1/2 rounded-sm bg-yellow-100" />
    </div>
  );
}
