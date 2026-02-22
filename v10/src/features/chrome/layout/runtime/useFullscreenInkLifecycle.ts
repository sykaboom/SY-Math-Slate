"use client";

import { useCallback, useEffect, type RefObject } from "react";

import {
  enterFullscreenInkRuntime,
  exitFullscreenInkRuntime,
} from "@features/chrome/shared/fullscreenInkRuntime";

type UseFullscreenInkLifecycleOptions = {
  layoutRootRef: RefObject<HTMLDivElement | null>;
  closeDataInput: () => void;
  enterFullscreenInkNative: () => void;
  enterFullscreenInkFallback: () => void;
  exitFullscreenInk: () => void;
  fullscreenInkMode: string;
  isNativeFullscreen: boolean;
  isDataInputOpen: boolean;
  isFullscreenInkActive: boolean;
};

export const useFullscreenInkLifecycle = ({
  layoutRootRef,
  closeDataInput,
  enterFullscreenInkNative,
  enterFullscreenInkFallback,
  exitFullscreenInk,
  fullscreenInkMode,
  isNativeFullscreen,
  isDataInputOpen,
  isFullscreenInkActive,
}: UseFullscreenInkLifecycleOptions): {
  handleEnterFullscreenInk: () => Promise<void>;
  handleExitFullscreenInk: () => Promise<void>;
} => {
  const handleEnterFullscreenInk = useCallback(async () => {
    await enterFullscreenInkRuntime({
      rootNode: layoutRootRef.current,
      onBeforeEnter: closeDataInput,
      onEnterNative: enterFullscreenInkNative,
      onEnterFallback: enterFullscreenInkFallback,
    });
  }, [
    closeDataInput,
    enterFullscreenInkFallback,
    enterFullscreenInkNative,
    layoutRootRef,
  ]);

  const handleExitFullscreenInk = useCallback(async () => {
    await exitFullscreenInkRuntime({
      isNativeFullscreen,
      onExit: exitFullscreenInk,
    });
  }, [exitFullscreenInk, isNativeFullscreen]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) return;
      if (fullscreenInkMode === "native") {
        exitFullscreenInk();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [exitFullscreenInk, fullscreenInkMode]);

  useEffect(() => {
    if (!isDataInputOpen || !isFullscreenInkActive) return;
    exitFullscreenInk();
  }, [exitFullscreenInk, isDataInputOpen, isFullscreenInkActive]);

  return {
    handleEnterFullscreenInk,
    handleExitFullscreenInk,
  };
};
