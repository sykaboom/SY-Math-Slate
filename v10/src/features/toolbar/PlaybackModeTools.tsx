"use client";

import { dispatchCommand } from "@core/engine/commandBus";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import {
  ChevronsLeft,
  ChevronsRight,
  Redo2,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useSFX } from "@features/hooks/useSFX";
import { PageNavigator } from "./PageNavigator";
import { PlaybackControls } from "./PlaybackControls";
import { ToolButton } from "./atoms/ToolButton";
import { publishToolbarNotice } from "./toolbarFeedback";

type PlaybackModeToolsProps = {
  compact?: boolean;
  showPlaybackExtras: boolean;
};

export function PlaybackModeTools({
  compact = false,
  showPlaybackExtras,
}: PlaybackModeToolsProps) {
  const { isOverviewMode } = useUIStore();
  const { pages, currentPageId, currentStep, strokeRedoByPage } =
    useCanvasStore();
  const { enableSound, disableSound, isSoundEnabled } = useSFX();

  const currentItems = pages[currentPageId] ?? [];
  const canUndo = currentItems.some((item) => item.type === "stroke");
  const canRedo = (strokeRedoByPage[currentPageId]?.length ?? 0) > 0;
  const maxStep = Object.values(pages).reduce((max, items) => {
    return items.reduce((innerMax, item) => {
      if (item.type !== "text" && item.type !== "image") return innerMax;
      const stepIndex =
        typeof item.stepIndex === "number" ? item.stepIndex : 0;
      return Math.max(innerMax, stepIndex);
    }, max);
  }, -1);
  const canStepPrev = currentStep > 0;
  const canStepNext = currentStep <= maxStep;
  const totalSteps = Math.max(maxStep + 1, 0);
  const displayStep =
    totalSteps === 0 ? 0 : Math.min(currentStep + 1, totalSteps);

  const dispatchToolbarCommand = (commandId: string, payload: unknown = {}) => {
    void dispatchCommand(commandId, payload, {
      meta: { source: "toolbar.playback-mode" },
    }).catch(() => {
      publishToolbarNotice({
        tone: "error",
        message: "요청을 처리하지 못했습니다.",
      });
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

  if (compact) {
    return (
      <>
        <ToolButton
          icon={Undo2}
          label="Undo"
          onClick={() => dispatchToolbarCommand("undo")}
          disabled={!canUndo || isOverviewMode}
          className="h-11 w-11 shrink-0"
        />
        <ToolButton
          icon={Redo2}
          label="Redo"
          onClick={() => dispatchToolbarCommand("redo")}
          disabled={!canRedo || isOverviewMode}
          className="h-11 w-11 shrink-0"
        />
        <ToolButton
          icon={ChevronsLeft}
          label="Previous Step"
          onClick={() => dispatchToolbarCommand("prevStep")}
          disabled={!canStepPrev}
          className="h-11 w-11 shrink-0"
        />
        <ToolButton
          icon={ChevronsRight}
          label="Next Step"
          onClick={() => dispatchToolbarCommand("nextStep")}
          disabled={!canStepNext}
          className="h-11 w-11 shrink-0"
        />
        <ToolButton
          icon={isSoundEnabled ? Volume2 : VolumeX}
          label={isSoundEnabled ? "Sound On" : "Sound Off"}
          active={isSoundEnabled}
          onClick={() => {
            void handleSoundToggle();
          }}
          className="h-11 w-11 shrink-0"
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1 text-[11px] text-toolbar-text/70">
        <ToolButton
          icon={ChevronsLeft}
          label="Previous Step"
          onClick={() => dispatchToolbarCommand("prevStep")}
          disabled={!canStepPrev}
          className="h-8 w-8"
        />
        <span className="min-w-[44px] text-center">
          {displayStep}/{totalSteps}
        </span>
        <ToolButton
          icon={ChevronsRight}
          label="Next Step"
          onClick={() => dispatchToolbarCommand("nextStep")}
          disabled={!canStepNext}
          className="h-8 w-8"
        />
      </div>
      <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1">
        <ToolButton
          icon={Undo2}
          label="Undo"
          onClick={() => dispatchToolbarCommand("undo")}
          disabled={!canUndo || isOverviewMode}
          className="h-8 w-8"
        />
        <ToolButton
          icon={Redo2}
          label="Redo"
          onClick={() => dispatchToolbarCommand("redo")}
          disabled={!canRedo || isOverviewMode}
          className="h-8 w-8"
        />
      </div>
      {showPlaybackExtras && <PlaybackControls />}
      {showPlaybackExtras && <PageNavigator />}
      <ToolButton
        icon={isSoundEnabled ? Volume2 : VolumeX}
        label={isSoundEnabled ? "Sound On" : "Sound Off"}
        active={isSoundEnabled}
        onClick={() => {
          void handleSoundToggle();
        }}
      />
    </>
  );
}
