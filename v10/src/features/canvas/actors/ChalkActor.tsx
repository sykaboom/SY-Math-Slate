"use client";

import { chalkTheme } from "@core/themes/chalkTheme";

type ChalkActorProps = {
  isMoving: boolean;
};

export function ChalkActor({ isMoving: _isMoving }: ChalkActorProps) {
  const isMoving = _isMoving;
  const holder = chalkTheme.holder;
  const bodyTop = chalkTheme.tipOffset.y - holder.body.thickness / 2;
  const totalLength = holder.tip.length + holder.body.length;
  return (
    <div
      data-moving={isMoving ? "true" : "false"}
      className="relative"
      style={{
        width: holder.frame.size,
        height: holder.frame.size,
      }}
    >
      <div
        className="absolute"
        style={{
          left: chalkTheme.tipOffset.x,
          top: bodyTop,
          width: totalLength,
          height: holder.body.thickness,
          transform: `rotate(${holder.angleDeg}deg)`,
          transformOrigin: "0 50%",
        }}
      >
        <div
          className="absolute"
          style={{
            left: 0,
            top: (holder.body.thickness - holder.tip.thickness) / 2,
            width: holder.tip.length,
            height: holder.tip.thickness,
            borderRadius: holder.tip.radius,
            background: chalkTheme.colors.tipGradient,
            boxShadow: chalkTheme.colors.tipGlow,
            border: `1px solid ${chalkTheme.colors.tipBorder}`,
          }}
        />
        <div
          className="absolute"
          style={{
            left: holder.tip.length,
            top: 0,
            width: holder.body.length,
            height: holder.body.thickness,
            borderRadius: holder.body.radius,
            border: `1px solid ${chalkTheme.colors.holderBorder}`,
            background: chalkTheme.colors.holderBackground,
            boxShadow: chalkTheme.colors.holderShadow,
          }}
        >
          <div
            className="absolute"
            style={{
              left: holder.body.bandOffset,
              top: 0,
              width: holder.body.bandWidth,
              height: holder.body.thickness,
              borderRadius: holder.body.radius,
              background: chalkTheme.colors.holderBand,
            }}
          />
          <div
            className="absolute"
            style={{
              left: holder.body.highlightOffset,
              top: (holder.body.thickness - holder.body.highlightThickness) / 2,
              width: holder.body.highlightLength,
              height: holder.body.highlightThickness,
              borderRadius: holder.body.highlightThickness,
              background: chalkTheme.colors.holderHighlight,
            }}
          />
        </div>
      </div>
    </div>
  );
}
