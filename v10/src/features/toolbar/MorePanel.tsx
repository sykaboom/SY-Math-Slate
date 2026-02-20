"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@core/utils";
import { useFileIO } from "@features/hooks/useFileIO";
import { usePersistence } from "@features/hooks/usePersistence";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import {
  ChevronsLeft,
  ChevronsRight,
  Redo2,
  Undo2,
} from "lucide-react";

import { ToolButton } from "./atoms/ToolButton";
import { fireToolbarCommand, publishToolbarNotice } from "./toolbarFeedback";

const menuButtonClass =
  "rounded-md border border-toolbar-border/10 bg-toolbar-menu-bg/20 px-2 py-1.5 text-left text-[11px] text-toolbar-text/70 hover:border-toolbar-border/30";

type MorePanelProps = {
  toolbarDockSelector: ReactNode;
  showDockSection: boolean;
  showStepSection: boolean;
  showHistorySection: boolean;
  onOpenClick: () => void;
};

export function MorePanel({
  toolbarDockSelector,
  showDockSection,
  showStepSection,
  showHistorySection,
  onOpenClick,
}: MorePanelProps) {
  const { exportSlate } = useFileIO();
  const { saveNow, clearLocal, saveStatus } = usePersistence();
  const {
    isOverviewMode,
    overviewZoom,
    overviewViewportRatio,
    toggleOverviewMode,
    setOverviewZoom,
    setOverviewViewportRatio,
    resetViewport,
    showBreakGuides,
    showCanvasBorder,
    showCursors,
    toggleBreakGuides,
    toggleCanvasBorder,
    toggleCursors,
    isCapabilityEnabled,
    capabilityProfile,
    setCapabilityProfile,
  } = useUIStore();
  const { pages, currentPageId, currentStep, strokeRedoByPage } =
    useCanvasStore();

  const [isResetConfirmArmed, setIsResetConfirmArmed] = useState(false);

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
  const canOverview = isCapabilityEnabled("overview.mode");
  const canAdvancedExport = isCapabilityEnabled("export.advanced");

  const profileOptions = [
    { value: "basic", title: "Basic", description: "필수 기능만" },
    { value: "advanced", title: "Advanced", description: "고급 제어 포함" },
  ] as const;

  const pushNotice = (tone: "info" | "success" | "error", message: string) => {
    publishToolbarNotice({ tone, message });
  };

  const handleResetLocal = () => {
    if (!isResetConfirmArmed) {
      setIsResetConfirmArmed(true);
      pushNotice("info", "한 번 더 누르면 로컬 데이터와 캐시를 초기화합니다.");
      return;
    }
    const result = clearLocal();
    setIsResetConfirmArmed(false);
    if (!result.ok) {
      pushNotice("error", "로컬 초기화에 실패했습니다.");
      return;
    }
    pushNotice("success", "로컬 데이터를 초기화했습니다. 화면을 갱신합니다.");
    if (typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 180);
    }
  };

  const handleOverviewZoom = (delta: number) => {
    setOverviewZoom(overviewZoom + delta);
  };

  const dispatchMoreCommand = (commandId: string, payload: unknown = {}) => {
    fireToolbarCommand({
      commandId,
      payload,
      source: "toolbar.more-panel",
      errorMessage: "요청을 처리하지 못했습니다.",
    });
  };

  useEffect(() => {
    if (!isResetConfirmArmed || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(
      () => setIsResetConfirmArmed(false),
      5000
    );
    return () => window.clearTimeout(timeoutId);
  }, [isResetConfirmArmed]);

  return (
    <div className="grid gap-3 text-[11px] text-toolbar-text/70">
      {showDockSection && (
        <div className="grid gap-2">
          <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
            Dock
          </span>
          <div className="flex items-center">{toolbarDockSelector}</div>
        </div>
      )}

      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          Profile
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {profileOptions.map((option) => {
            const isActive = capabilityProfile === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCapabilityProfile(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] transition",
                  isActive
                    ? "border-toolbar-border/40 bg-toolbar-chip/15 text-toolbar-text"
                    : "border-toolbar-border/10 bg-toolbar-menu-bg/20 text-toolbar-text/70 hover:border-toolbar-border/30"
                )}
              >
                {option.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          File
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={menuButtonClass} onClick={onOpenClick}>
            파일 열기
          </button>
          <button
            type="button"
            className={menuButtonClass}
            onClick={async () => {
              const result = await exportSlate();
              if (!result.ok) {
                pushNotice("error", "파일 저장에 실패했습니다.");
                return;
              }
              pushNotice("success", "파일 저장을 완료했습니다.");
            }}
          >
            파일 저장
          </button>
          {canAdvancedExport && (
            <button
              type="button"
              className={cn(
                menuButtonClass,
                "cursor-not-allowed text-toolbar-muted/50"
              )}
              disabled
              aria-disabled="true"
            >
              Export (준비 중)
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          Local
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={menuButtonClass}
            onClick={() => {
              const result = saveNow();
              if (!result.ok) {
                pushNotice("error", "로컬 저장에 실패했습니다.");
                return;
              }
              pushNotice("success", "로컬 저장을 완료했습니다.");
            }}
          >
            로컬 저장
          </button>
          <button
            type="button"
            className={cn(
              menuButtonClass,
              isResetConfirmArmed &&
                "border-toolbar-danger/60 bg-toolbar-danger/10 text-toolbar-danger"
            )}
            onClick={handleResetLocal}
          >
            {isResetConfirmArmed ? "초기화 확인" : "로컬 초기화"}
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          View
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(menuButtonClass, "col-span-2")}
            onClick={resetViewport}
          >
            Reset View (100%)
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          Cursor
        </span>
        <div className="grid gap-2">
          <button
            type="button"
            className={cn(
              menuButtonClass,
              "flex items-center justify-between",
              !showCursors && "text-toolbar-muted/40"
            )}
            onClick={toggleCursors}
          >
            <span>쓰기 커서</span>
            <span className="text-[10px] uppercase tracking-wide">
              {showCursors ? "표시" : "숨김"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          Layout
        </span>
        <div className="grid gap-2">
          <button
            type="button"
            className={cn(
              menuButtonClass,
              "flex items-center justify-between",
              !showCanvasBorder && "text-toolbar-muted/40"
            )}
            onClick={toggleCanvasBorder}
          >
            <span>캔버스 경계선</span>
            <span className="text-[10px] uppercase tracking-wide">
              {showCanvasBorder ? "표시" : "숨김"}
            </span>
          </button>
          <button
            type="button"
            className={cn(
              menuButtonClass,
              "flex items-center justify-between",
              !showBreakGuides && "text-toolbar-muted/40"
            )}
            onClick={toggleBreakGuides}
          >
            <span>단 구분선</span>
            <span className="text-[10px] uppercase tracking-wide">
              {showBreakGuides ? "표시" : "숨김"}
            </span>
          </button>
        </div>
      </div>

      {canOverview && (
        <div className="grid gap-2">
          <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
            Overview
          </span>
          <div className="grid gap-2">
            <button
              type="button"
              className={menuButtonClass}
              onClick={toggleOverviewMode}
            >
              {isOverviewMode ? "오버뷰 종료" : "오버뷰 켜기"}
            </button>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  overviewViewportRatio === "16:9"
                    ? "border border-toolbar-border/40 bg-toolbar-chip/15 text-toolbar-text"
                    : "border border-toolbar-border/10 text-toolbar-text/70 hover:border-toolbar-border/30"
                )}
                onClick={() => setOverviewViewportRatio("16:9")}
              >
                16:9
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  overviewViewportRatio === "4:3"
                    ? "border border-toolbar-border/40 bg-toolbar-chip/15 text-toolbar-text"
                    : "border border-toolbar-border/10 text-toolbar-text/70 hover:border-toolbar-border/30"
                )}
                onClick={() => setOverviewViewportRatio("4:3")}
              >
                4:3
              </button>
              {isOverviewMode && (
                <div className="ml-auto flex items-center gap-1 text-[11px] text-toolbar-muted/60">
                  <button
                    type="button"
                    className="rounded-full border border-toolbar-border/10 px-2 py-1"
                    onClick={() => handleOverviewZoom(-0.1)}
                    disabled={overviewZoom <= 0.2}
                  >
                    -
                  </button>
                  <span>{Math.round(overviewZoom * 100)}%</span>
                  <button
                    type="button"
                    className="rounded-full border border-toolbar-border/10 px-2 py-1"
                    onClick={() => handleOverviewZoom(0.1)}
                    disabled={overviewZoom >= 1}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showStepSection && (
        <>
          <div className="grid gap-2">
            <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
              Step
            </span>
            <div className="flex items-center justify-between">
              <span>스텝</span>
              <div className="flex items-center gap-2">
                <ToolButton
                  icon={ChevronsLeft}
                  label="Previous Step"
                  onClick={() => dispatchMoreCommand("prevStep")}
                  disabled={!canStepPrev}
                  className="h-8 w-8"
                />
                <span>
                  {displayStep}/{totalSteps}
                </span>
                <ToolButton
                  icon={ChevronsRight}
                  label="Next Step"
                  onClick={() => dispatchMoreCommand("nextStep")}
                  disabled={!canStepNext}
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {showHistorySection && (
        <>
          <div className="grid gap-2">
            <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
              History
            </span>
            <div className="flex items-center justify-between">
              <span>되돌리기</span>
              <div className="flex items-center gap-2">
                <ToolButton
                  icon={Undo2}
                  label="Undo"
                  onClick={() => dispatchMoreCommand("undo")}
                  disabled={!canUndo || isOverviewMode}
                  className="h-8 w-8"
                />
                <ToolButton
                  icon={Redo2}
                  label="Redo"
                  onClick={() => dispatchMoreCommand("redo")}
                  disabled={!canRedo || isOverviewMode}
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {saveStatus !== "idle" && (
        <div
          className={cn(
            "text-[11px]",
            saveStatus === "error"
              ? "text-toolbar-danger"
              : "text-toolbar-text/50"
          )}
        >
          {saveStatus === "saving" && "저장 중..."}
          {saveStatus === "error" && "저장 오류"}
        </div>
      )}
    </div>
  );
}
