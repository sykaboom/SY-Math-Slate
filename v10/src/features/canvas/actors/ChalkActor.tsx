"use client";

import { cn } from "@core/utils";
import { chalkTheme } from "@core/themes/chalkTheme";

type ChalkActorProps = {
  x: number;
  y: number;
  visible: boolean;
  isMoving: boolean;
};

const TIP_OFFSET = chalkTheme.tipOffset;

export function ChalkActor({ x, y, visible, isMoving }: ChalkActorProps) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-[15] transition-transform duration-100 ease-linear"
      style={{
        transform: `translate(${x - TIP_OFFSET.x}px, ${y - TIP_OFFSET.y}px)`,
      }}
    >
      <div
        className={cn("relative", isMoving && "actor-bob")}
        style={{
          width: chalkTheme.actor.holder.width,
          height: chalkTheme.actor.holder.height,
          borderRadius: chalkTheme.actor.holder.radius,
          border: `1px solid ${chalkTheme.colors.holderBorder}`,
          background: chalkTheme.colors.holderBackground,
          boxShadow: chalkTheme.colors.holderShadow,
        }}
      >
        <div
          className="absolute"
          style={{
            left: chalkTheme.actor.chalk.offsetX,
            top: chalkTheme.actor.chalk.offsetY,
            width: chalkTheme.actor.chalk.width,
            height: chalkTheme.actor.chalk.height,
            borderRadius: 999,
            transform: `rotate(${chalkTheme.actor.chalk.rotateDeg}deg)`,
            background: chalkTheme.colors.chalkGradient,
            boxShadow: chalkTheme.colors.chalkGlow,
          }}
        />
        <div
          className="absolute"
          style={{
            left: chalkTheme.actor.accent.offsetX,
            top: chalkTheme.actor.accent.offsetY,
            width: chalkTheme.actor.accent.width,
            height: chalkTheme.actor.accent.height,
            borderRadius: 999,
            background: chalkTheme.colors.accentHighlight,
          }}
        />
      </div>
    </div>
  );
}
