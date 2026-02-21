import { create } from "zustand";

import type { CapabilityKey, CapabilityProfileName } from "@core/config/capabilities";
import type { AlignmentGuide } from "@features/hooks/useSnap";

import { useCapabilityStore } from "./useCapabilityStore";
import {
  useChromeStore,
  type FullscreenInkMode,
  type PanelId,
  type ToolbarDockEdge,
  type ToolbarPlacement,
} from "./useChromeStore";
import { usePlaybackStore } from "./usePlaybackStore";
import { useModStore } from "./useModStore";
import { useToolStore, type LaserType, type PenType, type Tool } from "./useToolStore";
import { useViewportStore, type ViewMode, type ViewportState } from "./useViewportStore";

export type { Tool, LaserType, PenType } from "./useToolStore";
export type {
  FullscreenInkMode,
  PanelId,
  ToolbarDockEdge,
  ToolbarPlacement,
} from "./useChromeStore";
export type { ViewMode, ViewportState } from "./useViewportStore";

export interface UIState {
  activeTool: Tool;
  penColor: string;
  penWidth: number;
  penOpacity: number;
  penType: PenType;
  laserType: LaserType;
  laserColor: string;
  laserWidth: number;
  eraserWidth: number;
  isPanelOpen: boolean;
  openPanel: PanelId;
  isPasteHelperOpen: boolean;
  isOverviewMode: boolean;
  overviewZoom: number;
  overviewViewportRatio: "16:9" | "4:3";
  viewport: ViewportState;
  isViewportInteracting: boolean;
  isGestureLocked: boolean;
  activeGestureLocks: string[];
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
  fullscreenInkMode: FullscreenInkMode;
  toolbarPlacement: ToolbarPlacement;
  showCursors: boolean;
  showBreakGuides: boolean;
  showCanvasBorder: boolean;
  activePackageId?: string | null;
  activeModId?: string | null;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setPenOpacity: (opacity: number) => void;
  setPenType: (type: PenType) => void;
  setLaserType: (type: LaserType) => void;
  setLaserColor: (color: string) => void;
  setLaserWidth: (width: number) => void;
  setEraserWidth: (width: number) => void;
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
  acquireGestureLock: (owner: string) => void;
  releaseGestureLock: (owner: string) => void;
  clearGestureLocks: () => void;
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
  setFullscreenInkMode: (mode: FullscreenInkMode) => void;
  setToolbarPlacement: (placement: ToolbarPlacement) => void;
  setToolbarDockEdge: (edge: ToolbarDockEdge) => void;
  setToolbarFloating: () => void;
  enterFullscreenInkNative: () => void;
  enterFullscreenInkFallback: () => void;
  exitFullscreenInk: () => void;
  toggleCursors: () => void;
  toggleBreakGuides: () => void;
  toggleCanvasBorder: () => void;
}

const getToolSliceState = () => {
  const state = useToolStore.getState();
  return {
    activeTool: state.activeTool,
    penColor: state.penColor,
    penWidth: state.penWidth,
    penOpacity: state.penOpacity,
    penType: state.penType,
    laserType: state.laserType,
    laserColor: state.laserColor,
    laserWidth: state.laserWidth,
    eraserWidth: state.eraserWidth,
  };
};

const getViewportSliceState = () => {
  const state = useViewportStore.getState();
  return {
    isOverviewMode: state.isOverviewMode,
    overviewZoom: state.overviewZoom,
    overviewViewportRatio: state.overviewViewportRatio,
    viewport: state.viewport,
    isViewportInteracting: state.isViewportInteracting,
    isGestureLocked: state.isGestureLocked,
    activeGestureLocks: state.activeGestureLocks,
    viewMode: state.viewMode,
    guides: state.guides,
  };
};

const getPlaybackSliceState = () => {
  const state = usePlaybackStore.getState();
  return {
    isAutoPlay: state.isAutoPlay,
    playSignal: state.playSignal,
    playbackSpeed: state.playbackSpeed,
    autoPlayDelayMs: state.autoPlayDelayMs,
    isPaused: state.isPaused,
    skipSignal: state.skipSignal,
    stopSignal: state.stopSignal,
    isAnimating: state.isAnimating,
    isSoundEnabled: state.isSoundEnabled,
  };
};

const getChromeSliceState = () => {
  const state = useChromeStore.getState();
  return {
    isPanelOpen: state.isPanelOpen,
    openPanel: state.openPanel,
    isPasteHelperOpen: state.isPasteHelperOpen,
    isDataInputOpen: state.isDataInputOpen,
    fullscreenInkMode: state.fullscreenInkMode,
    toolbarPlacement: state.toolbarPlacement,
    showCursors: state.showCursors,
    showBreakGuides: state.showBreakGuides,
    showCanvasBorder: state.showCanvasBorder,
  };
};

const getCapabilitySliceState = () => {
  const state = useCapabilityStore.getState();
  return {
    capabilityProfile: state.capabilityProfile,
  };
};

type ModStoreSliceState = {
  activePackageId: string | null;
  activeModId: string | null;
};

const getModSliceState = (): Partial<Pick<UIState, "activePackageId" | "activeModId">> => {
  const state = useModStore.getState() as ModStoreSliceState;
  return {
    activePackageId: state.activePackageId ?? null,
    activeModId: state.activeModId ?? null,
  };
};

export const useUIStoreBridge = create<UIState>(() => ({
  ...getToolSliceState(),
  ...getViewportSliceState(),
  ...getPlaybackSliceState(),
  ...getChromeSliceState(),
  ...getCapabilitySliceState(),
  ...getModSliceState(),
  setTool: (tool) => useToolStore.getState().setTool(tool),
  setColor: (color) => useToolStore.getState().setColor(color),
  setPenWidth: (width) => useToolStore.getState().setPenWidth(width),
  setPenOpacity: (opacity) => useToolStore.getState().setPenOpacity(opacity),
  setPenType: (type) => useToolStore.getState().setPenType(type),
  setLaserType: (type) => useToolStore.getState().setLaserType(type),
  setLaserColor: (color) => useToolStore.getState().setLaserColor(color),
  setLaserWidth: (width) => useToolStore.getState().setLaserWidth(width),
  setEraserWidth: (width) => useToolStore.getState().setEraserWidth(width),
  togglePanel: (panel) => useChromeStore.getState().togglePanel(panel),
  openPasteHelper: () => useChromeStore.getState().openPasteHelper(),
  closePasteHelper: () => useChromeStore.getState().closePasteHelper(),
  toggleOverviewMode: () => useViewportStore.getState().toggleOverviewMode(),
  setOverviewZoom: (zoom) => useViewportStore.getState().setOverviewZoom(zoom),
  setOverviewViewportRatio: (ratio) =>
    useViewportStore.getState().setOverviewViewportRatio(ratio),
  setViewMode: (mode) => useViewportStore.getState().setViewMode(mode),
  toggleViewMode: () => useViewportStore.getState().toggleViewMode(),
  setViewportZoom: (level) => useViewportStore.getState().setViewportZoom(level),
  setViewportPan: (x, y) => useViewportStore.getState().setViewportPan(x, y),
  resetViewport: () => useViewportStore.getState().resetViewport(),
  setViewportInteracting: (value) =>
    useViewportStore.getState().setViewportInteracting(value),
  acquireGestureLock: (owner) =>
    useViewportStore.getState().acquireGestureLock(owner),
  releaseGestureLock: (owner) =>
    useViewportStore.getState().releaseGestureLock(owner),
  clearGestureLocks: () => useViewportStore.getState().clearGestureLocks(),
  setCapabilityProfile: (profile) =>
    useCapabilityStore.getState().setCapabilityProfile(profile),
  isCapabilityEnabled: (key) =>
    useCapabilityStore.getState().isCapabilityEnabled(key),
  setGuides: (guides) => useViewportStore.getState().setGuides(guides),
  clearGuides: () => useViewportStore.getState().clearGuides(),
  toggleAutoPlay: () => usePlaybackStore.getState().toggleAutoPlay(),
  setAutoPlay: (value) => usePlaybackStore.getState().setAutoPlay(value),
  triggerPlay: () => usePlaybackStore.getState().triggerPlay(),
  setPlaybackSpeed: (speed) => usePlaybackStore.getState().setPlaybackSpeed(speed),
  setAutoPlayDelay: (delayMs) =>
    usePlaybackStore.getState().setAutoPlayDelay(delayMs),
  togglePause: () => usePlaybackStore.getState().togglePause(),
  setPaused: (value) => usePlaybackStore.getState().setPaused(value),
  triggerSkip: () => usePlaybackStore.getState().triggerSkip(),
  triggerStop: () => usePlaybackStore.getState().triggerStop(),
  setAnimating: (value) => usePlaybackStore.getState().setAnimating(value),
  setSoundEnabled: (value) => usePlaybackStore.getState().setSoundEnabled(value),
  openDataInput: () => useChromeStore.getState().openDataInput(),
  closeDataInput: () => useChromeStore.getState().closeDataInput(),
  toggleDataInput: () => useChromeStore.getState().toggleDataInput(),
  setFullscreenInkMode: (mode) => useChromeStore.getState().setFullscreenInkMode(mode),
  setToolbarPlacement: (placement) =>
    useChromeStore.getState().setToolbarPlacement(placement),
  setToolbarDockEdge: (edge) => useChromeStore.getState().setToolbarDockEdge(edge),
  setToolbarFloating: () => useChromeStore.getState().setToolbarFloating(),
  enterFullscreenInkNative: () => useChromeStore.getState().enterFullscreenInkNative(),
  enterFullscreenInkFallback: () =>
    useChromeStore.getState().enterFullscreenInkFallback(),
  exitFullscreenInk: () => useChromeStore.getState().exitFullscreenInk(),
  toggleCursors: () => useChromeStore.getState().toggleCursors(),
  toggleBreakGuides: () => useChromeStore.getState().toggleBreakGuides(),
  toggleCanvasBorder: () => useChromeStore.getState().toggleCanvasBorder(),
}));

export const useUIStore = useUIStoreBridge;

useToolStore.subscribe(() => {
  useUIStoreBridge.setState(getToolSliceState());
});

useViewportStore.subscribe(() => {
  useUIStoreBridge.setState(getViewportSliceState());
});

usePlaybackStore.subscribe(() => {
  useUIStoreBridge.setState(getPlaybackSliceState());
});

useChromeStore.subscribe(() => {
  useUIStoreBridge.setState(getChromeSliceState());
});

useCapabilityStore.subscribe(() => {
  useUIStoreBridge.setState(getCapabilitySliceState());
});
useModStore.subscribe(() => {
  useUIStoreBridge.setState(getModSliceState());
});
