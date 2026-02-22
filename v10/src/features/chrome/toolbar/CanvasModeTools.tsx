"use client";

import { useUIStore } from "@features/platform/store/useUIStoreBridge";
import { useSFX } from "@features/platform/hooks/useSFX";
import {
  enterFullscreenInkRuntime,
  exitFullscreenInkRuntime,
} from "@features/chrome/shared/fullscreenInkRuntime";
import { Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";

import { ToolButton } from "./atoms/ToolButton";
import { publishToolbarNotice } from "./toolbarFeedback";

type CanvasModeToolsProps = {
  compact?: boolean;
  showFullscreen: boolean;
  showSoundToggle: boolean;
};

export function CanvasModeTools({
  compact = false,
  showFullscreen,
  showSoundToggle,
}: CanvasModeToolsProps) {
  const {
    fullscreenInkMode,
    enterFullscreenInkNative,
    enterFullscreenInkFallback,
    exitFullscreenInk,
    closeDataInput,
  } = useUIStore();
  const { enableSound, disableSound, isSoundEnabled } = useSFX();

  const isNativeFullscreen = fullscreenInkMode === "native";
  const isFullscreenInkActive = fullscreenInkMode !== "off";

  const handleEnterFullscreenInk = async () => {
    await enterFullscreenInkRuntime({
      rootNode:
        typeof document === "undefined" ? null : document.documentElement,
      onBeforeEnter: closeDataInput,
      onEnterNative: enterFullscreenInkNative,
      onEnterFallback: enterFullscreenInkFallback,
    });
  };

  const handleExitFullscreenInk = async () => {
    await exitFullscreenInkRuntime({
      isNativeFullscreen,
      onExit: exitFullscreenInk,
    });
  };

  const handleSoundToggle = async () => {
    if (isSoundEnabled) {
      disableSound();
      publishToolbarNotice({ tone: "info", message: "사운드를 껐습니다." });
      return;
    }
    const ok = await enableSound();
    if (!ok) {
      publishToolbarNotice({
        tone: "error",
        message: "소리 재생이 차단되었습니다. 화면을 한 번 눌러주세요.",
      });
      return;
    }
    publishToolbarNotice({ tone: "success", message: "사운드를 켰습니다." });
  };

  return (
    <>
      {showFullscreen && (
        <ToolButton
          icon={isFullscreenInkActive ? Minimize2 : Maximize2}
          label={isFullscreenInkActive ? "필기 전체화면 종료" : "필기 전체화면"}
          active={isFullscreenInkActive}
          onClick={() => {
            if (isFullscreenInkActive) {
              void handleExitFullscreenInk();
              return;
            }
            void handleEnterFullscreenInk();
          }}
          className={compact ? "h-11 w-11 shrink-0" : undefined}
          data-layout-id={
            isFullscreenInkActive
              ? "action_exit_fullscreen_ink_toolbar"
              : "action_enter_fullscreen_ink_toolbar"
          }
        />
      )}
      {showSoundToggle && (
        <ToolButton
          icon={isSoundEnabled ? Volume2 : VolumeX}
          label={isSoundEnabled ? "Sound On" : "Sound Off"}
          active={isSoundEnabled}
          onClick={() => {
            void handleSoundToggle();
          }}
          className={compact ? "h-11 w-11 shrink-0" : undefined}
        />
      )}
    </>
  );
}
