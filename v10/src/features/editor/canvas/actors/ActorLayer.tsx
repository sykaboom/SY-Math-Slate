"use client";

import type { RefObject } from "react";

import { ChalkActor } from "@features/editor/canvas/actors/ChalkActor";
import { HighlighterActor } from "@features/editor/canvas/actors/HighlighterActor";

export type ActorState = {
  visible: boolean;
  isMoving: boolean;
  type: "chalk" | "marker";
};

export function ActorLayer({
  actor,
  actorRef,
}: {
  actor: ActorState;
  actorRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: "var(--z-actor)" }}
    >
      <div
        ref={actorRef}
        className={`absolute left-0 top-0 will-change-transform ${
          actor.visible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!actor.visible}
      >
        {actor.type === "marker" ? (
          <HighlighterActor isMoving={actor.isMoving} />
        ) : (
          <ChalkActor isMoving={actor.isMoving} />
        )}
      </div>
    </div>
  );
}
