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
  setGuides: (guides) => set(() => ({ guides })),
  clearGuides: () => set(() => ({ guides: [] })),
}));
