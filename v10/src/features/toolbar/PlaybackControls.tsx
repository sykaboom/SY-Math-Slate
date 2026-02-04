"use client";

import { useMemo } from "react";

import { Popover, PopoverTrigger } from "@ui/components/popover";
import { Slider } from "@ui/components/slider";
import { cn } from "@core/utils";
import { useUIStore } from "@features/store/useUIStore";
import { useCanvasStore } from "@features/store/useCanvasStore";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
  Settings2,
  Square,
} from "lucide-react";

import { ToolButton } from "./atoms/ToolButton";
import { ToolbarPanel } from "./atoms/ToolbarPanel";

export function PlaybackControls() {
  const {
    isAutoPlay,
    setAutoPlay,
    triggerPlay,
    togglePause,
    triggerStop,
    playbackSpeed,
    autoPlayDelayMs,
    setPlaybackSpeed,
    setAutoPlayDelay,
    isAnimating,
    isPaused,
    setPaused,
    isCapabilityEnabled,
  } = useUIStore();
  const { pages, currentStep, prevStep, nextStep, goToStep, stepBlocks } =
    useCanvasStore();
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
  const displayStep =
    totalSteps === 0 ? 0 : Math.min(currentStep + 1, totalSteps);
  const canStepPrev = currentStep > 0;
  const canStepNext = currentStep <= maxStep;
  const canStepJump = totalSteps > 1;
  const stepSliderMax = Math.max(maxStep + 1, 0);
  const stepSliderValue = Math.min(currentStep, stepSliderMax);

  const speedLabel = useMemo(() => playbackSpeed.toFixed(2), [playbackSpeed]);
  const delayLabel = useMemo(
    () => (autoPlayDelayMs / 1000).toFixed(1),
    [autoPlayDelayMs]
  );
  const canAutoPlay = isCapabilityEnabled("playback.autoplay");
  const canTiming = isCapabilityEnabled("playback.timing");
  const showSettings = canAutoPlay || canTiming;

  const handlePlayToggle = () => {
    if (isAnimating) {
      togglePause();
      return;
    }
    if (isPaused) {
      setPaused(false);
    }
    if (currentStep > maxStep) return;
    triggerPlay();
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

  const handleStepJump = (value: number) => {
    const target = Math.round(value);
    if (target < 0 || target > maxStep + 1) return;
    goToStep(target);
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
      <ToolButton
        icon={isAnimating && !isPaused ? Pause : Play}
        label={isAnimating ? (isPaused ? "Resume" : "Pause") : "Play"}
        onClick={handlePlayToggle}
        className="h-8 w-8"
      />
      <ToolButton
        icon={Square}
        label="Stop"
        onClick={triggerStop}
        disabled={!isAnimating && !isPaused}
        className="h-8 w-8"
      />
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
        <ToolButton
          icon={ChevronLeft}
          label="Previous Step"
          onClick={prevStep}
          disabled={!canStepPrev}
          className="h-7 w-7"
        />
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white disabled:text-white/40"
              disabled={!canStepJump}
            >
              Step {displayStep}/{totalSteps}
            </button>
          </PopoverTrigger>
          {canStepJump && (
            <ToolbarPanel side="top" align="center" sideOffset={18}>
              <div className="flex w-48 items-center gap-3">
                <Slider
                  value={[stepSliderValue]}
                  min={0}
                  max={stepSliderMax}
                  step={1}
                  onValueChange={(value) => handleStepJump(value[0])}
                />
                <span className="w-10 text-right text-xs text-white/80">
                  {displayStep}/{totalSteps}
                </span>
              </div>
            </ToolbarPanel>
          )}
        </Popover>
        <ToolButton
          icon={ChevronRight}
          label="Next Step"
          onClick={nextStep}
          disabled={!canStepNext}
          className="h-7 w-7"
        />
      </div>

      {showSettings && (
        <Popover>
          <PopoverTrigger asChild>
            <ToolButton
              icon={Settings2}
              label="Playback Settings"
              className="h-8 w-8"
            />
          </PopoverTrigger>
          <ToolbarPanel side="top" align="end" sideOffset={18} className="w-56">
            <div className="grid gap-3 text-[11px] text-white/70">
              {canAutoPlay && (
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md border px-2 py-1 transition",
                    isAutoPlay
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/10 text-white/70 hover:border-white/30"
                  )}
                  onClick={handleAutoToggle}
                >
                  <span className="flex items-center gap-2">
                    <Repeat className="h-3.5 w-3.5" />
                    Auto Play
                  </span>
                  <span>{isAutoPlay ? "On" : "Off"}</span>
                </button>
              )}

              {canTiming && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Speed</span>
                    <span className="text-white/80">{speedLabel}x</span>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    min={0.1}
                    max={2}
                    step={0.05}
                    onValueChange={(value) => setPlaybackSpeed(value[0])}
                  />
                </div>
              )}

              {canTiming && canAutoPlay && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Delay</span>
                    <span className="text-white/80">{delayLabel}s</span>
                  </div>
                  <Slider
                    value={[autoPlayDelayMs]}
                    min={300}
                    max={3000}
                    step={100}
                    onValueChange={(value) => setAutoPlayDelay(value[0])}
                  />
                </div>
              )}
            </div>
          </ToolbarPanel>
        </Popover>
      )}
    </div>
  );
}
