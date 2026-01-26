"use client";

import { useCallback, useEffect, useRef } from "react";

import { useUIStore } from "@features/store/useUIStore";

type SfxType = "chalk" | "marker";

type SfxState = {
  unlocked: boolean;
  loading: boolean;
};

const audioCache: Partial<Record<SfxType, HTMLAudioElement>> = {};
const stateCache: SfxState = { unlocked: false, loading: false };

const getAudio = (type: SfxType) => {
  if (typeof Audio === "undefined") return null;
  if (!audioCache[type]) {
    const src = type === "chalk" ? "/sfx/chalk.mp3" : "/sfx/marker.mp3";
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audioCache[type] = audio;
  }
  return audioCache[type] ?? null;
};

export function useSFX() {
  const isSoundEnabled = useUIStore((state) => state.isSoundEnabled);
  const setSoundEnabled = useUIStore((state) => state.setSoundEnabled);
  const activeRef = useRef<HTMLAudioElement | null>(null);

  const unlock = useCallback(async () => {
    if (stateCache.unlocked || stateCache.loading) return stateCache.unlocked;
    stateCache.loading = true;
    const audio = getAudio("chalk");
    if (!audio) {
      stateCache.loading = false;
      return false;
    }
    try {
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      stateCache.unlocked = true;
    } catch {
      stateCache.unlocked = false;
    } finally {
      stateCache.loading = false;
    }
    return stateCache.unlocked;
  }, []);

  const enableSound = useCallback(async () => {
    const ok = await unlock();
    if (ok) {
      setSoundEnabled(true);
      return true;
    }
    setSoundEnabled(false);
    return false;
  }, [setSoundEnabled, unlock]);

  const disableSound = useCallback(() => {
    setSoundEnabled(false);
  }, [setSoundEnabled]);

  const play = useCallback(
    async (type: SfxType) => {
      if (!isSoundEnabled) return;
      const ok = await unlock();
      if (!ok) return;
      const audio = getAudio(type);
      if (!audio) return;
      try {
        if (activeRef.current && activeRef.current !== audio) {
          activeRef.current.pause();
        }
        activeRef.current = audio;
        audio.currentTime = 0;
        await audio.play();
      } catch {
        // Ignore play errors.
      }
    },
    [isSoundEnabled, unlock]
  );

  const stop = useCallback(() => {
    const audio = activeRef.current;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore stop errors.
    }
  }, []);

  useEffect(() => {
    if (!isSoundEnabled) {
      stop();
    }
  }, [isSoundEnabled, stop]);

  return {
    unlock,
    enableSound,
    disableSound,
    play,
    stop,
    isSoundEnabled,
    isUnlocked: stateCache.unlocked,
  };
}
