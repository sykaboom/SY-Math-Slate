import { create } from "zustand";

import type { LiveSessionMeta } from "@core/types/snapshot";

export type ActiveHostSession = {
  shareId: string;
  hostActorId: string;
  liveSession: LiveSessionMeta | null;
};

type HostShareStoreState = {
  activeSession: ActiveHostSession | null;
  setActiveSession: (session: ActiveHostSession) => void;
  clearActiveSession: () => void;
};

const normalizeText = (value: string): string => value.trim();

const normalizeLiveSession = (
  value: LiveSessionMeta | null
): LiveSessionMeta | null => {
  if (!value) return null;

  return {
    enabled: value.enabled === true,
    transport: "websocket",
    channelId: normalizeText(value.channelId),
    relayUrl:
      typeof value.relayUrl === "string" && value.relayUrl.trim().length > 0
        ? value.relayUrl.trim()
        : null,
  };
};

export const useHostShareStore = create<HostShareStoreState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => {
    const shareId = normalizeText(session.shareId);
    const hostActorId = normalizeText(session.hostActorId);
    if (shareId.length === 0 || hostActorId.length === 0) {
      set({ activeSession: null });
      return;
    }

    set({
      activeSession: {
        shareId,
        hostActorId,
        liveSession: normalizeLiveSession(session.liveSession),
      },
    });
  },
  clearActiveSession: () => set({ activeSession: null }),
}));
