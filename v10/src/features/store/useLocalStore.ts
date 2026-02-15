import { create } from "zustand";

import type { SharedViewportState } from "./useSyncStore";

export type LocalRole = "host" | "student";

interface LocalStoreState {
  role: LocalRole;
  trustedRoleClaim: LocalRole | null;
  isPanelOpen: boolean;
  localViewport: SharedViewportState;
  setRole: (role: LocalRole) => void;
  setTrustedRoleClaim: (role: LocalRole | null) => void;
  clearTrustedRoleClaim: () => void;
  setPanelOpen: (isOpen: boolean) => void;
  setLocalViewport: (viewport: SharedViewportState) => void;
}

const INITIAL_VIEWPORT: SharedViewportState = {
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
};

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const cloneViewport = (viewport: SharedViewportState): SharedViewportState => ({
  zoomLevel: normalizeFinite(viewport.zoomLevel, 1),
  panOffset: {
    x: normalizeFinite(viewport.panOffset.x, 0),
    y: normalizeFinite(viewport.panOffset.y, 0),
  },
});

export const useLocalStore = create<LocalStoreState>((set) => ({
  role: "host",
  trustedRoleClaim: null,
  isPanelOpen: false,
  localViewport: INITIAL_VIEWPORT,
  setRole: (role) =>
    set(() => ({
      role,
    })),
  setTrustedRoleClaim: (role) =>
    set(() => ({
      trustedRoleClaim: role,
    })),
  clearTrustedRoleClaim: () =>
    set(() => ({
      trustedRoleClaim: null,
    })),
  setPanelOpen: (isOpen) =>
    set(() => ({
      isPanelOpen: isOpen,
    })),
  setLocalViewport: (viewport) =>
    set(() => ({
      localViewport: cloneViewport(viewport),
    })),
}));
