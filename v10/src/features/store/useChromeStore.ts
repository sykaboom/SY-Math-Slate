import { create } from "zustand";

export type PanelId = "pen" | "laser" | null;
export type FullscreenInkMode = "off" | "native" | "app";

interface ChromeStoreState {
  isPanelOpen: boolean;
  openPanel: PanelId;
  isPasteHelperOpen: boolean;
  isDataInputOpen: boolean;
  fullscreenInkMode: FullscreenInkMode;
  showCursors: boolean;
  showBreakGuides: boolean;
  showCanvasBorder: boolean;
  togglePanel: (panel: Exclude<PanelId, null>) => void;
  closePanel: () => void;
  openPasteHelper: () => void;
  closePasteHelper: () => void;
  openDataInput: () => void;
  closeDataInput: () => void;
  toggleDataInput: () => void;
  setFullscreenInkMode: (mode: FullscreenInkMode) => void;
  enterFullscreenInkNative: () => void;
  enterFullscreenInkFallback: () => void;
  exitFullscreenInk: () => void;
  toggleCursors: () => void;
  toggleBreakGuides: () => void;
  toggleCanvasBorder: () => void;
}

export const useChromeStore = create<ChromeStoreState>((set, get) => ({
  isPanelOpen: false,
  openPanel: null,
  isPasteHelperOpen: false,
  isDataInputOpen: false,
  fullscreenInkMode: "off",
  showCursors: false,
  showBreakGuides: true,
  showCanvasBorder: true,
  togglePanel: (panel) => {
    const { openPanel } = get();
    const nextPanel = openPanel === panel ? null : panel;
    set(() => ({
      openPanel: nextPanel,
      isPanelOpen: nextPanel !== null,
    }));
  },
  closePanel: () =>
    set(() => ({
      isPanelOpen: false,
      openPanel: null,
    })),
  openPasteHelper: () => set(() => ({ isPasteHelperOpen: true })),
  closePasteHelper: () => set(() => ({ isPasteHelperOpen: false })),
  openDataInput: () => set(() => ({ isDataInputOpen: true })),
  closeDataInput: () => set(() => ({ isDataInputOpen: false })),
  toggleDataInput: () =>
    set((state) => ({ isDataInputOpen: !state.isDataInputOpen })),
  setFullscreenInkMode: (mode) => set(() => ({ fullscreenInkMode: mode })),
  enterFullscreenInkNative: () => set(() => ({ fullscreenInkMode: "native" })),
  enterFullscreenInkFallback: () => set(() => ({ fullscreenInkMode: "app" })),
  exitFullscreenInk: () => set(() => ({ fullscreenInkMode: "off" })),
  toggleCursors: () => set((state) => ({ showCursors: !state.showCursors })),
  toggleBreakGuides: () =>
    set((state) => ({ showBreakGuides: !state.showBreakGuides })),
  toggleCanvasBorder: () =>
    set((state) => ({ showCanvasBorder: !state.showCanvasBorder })),
}));
