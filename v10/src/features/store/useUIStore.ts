import { create } from "zustand";

import type { PenType } from "@core/types/canvas";
import {
  type CapabilityKey,
  type CapabilityProfileName,
  getCapabilities,
} from "@core/config/capabilities";
import type { AlignmentGuide } from "@features/hooks/useSnap";

export type Tool = "pen" | "eraser" | "laser" | "hand" | "text";
export type LaserType = "standard" | "highlighter";
export type { PenType };

export type PanelId = "pen" | "laser" | null;
export type ViewMode = "edit" | "presentation";
export type ViewportState = {
  zoomLevel: number;
  panOffset: { x: number; y: number };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface UIState {
  activeTool: Tool;
  penColor: string;
  penWidth: number;
  penOpacity: number;
  penType: PenType;
  laserType: LaserType;
  laserColor: string;
  laserWidth: number;
  isPanelOpen: boolean;
  openPanel: PanelId;
  isPasteHelperOpen: boolean;
  isOverviewMode: boolean;
  overviewZoom: number;
  overviewViewportRatio: "16:9" | "4:3";
  viewport: ViewportState;
  isViewportInteracting: boolean;
  viewMode: ViewMode;
  capabilityProfile: CapabilityProfileName;
  guides: AlignmentGuide[];
  isAutoPlay: boolean;
  playSignal: number;
  playbackSpeed: number;
  autoPlayDelayMs: number;
  isPaused: boolean;
  skipSignal: number;
  stopSignal: number;
  isAnimating: boolean;
  isSoundEnabled: boolean;
  isDataInputOpen: boolean;
  showCursors: boolean;
  showBreakGuides: boolean;
  showCanvasBorder: boolean;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setPenOpacity: (opacity: number) => void;
  setPenType: (type: PenType) => void;
  setLaserType: (type: LaserType) => void;
  setLaserColor: (color: string) => void;
  setLaserWidth: (width: number) => void;
  togglePanel: (panel: Exclude<PanelId, null>) => void;
  openPasteHelper: () => void;
  closePasteHelper: () => void;
  toggleOverviewMode: () => void;
  setOverviewZoom: (zoom: number) => void;
  setOverviewViewportRatio: (ratio: "16:9" | "4:3") => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  setViewportZoom: (level: number) => void;
  setViewportPan: (x: number, y: number) => void;
  resetViewport: () => void;
  setViewportInteracting: (value: boolean) => void;
  setCapabilityProfile: (profile: CapabilityProfileName) => void;
  isCapabilityEnabled: (key: CapabilityKey) => boolean;
  setGuides: (guides: AlignmentGuide[]) => void;
  clearGuides: () => void;
  toggleAutoPlay: () => void;
  setAutoPlay: (value: boolean) => void;
  triggerPlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setAutoPlayDelay: (delayMs: number) => void;
  togglePause: () => void;
  setPaused: (value: boolean) => void;
  triggerSkip: () => void;
  triggerStop: () => void;
  setAnimating: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  openDataInput: () => void;
  closeDataInput: () => void;
  toggleDataInput: () => void;
  toggleCursors: () => void;
  toggleBreakGuides: () => void;
  toggleCanvasBorder: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTool: "pen",
  penColor: "#FFFF00",
  penWidth: 4,
  penOpacity: 80,
  penType: "ink",
  laserType: "standard",
  laserColor: "#FF3B30",
  laserWidth: 10,
  isPanelOpen: false,
  openPanel: null,
  isPasteHelperOpen: false,
  isOverviewMode: false,
  overviewZoom: 0.4,
  overviewViewportRatio: "16:9",
  viewport: { zoomLevel: 1, panOffset: { x: 0, y: 0 } },
  isViewportInteracting: false,
  viewMode: "edit",
  capabilityProfile: "advanced",
  guides: [],
  isAutoPlay: false,
  playSignal: 0,
  playbackSpeed: 1,
  autoPlayDelayMs: 1200,
  isPaused: false,
  skipSignal: 0,
  stopSignal: 0,
  isAnimating: false,
  isSoundEnabled: false,
  isDataInputOpen: false,
  showCursors: false,
  showBreakGuides: true,
  showCanvasBorder: true,
  setTool: (tool) =>
    set(() => ({
      activeTool: tool,
      isPanelOpen: false,
      openPanel: null,
    })),
  setColor: (color) => set(() => ({ penColor: color })),
  setPenWidth: (width) => set(() => ({ penWidth: width })),
  setPenOpacity: (opacity) => set(() => ({ penOpacity: opacity })),
  setPenType: (type) =>
    set((state) => {
      if (type === "ink") {
        return {
          penType: type,
          penWidth: 3,
          penOpacity: 100,
          penColor: state.penColor || "#FFFFFF",
        };
      }
      if (type === "pencil") {
        return {
          penType: type,
          penWidth: 2,
          penOpacity: 80,
          penColor: "#CCCCCC",
        };
      }
      return {
        penType: type,
        penWidth: 20,
        penOpacity: 30,
        penColor: "#FFFF00",
      };
    }),
  setLaserType: (type) =>
    set(() => ({
      laserType: type,
      laserWidth: type === "standard" ? 10 : 40,
      laserColor: type === "standard" ? "#FF3B30" : "#FFFF00",
    })),
  setLaserColor: (color) => set(() => ({ laserColor: color })),
  setLaserWidth: (width) => set(() => ({ laserWidth: width })),
  togglePanel: (panel) => {
    const { openPanel } = get();
    const nextPanel = openPanel === panel ? null : panel;
    set(() => ({
      openPanel: nextPanel,
      isPanelOpen: nextPanel !== null,
    }));
  },
  openPasteHelper: () => set(() => ({ isPasteHelperOpen: true })),
  closePasteHelper: () => set(() => ({ isPasteHelperOpen: false })),
  toggleOverviewMode: () =>
    set((state) => ({ isOverviewMode: !state.isOverviewMode })),
  setOverviewZoom: (zoom) =>
    set(() => ({ overviewZoom: Math.min(1, Math.max(0.2, zoom)) })),
  setOverviewViewportRatio: (ratio) =>
    set(() => ({ overviewViewportRatio: ratio })),
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
  setViewMode: (mode) => set(() => ({ viewMode: mode })),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "edit" ? "presentation" : "edit",
    })),
  setCapabilityProfile: (profile) => set(() => ({ capabilityProfile: profile })),
  isCapabilityEnabled: (key) =>
    getCapabilities(get().capabilityProfile).has(key),
  setGuides: (guides) => set(() => ({ guides })),
  clearGuides: () => set(() => ({ guides: [] })),
  toggleAutoPlay: () => set((state) => ({ isAutoPlay: !state.isAutoPlay })),
  setAutoPlay: (value) => set(() => ({ isAutoPlay: value })),
  triggerPlay: () =>
    set((state) => ({
      playSignal: state.playSignal + 1,
      isAnimating: true,
    })),
  setPlaybackSpeed: (speed) =>
    set(() => ({
      playbackSpeed: Math.max(0.1, Math.min(2, speed)),
    })),
  setAutoPlayDelay: (delayMs) =>
    set(() => ({
      autoPlayDelayMs: Math.max(300, Math.min(3000, Math.round(delayMs))),
    })),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPaused: (value) => set(() => ({ isPaused: value })),
  triggerSkip: () => set((state) => ({ skipSignal: state.skipSignal + 1 })),
  triggerStop: () => set((state) => ({ stopSignal: state.stopSignal + 1 })),
  setAnimating: (value) => set(() => ({ isAnimating: value })),
  setSoundEnabled: (value) => set(() => ({ isSoundEnabled: value })),
  openDataInput: () => set(() => ({ isDataInputOpen: true })),
  closeDataInput: () => set(() => ({ isDataInputOpen: false })),
  toggleDataInput: () =>
    set((state) => ({ isDataInputOpen: !state.isDataInputOpen })),
  toggleCursors: () => set((state) => ({ showCursors: !state.showCursors })),
  toggleBreakGuides: () =>
    set((state) => ({ showBreakGuides: !state.showBreakGuides })),
  toggleCanvasBorder: () =>
    set((state) => ({ showCanvasBorder: !state.showCanvasBorder })),
}));
