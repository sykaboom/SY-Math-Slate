import { create } from "zustand";

interface PlaybackStoreState {
  isAutoPlay: boolean;
  playSignal: number;
  playbackSpeed: number;
  autoPlayDelayMs: number;
  isPaused: boolean;
  skipSignal: number;
  stopSignal: number;
  isAnimating: boolean;
  isSoundEnabled: boolean;
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
}

export const usePlaybackStore = create<PlaybackStoreState>((set) => ({
  isAutoPlay: false,
  playSignal: 0,
  playbackSpeed: 1,
  autoPlayDelayMs: 1200,
  isPaused: false,
  skipSignal: 0,
  stopSignal: 0,
  isAnimating: false,
  isSoundEnabled: false,
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
}));
