"use client";

import { ChalkActor } from "@features/canvas/actors/ChalkActor";
import { HighlighterActor } from "@features/canvas/actors/HighlighterActor";

export type ActorState = {
  x: number;
  y: number;
  visible: boolean;
  isMoving: boolean;
  type: "chalk" | "marker";
};

export function ActorLayer({ actor }: { actor: ActorState }) {
  if (!actor.visible) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: "var(--z-actor)" }}
    >
      {actor.type === "marker" ? (
        <HighlighterActor
          x={actor.x}
          y={actor.y}
          visible={actor.visible}
          isMoving={actor.isMoving}
        />
      ) : (
        <ChalkActor
          x={actor.x}
          y={actor.y}
          visible={actor.visible}
          isMoving={actor.isMoving}
        />
      )}
    </div>
  );
}
