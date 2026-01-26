"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioState = {
  src: string | null;
  isPlaying: boolean;
  duration: number | null;
};

const unlockState = { unlocked: false, loading: false };

const createAudio = () => {
  if (typeof Audio === "undefined") return null;
  const audio = new Audio();
  audio.preload = "auto";
  return audio;
};

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);
  const playIdRef = useRef(0);
  const [state, setState] = useState<AudioState>({
    src: null,
    isPlaying: false,
    duration: null,
  });

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = createAudio();
    }
    return audioRef.current;
  }, []);

  const unlock = useCallback(async () => {
    if (unlockState.unlocked || unlockState.loading) {
      return unlockState.unlocked;
    }
    unlockState.loading = true;
    const audio = ensureAudio();
    if (!audio) {
      unlockState.loading = false;
      return false;
    }
    try {
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      unlockState.unlocked = true;
    } catch {
      unlockState.unlocked = false;
    } finally {
      unlockState.loading = false;
    }
    return unlockState.unlocked;
  }, [ensureAudio]);

  const stop = useCallback(() => {
    const audio = ensureAudio();
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore stop errors.
    }
    resolveRef.current?.();
    resolveRef.current = null;
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [ensureAudio]);

  const pause = useCallback(() => {
    const audio = ensureAudio();
    if (!audio) return;
    try {
      audio.pause();
    } catch {
      // Ignore pause errors.
    }
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [ensureAudio]);

  const resume = useCallback(async () => {
    const audio = ensureAudio();
    if (!audio) return false;
    try {
      await audio.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
      return true;
    } catch {
      setState((prev) => ({ ...prev, isPlaying: false }));
      return false;
    }
  }, [ensureAudio]);

  const play = useCallback(
    async (src: string) => {
      const audio = ensureAudio();
      if (!audio) return;
      stop();
      const playId = playIdRef.current + 1;
      playIdRef.current = playId;
      let settled = false;

      const finalize = () => {
        if (playIdRef.current !== playId || settled) return;
        settled = true;
        resolveRef.current = null;
        setState((prev) => ({ ...prev, isPlaying: false }));
      };

      const playPromise = new Promise<void>((resolve) => {
        resolveRef.current = () => {
          finalize();
          resolve();
        };
        audio.onended = () => {
          finalize();
          resolve();
        };
        audio.onerror = () => {
          finalize();
          resolve();
        };
        audio.onloadedmetadata = () => {
          if (playIdRef.current !== playId) return;
          setState((prev) => ({
            ...prev,
            duration: Number.isFinite(audio.duration) ? audio.duration : null,
          }));
        };
        audio.src = src;
        audio.currentTime = 0;
        setState({
          src,
          isPlaying: true,
          duration: Number.isFinite(audio.duration) ? audio.duration : null,
        });
      });

      await unlock();
      try {
        await audio.play();
      } catch {
        finalize();
      }
      await playPromise;
    },
    [ensureAudio, stop, unlock]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    play,
    stop,
    pause,
    resume,
    unlock,
    state,
  };
}
