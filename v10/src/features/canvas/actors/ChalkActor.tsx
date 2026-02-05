"use client";

import { cn } from "@core/utils";
import { chalkTheme } from "@core/themes/chalkTheme";

type ChalkActorProps = {
  isMoving: boolean;
};

export function ChalkActor({ isMoving: _isMoving }: ChalkActorProps) {
  return (
    <div
      className={cn("relative")}
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
    </div>
  );
}
