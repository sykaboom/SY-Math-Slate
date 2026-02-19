"use client";

import { useMemo, useState } from "react";

import { dispatchCommand } from "@core/engine/commandBus";
import { cn } from "@core/utils";
import { PublicToggle } from "@features/sharing/PublicToggle";
import { ShareButton } from "@features/sharing/ShareButton";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { Pause, Play, Square, X } from "lucide-react";
import { Popover, PopoverTrigger } from "@ui/components/popover";
import { Slider } from "@ui/components/slider";
import { ToolbarPanel } from "@features/toolbar/atoms/ToolbarPanel";

type PlayerBarProps = {
  readOnly?: boolean;
};

export function PlayerBar({ readOnly = false }: PlayerBarProps) {
  const { pages, currentPageId, currentStep } = useCanvasStore();
  const [isPublic, setIsPublic] = useState(false);
  const {
    isAutoPlay,
    playbackSpeed,
    autoPlayDelayMs,
    isAnimating,
    isPaused,
    isCapabilityEnabled,
  } = useUIStore();

  const dispatchPlayerCommand = (commandId: string, payload: unknown = {}) => {
    void dispatchCommand(commandId, payload, {
      meta: { source: "layout.player-bar" },
    }).catch(() => undefined);
  };

  const maxStep = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    return items.reduce((max, item) => {
      if (item.type !== "text") return max;
      const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
      return Math.max(max, stepIndex);
    }, -1);
  }, [pages, currentPageId]);

  const totalSteps = Math.max(maxStep + 1, 0);
  const currentDisplay =
    totalSteps === 0 ? 0 : Math.min(currentStep + 1, totalSteps);
  const progress = totalSteps > 0 ? currentDisplay / totalSteps : 0;

  const handlePlay = () => {
    if (readOnly) return;
    if (!isAutoPlay) {
      dispatchPlayerCommand("toggleAutoPlay");
    }
    if (isPaused) {
      dispatchPlayerCommand("togglePause");
    }
    if (currentStep > maxStep) return;
    dispatchPlayerCommand("triggerPlay");
  };

  const handleStop = () => {
    if (readOnly) return;
    if (isAutoPlay) {
      dispatchPlayerCommand("toggleAutoPlay");
    }
    dispatchPlayerCommand("triggerStop");
  };

  const handlePlayPause = () => {
    if (readOnly) return;
    if (isAnimating) {
      dispatchPlayerCommand("togglePause");
      return;
    }
    handlePlay();
  };

  const handleExitPresentation = () => {
    if (readOnly) return;
    dispatchPlayerCommand("setViewMode", { mode: "edit" });
  };

  const speedLabel = useMemo(() => playbackSpeed.toFixed(2), [playbackSpeed]);
  const delayLabel = useMemo(
    () => (autoPlayDelayMs / 1000).toFixed(1),
    [autoPlayDelayMs]
  );
  const canTiming = isCapabilityEnabled("playback.timing");

  return (
    <div className="w-[min(780px,92vw)]">
      <div className="flex flex-col gap-2 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-3 text-[var(--theme-text)] shadow-[var(--toolbar-shell-shadow)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-3">
          <button
            type="button"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border border-theme-border/10 text-theme-text",
              readOnly
                ? "cursor-not-allowed bg-theme-surface-soft opacity-50"
                : isAnimating && !isPaused
                  ? "bg-theme-surface-soft"
                  : "bg-theme-surface-soft hover:bg-theme-surface/20"
            )}
            onClick={handlePlayPause}
            disabled={readOnly}
            aria-label={isAnimating ? (isPaused ? "Resume" : "Pause") : "Auto Play"}
          >
            {isAnimating && !isPaused ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-theme-border/10 text-theme-text/80",
              readOnly ? "cursor-not-allowed opacity-50" : "hover:bg-theme-surface-soft"
            )}
            onClick={handleStop}
            disabled={readOnly}
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-theme-surface-soft">
              <div
                className="absolute inset-y-0 left-0 bg-theme-surface/70"
                style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              />
            </div>
            <span className="min-w-[60px] text-xs text-theme-text/70">
              {currentDisplay}/{totalSteps}
            </span>
          </div>

          {canTiming ? (
            <div className="hidden sm:flex">
              {readOnly ? (
                <span className="rounded-full border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/50">
                  {speedLabel}x
                </span>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "rounded-full border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/70",
                        "hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-white/30"
                      )}
                      title="Speed"
                    >
                      {speedLabel}x
                    </button>
                  </PopoverTrigger>
                  <ToolbarPanel side="top" align="center" sideOffset={18}>
                    <div className="flex w-44 items-center gap-3">
                      <Slider
                        value={[playbackSpeed]}
                        min={0.1}
                        max={2}
                        step={0.05}
                        onValueChange={(value) =>
                          dispatchPlayerCommand("setPlaybackSpeed", {
                            speed: value[0] ?? playbackSpeed,
                          })
                        }
                      />
                      <span className="w-10 text-right text-xs text-theme-text/80">
                        {speedLabel}x
                      </span>
                    </div>
                  </ToolbarPanel>
                </Popover>
              )}
            </div>
          ) : null}

          {canTiming ? (
            <div className="hidden sm:flex">
              {readOnly ? (
                <span className="rounded-full border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/50">
                  {delayLabel}s
                </span>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "rounded-full border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/70",
                        "hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-white/30"
                      )}
                      title="Delay"
                    >
                      {delayLabel}s
                    </button>
                  </PopoverTrigger>
                  <ToolbarPanel side="top" align="center" sideOffset={18}>
                    <div className="flex w-44 items-center gap-3">
                      <Slider
                        value={[autoPlayDelayMs]}
                        min={300}
                        max={3000}
                        step={100}
                        onValueChange={(value) =>
                          dispatchPlayerCommand("setAutoPlayDelay", {
                            delayMs: value[0] ?? autoPlayDelayMs,
                          })
                        }
                      />
                      <span className="w-10 text-right text-xs text-theme-text/80">
                        {delayLabel}s
                      </span>
                    </div>
                  </ToolbarPanel>
                </Popover>
              )}
            </div>
          ) : null}

          {!readOnly ? (
            <div className="hidden items-center gap-2 sm:flex">
              <PublicToggle isPublic={isPublic} onChange={setIsPublic} />
              <ShareButton isPublic={isPublic} />
            </div>
          ) : null}

          <button
            type="button"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-theme-border/10 text-theme-text/70",
              readOnly ? "cursor-not-allowed opacity-50" : "hover:bg-theme-surface-soft"
            )}
            onClick={handleExitPresentation}
            disabled={readOnly}
            aria-label="Exit Presentation Mode"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!readOnly ? (
          <div className="flex items-center justify-end gap-2 sm:hidden">
            <PublicToggle isPublic={isPublic} onChange={setIsPublic} />
            <ShareButton isPublic={isPublic} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
