import { create } from "zustand";

import type { AlignmentGuide } from "@features/hooks/useSnap";

export type ViewMode = "edit" | "presentation";
export type ViewportState = {
  zoomLevel: number;
  panOffset: { x: number; y: number };
};

interface ViewportStoreState {
  isOverviewMode: boolean;
  overviewZoom: number;
  overviewViewportRatio: "16:9" | "4:3";
  viewport: ViewportState;
  isViewportInteracting: boolean;
  isGestureLocked: boolean;
  activeGestureLocks: string[];
  viewMode: ViewMode;
  guides: AlignmentGuide[];
  toggleOverviewMode: () => void;
  setOverviewZoom: (zoom: number) => void;
  setOverviewViewportRatio: (ratio: "16:9" | "4:3") => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  setViewportZoom: (level: number) => void;
  setViewportPan: (x: number, y: number) => void;
  resetViewport: () => void;
  setViewportInteracting: (value: boolean) => void;
  acquireGestureLock: (owner: string) => void;
  releaseGestureLock: (owner: string) => void;
  clearGestureLocks: () => void;
  setGuides: (guides: AlignmentGuide[]) => void;
  clearGuides: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const useViewportStore = create<ViewportStoreState>((set) => ({
  isOverviewMode: false,
  overviewZoom: 0.4,
  overviewViewportRatio: "16:9",
  viewport: { zoomLevel: 1, panOffset: { x: 0, y: 0 } },
  isViewportInteracting: false,
  isGestureLocked: false,
  activeGestureLocks: [],
  viewMode: "edit",
  guides: [],
  toggleOverviewMode: () =>
    set((state) => ({ isOverviewMode: !state.isOverviewMode })),
  setOverviewZoom: (zoom) =>
    set(() => ({ overviewZoom: Math.min(1, Math.max(0.2, zoom)) })),
  setOverviewViewportRatio: (ratio) =>
    set(() => ({ overviewViewportRatio: ratio })),
  setViewMode: (mode) => set(() => ({ viewMode: mode })),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "edit" ? "presentation" : "edit",
    })),
  setViewportZoom: (level) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoomLevel: clamp(level, 0.1, 5),
      },
    })),
  setViewportPan: (x, y) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        panOffset: { x, y },
      },
    })),
  resetViewport: () =>
    set(() => ({
      viewport: { zoomLevel: 1, panOffset: { x: 0, y: 0 } },
      isViewportInteracting: false,
    })),
  setViewportInteracting: (value) =>
    set(() => ({ isViewportInteracting: value })),
  acquireGestureLock: (owner) =>
    set((state) => {
      if (!owner || state.activeGestureLocks.includes(owner)) return state;
      const activeGestureLocks = [...state.activeGestureLocks, owner];
      return {
        activeGestureLocks,
        isGestureLocked: activeGestureLocks.length > 0,
      };
    }),
  releaseGestureLock: (owner) =>
    set((state) => {
      if (!owner) return state;
      const activeGestureLocks = state.activeGestureLocks.filter(
        (activeOwner) => activeOwner !== owner
      );
      if (activeGestureLocks.length === state.activeGestureLocks.length) {
        return state;
      }
      return {
        activeGestureLocks,
        isGestureLocked: activeGestureLocks.length > 0,
      };
    }),
  clearGestureLocks: () =>
    set((state) => {
      if (!state.isGestureLocked && state.activeGestureLocks.length === 0) {
        return state;
      }
      return {
        activeGestureLocks: [],
        isGestureLocked: false,
      };
    }),
  setGuides: (guides) => set(() => ({ guides })),
  clearGuides: () => set(() => ({ guides: [] })),
}));
