"use client";

import { useMemo } from "react";

import { getBoardSize } from "@core/config/boardSpec";
import { useLocalStore } from "@features/store/useLocalStore";
import { useSyncStore } from "@features/store/useSyncStore";
import { useUIStore } from "@features/store/useUIStoreBridge";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toSourceLabel = (sourceId: string): string => {
  const normalized = sourceId.trim();
  if (normalized.length <= 8) return normalized;
  return normalized.slice(normalized.length - 8).toUpperCase();
};

export function PresenceOverlay() {
  const role = useLocalStore((state) => state.role);
  const trustedRoleClaim = useLocalStore((state) => state.trustedRoleClaim);
  const ratio = useUIStore((state) => state.overviewViewportRatio);
  const remotePresences = useSyncStore((state) => state.remotePresences);

  const effectiveRole = trustedRoleClaim ?? role;
  const boardSize = useMemo(() => getBoardSize(ratio), [ratio]);

  const activePresences = useMemo(
    () =>
      remotePresences
        .filter((presence) => presence.laserPosition !== null)
        .map((presence) => ({
          ...presence,
          laserPosition: {
            x: clamp(presence.laserPosition?.x ?? 0, 0, boardSize.width),
            y: clamp(presence.laserPosition?.y ?? 0, 0, boardSize.height),
          },
        })),
    [boardSize.height, boardSize.width, remotePresences]
  );

  if (effectiveRole !== "student" || activePresences.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      {activePresences.map((presence) => (
        <div
          key={presence.sourceId}
          className="pointer-events-none absolute"
          style={{
            left: presence.laserPosition.x,
            top: presence.laserPosition.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="pointer-events-none absolute -inset-3 rounded-full border border-[color:var(--theme-primary)]/45" />
          <div className="pointer-events-none h-2.5 w-2.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_16px_color-mix(in_srgb,var(--theme-primary)_85%,transparent)]" />
          <div className="pointer-events-none absolute left-3 top-3 rounded bg-toolbar-surface/85 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em] text-[var(--theme-text)]">
            {toSourceLabel(presence.sourceId)}
          </div>
        </div>
      ))}
    </div>
  );
}
