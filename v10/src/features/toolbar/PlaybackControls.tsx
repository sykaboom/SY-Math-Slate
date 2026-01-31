"use client";

import { useMemo } from "react";
import type { WheelEvent } from "react";

import { Popover, PopoverTrigger } from "@ui/components/popover";
import { Slider } from "@ui/components/slider";
import { cn } from "@core/utils";
import { useUIStore } from "@features/store/useUIStore";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { Pause, Play, Repeat, SkipForward, Square } from "lucide-react";

import { ToolButton } from "./atoms/ToolButton";
import { ToolbarPanel } from "./atoms/ToolbarPanel";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function PlaybackControls() {
  const {
    isAutoPlay,
    setAutoPlay,
    triggerPlay,
    togglePause,
    triggerStop,
    triggerSkip,
    playbackSpeed,
    autoPlayDelayMs,
    setPlaybackSpeed,
    setAutoPlayDelay,
    isAnimating,
    isPaused,
    setPaused,
    isCapabilityEnabled,
  } = useUIStore();
  const { pages, currentStep, goToStep, stepBlocks } = useCanvasStore();
  const maxStep = useMemo(() => {
    if (stepBlocks.length > 0) return stepBlocks.length - 1;
    return Object.values(pages).reduce((max, items) => {
      return items.reduce((innerMax, item) => {
        if (item.type !== "text" && item.type !== "image") return innerMax;
        const stepIndex =
          typeof item.stepIndex === "number" ? item.stepIndex : 0;
        return Math.max(innerMax, stepIndex);
      }, max);
    }, -1);
  }, [pages, stepBlocks]);
  const totalSteps = Math.max(maxStep + 1, 0);

  const speedLabel = useMemo(() => playbackSpeed.toFixed(2), [playbackSpeed]);
  const delayLabel = useMemo(
    () => (autoPlayDelayMs / 1000).toFixed(1),
    [autoPlayDelayMs]
  );
  const canAutoPlay = isCapabilityEnabled("playback.autoplay");
  const canTiming = isCapabilityEnabled("playback.timing");

  const handlePlay = () => {
    if (isPaused) {
      setPaused(false);
    }
    if (currentStep > maxStep) return;
    triggerPlay();
  };

  const handleStepJump = (value: number) => {
    const target = Math.round(value);
    if (target < 0 || target > maxStep + 1) return;
    goToStep(target);
  };

  const handleAutoToggle = () => {
    if (isAutoPlay) {
      setAutoPlay(false);
      return;
    }
    setAutoPlay(true);
    if (isPaused) {
      setPaused(false);
    }
    if (currentStep > maxStep) return;
    triggerPlay();
  };

  const handleSpeedWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const direction = event.deltaY < 0 ? 1 : -1;
    const next = clamp(playbackSpeed + direction * 0.05, 0.1, 2);
    setPlaybackSpeed(next);
  };

  const handleDelayWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const direction = event.deltaY < 0 ? 1 : -1;
    const next = clamp(autoPlayDelayMs + direction * 100, 300, 3000);
    setAutoPlayDelay(next);
  };

  const handleStepWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (maxStep < 0) return;
    const direction = event.deltaY < 0 ? 1 : -1;
    const next = clamp(currentStep + direction, 0, maxStep + 1);
    goToStep(next);
  };

  const handleWheelCapture = (event: WheelEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("[data-speed-wheel]")) {
      handleSpeedWheel(event);
      return;
    }
    if (target.closest("[data-step-wheel]")) {
      handleStepWheel(event);
      return;
    }
    if (target.closest("[data-delay-wheel]")) {
      handleDelayWheel(event);
    }
  };

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60"
      onWheelCapture={handleWheelCapture}
    >
      <ToolButton
        icon={Play}
        label="Play"
        onClick={handlePlay}
        disabled={isAnimating && !isPaused}
        className="h-8 w-8"
      />
      <ToolButton
        icon={isPaused ? Play : Pause}
        label={isPaused ? "Resume" : "Pause"}
        onClick={togglePause}
        disabled={!isAnimating}
        className="h-8 w-8"
      />
      <ToolButton
        icon={Square}
        label="Stop"
        onClick={triggerStop}
        disabled={!isAnimating}
        className="h-8 w-8"
      />
      <ToolButton
        icon={SkipForward}
        label="Skip"
        onClick={triggerSkip}
        disabled={!isAnimating}
        className="h-8 w-8"
      />
      {canAutoPlay && (
        <ToolButton
          icon={Repeat}
          label="Auto Play"
          active={isAutoPlay}
          onClick={handleAutoToggle}
          className="h-8 w-8"
        />
      )}

      {canTiming && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-speed-wheel
              onWheel={handleSpeedWheel}
              onWheelCapture={handleSpeedWheel}
              onDoubleClick={() => setPlaybackSpeed(1)}
              className={cn(
                "rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70",
                "hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              )}
              title="Speed"
            >
              Speed {speedLabel}x
            </button>
          </PopoverTrigger>
          <ToolbarPanel side="top" align="center" sideOffset={18}>
            <div className="flex w-48 items-center gap-3">
              <Slider
                value={[playbackSpeed]}
                min={0.1}
                max={2}
                step={0.05}
                onValueChange={(value) => setPlaybackSpeed(value[0])}
              />
              <span className="w-10 text-right text-xs text-white/80">
                {speedLabel}x
              </span>
            </div>
          </ToolbarPanel>
        </Popover>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-step-wheel
            className={cn(
              "rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70",
              "hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            )}
            title="Jump to Step"
          >
            Step {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
          </button>
        </PopoverTrigger>
        <ToolbarPanel side="top" align="center" sideOffset={18}>
          <div className="flex w-48 items-center gap-3" data-step-wheel>
            <Slider
              value={[Math.min(currentStep, maxStep + 1)]}
              min={0}
              max={Math.max(maxStep + 1, 0)}
              step={1}
              onValueChange={(value) => handleStepJump(value[0])}
            />
            <span className="w-10 text-right text-xs text-white/80">
              {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
            </span>
          </div>
        </ToolbarPanel>
      </Popover>

      {canTiming && canAutoPlay && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-delay-wheel
              onWheel={handleDelayWheel}
              onWheelCapture={handleDelayWheel}
              onDoubleClick={() => setAutoPlayDelay(1200)}
              className={cn(
                "rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70",
                "hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              )}
              title="Auto-play Delay"
            >
              Delay {delayLabel}s
            </button>
          </PopoverTrigger>
          <ToolbarPanel side="top" align="center" sideOffset={18}>
            <div className="flex w-48 items-center gap-3">
              <Slider
                value={[autoPlayDelayMs]}
                min={300}
                max={3000}
                step={100}
                onValueChange={(value) => setAutoPlayDelay(value[0])}
              />
              <span className="w-10 text-right text-xs text-white/80">
                {delayLabel}s
              </span>
            </div>
          </ToolbarPanel>
        </Popover>
      )}
    </div>
  );
}
