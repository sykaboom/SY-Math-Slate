"use client";

import { useMemo } from "react";

import { cn } from "@core/utils";

type PageGuidesProps = {
  columnCount: number;
  className?: string;
};

export function PageGuides({ columnCount, className }: PageGuidesProps) {
  const safeColumns = Math.max(1, Math.min(4, columnCount));
  const columns = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => i),
    [safeColumns]
  );

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-5", className)}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-[28px] border border-white/20 bg-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
      <div className="absolute inset-0 p-12">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
            columnGap: "3rem",
          }}
        >
          {columns.map((index) => (
            <div
              key={index}
              className={cn(
                "h-full",
                index < safeColumns - 1 &&
                  "border-r border-white/20 shadow-[1px_0_0_rgba(255,255,255,0.06)]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
