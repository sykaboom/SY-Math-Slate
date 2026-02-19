"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent } from "react";

import { Popover, PopoverTrigger } from "@ui/components/popover";
import { useFileIO } from "@features/hooks/useFileIO";
import { useImageInsert } from "@features/hooks/useImageInsert";
import { usePersistence } from "@features/hooks/usePersistence";
import { useSFX } from "@features/hooks/useSFX";
import { ExtensionSlot } from "@features/extensions/ui/ExtensionSlot";
import { dispatchCommand } from "@core/engine/commandBus";
import { cn } from "@core/utils";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore, type Tool } from "@features/store/useUIStoreBridge";
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Columns,
  CornerDownLeft,
  Eraser,
  FilePlus,
  Hand,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PenLine,
  Redo2,
  SlidersHorizontal,
  Type,
  Undo2,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import { EraserControls } from "./EraserControls";
import { LaserControls } from "./LaserControls";
import { PenControls } from "./PenControls";
import { COMPACT_TOOLBAR_SCROLL_HINT } from "./compactToolbarSections";
import {
  resolveToolbarRenderPolicy,
  type ToolbarMode,
} from "./toolbarModePolicy";
import { ToolButton } from "./atoms/ToolButton";
import { ToolbarPanel } from "./atoms/ToolbarPanel";
import { PageNavigator } from "./PageNavigator";
import { PlaybackControls } from "./PlaybackControls";
import { ThumbZoneDock } from "./ThumbZoneDock";
import {
  fireToolbarCommand,
  subscribeToolbarNotice,
  type ToolbarFeedbackTone,
} from "./toolbarFeedback";

const COMPACT_TOOLBAR_QUERY = "(max-width: 1279px)";

const getCompactViewportSnapshot = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia(COMPACT_TOOLBAR_QUERY).matches;
};

const subscribeCompactViewport = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(COMPACT_TOOLBAR_QUERY);
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }

  mediaQuery.addListener(callback);
  return () => mediaQuery.removeListener(callback);
};

export type FloatingToolbarMountMode = "legacy-shell" | "window-host";

type FloatingToolbarProps = {
  mountMode?: FloatingToolbarMountMode;
  className?: string;
};

type ToolbarNotice = {
  tone: ToolbarFeedbackTone;
  message: string;
};

const TOOLBAR_MODES: ReadonlyArray<{
  id: ToolbarMode;
  label: string;
}> = [
  { id: "draw", label: "Draw" },
  { id: "playback", label: "Playback" },
  { id: "canvas", label: "Canvas" },
];

const TOOLBAR_DOCK_OPTIONS: ReadonlyArray<{
  value: "left" | "center" | "right";
  label: string;
}> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function FloatingToolbar(props: FloatingToolbarProps = {}) {
  const { mountMode = "legacy-shell", className } = props;
  const isCompactViewport = useSyncExternalStore(
    subscribeCompactViewport,
    getCompactViewportSnapshot,
    () => false
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { exportSlate, importSlate } = useFileIO();
  const { insertImageFile } = useImageInsert();
  const { saveNow, clearLocal, saveStatus } = usePersistence();
  const { enableSound, disableSound, isSoundEnabled } = useSFX();
  const [toolbarNotice, setToolbarNotice] = useState<ToolbarNotice | null>(null);
  const [isResetConfirmArmed, setIsResetConfirmArmed] = useState(false);
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>("draw");
  const {
    activeTool,
    penColor,
    openPanel,
    openPasteHelper,
    togglePanel,
    isOverviewMode,
    overviewZoom,
    overviewViewportRatio,
    toggleOverviewMode,
    setOverviewZoom,
    setOverviewViewportRatio,
    isDataInputOpen,
    toggleDataInput,
    closeDataInput,
    fullscreenInkMode,
    toolbarDockPosition,
    enterFullscreenInkNative,
    enterFullscreenInkFallback,
    exitFullscreenInk,
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
  const {
    pages,
    currentPageId,
    currentStep,
    strokeRedoByPage,
  } = useCanvasStore();

  const isPenOpen = openPanel === "pen";
  const isEraserOpen = openPanel === "eraser";
  const isLaserOpen = openPanel === "laser";
  const isDrawMode = toolbarMode === "draw";
  const isPlaybackMode = toolbarMode === "playback";
  const isCanvasMode = toolbarMode === "canvas";
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
  const isNativeFullscreen = fullscreenInkMode === "native";
  const isFullscreenInkActive = fullscreenInkMode !== "off";
  const profileOptions = [
    {
      value: "basic",
      title: "Basic",
      description: "필수 기능만",
    },
    {
      value: "advanced",
      title: "Advanced",
      description: "고급 제어 포함",
    },
  ] as const;
  const menuButtonClass =
    "rounded-md border border-toolbar-border/10 bg-toolbar-menu-bg/20 px-2 py-1.5 text-left text-[11px] text-toolbar-text/70 hover:border-toolbar-border/30";
  const toolbarRenderPolicy = resolveToolbarRenderPolicy(toolbarMode);
  const showDrawCoreTools = toolbarRenderPolicy.showDrawCoreTools;
  const showPlaybackExtras = toolbarRenderPolicy.showPlaybackExtras;
  const showBreakActions = toolbarRenderPolicy.showBreakActions;
  const showCompactImageClipboardActions = !isDrawMode;
  const showCompactFullscreenAction = !isCanvasMode;
  const showCompactQuickActions =
    showCompactImageClipboardActions || showCompactFullscreenAction;
  const normalizedPenColor = penColor;
  const dispatchToolbarCommand = (
    commandId: string,
    payload: unknown = {},
    errorMessage?: string
  ) => {
    void dispatchCommand(commandId, payload, {
      meta: { source: "toolbar.floating-toolbar" },
    }).catch(() => {
      pushToolbarNotice(
        "error",
        errorMessage ?? "요청을 처리하지 못했습니다."
      );
    });
  };
  const pushToolbarNotice = (tone: ToolbarFeedbackTone, message: string) => {
    setToolbarNotice({ tone, message });
  };

  const handleTool = (tool: Tool) => () =>
    dispatchToolbarCommand("setTool", { tool });

  const handleToolPanelClick = (tool: Tool, panel: "pen" | "eraser" | "laser") => {
    if (activeTool === tool) {
      togglePanel(panel);
      return;
    }
    dispatchToolbarCommand("setTool", { tool });
  };

  const ensureToolPanelOpen = (tool: Tool, panel: "pen" | "eraser" | "laser") => {
    if (activeTool !== tool) {
      dispatchToolbarCommand("setTool", { tool });
    }
    if (openPanel !== panel) {
      togglePanel(panel);
    }
  };

  const handleToolPopoverOpenChange =
    (panel: "pen" | "eraser" | "laser") => (open: boolean) => {
      if (!open && openPanel === panel) {
        togglePanel(panel);
      }
    };

  const handlePenClick = () => handleToolPanelClick("pen", "pen");
  const handlePenSettingsClick = () => ensureToolPanelOpen("pen", "pen");
  const handleEraserClick = () => handleToolPanelClick("eraser", "eraser");
  const handleLaserClick = () => handleToolPanelClick("laser", "laser");

  const handleToolbarDockSelect = (position: "left" | "center" | "right") => {
    dispatchToolbarCommand("setToolbarDock", { position });
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await importSlate(file);
    if (result.ok) {
      pushToolbarNotice("success", "불러오기 완료");
    } else {
      pushToolbarNotice("error", "파일을 불러오지 못했습니다.");
    }
    event.target.value = "";
  };

  const handleImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await insertImageFile(file);
    event.target.value = "";
  };

  const handleEnterFullscreenInk = async () => {
    closeDataInput();
    if (typeof document === "undefined") {
      enterFullscreenInkFallback();
      return;
    }
    const rootNode = document.documentElement;
    if (typeof rootNode.requestFullscreen !== "function") {
      enterFullscreenInkFallback();
      return;
    }
    try {
      await rootNode.requestFullscreen();
      enterFullscreenInkNative();
    } catch {
      enterFullscreenInkFallback();
    }
  };

  const handleExitFullscreenInk = async () => {
    if (
      isNativeFullscreen &&
      typeof document !== "undefined" &&
      document.fullscreenElement
    ) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    exitFullscreenInk();
  };

  const handleOverviewZoom = (delta: number) => {
    setOverviewZoom(overviewZoom + delta);
  };

  const handlePasteHelper = () => {
    if (isOverviewMode) return;
    openPasteHelper();
  };

  const handleSoundToggle = async () => {
    if (isSoundEnabled) {
      disableSound();
      pushToolbarNotice("info", "사운드를 껐습니다.");
      return;
    }
    const ok = await enableSound();
    if (!ok) {
      pushToolbarNotice(
        "error",
        "소리 재생이 차단되었습니다. 화면을 한 번 눌러주세요."
      );
      return;
    }
    pushToolbarNotice("success", "사운드를 켰습니다.");
  };

  const handleResetLocal = () => {
    if (!isResetConfirmArmed) {
      setIsResetConfirmArmed(true);
      pushToolbarNotice(
        "info",
        "한 번 더 누르면 로컬 데이터와 캐시를 초기화합니다."
      );
      return;
    }
    const result = clearLocal();
    setIsResetConfirmArmed(false);
    if (!result.ok) {
      pushToolbarNotice("error", "로컬 초기화에 실패했습니다.");
      return;
    }
    pushToolbarNotice("success", "로컬 데이터를 초기화했습니다. 화면을 갱신합니다.");
    if (typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 180);
    }
  };

  const handleInsertBreak = (type: "line" | "column" | "page") => {
    fireToolbarCommand({
      commandId: "insertBreak",
      payload: { type, panelOpen: isDataInputOpen },
      source: "floating-toolbar.break-actions",
      errorMessage: "구분선 삽입을 처리하지 못했습니다.",
    });
  };

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
    return subscribeToolbarNotice((notice) => {
      setToolbarNotice(notice);
    });
  }, []);

  useEffect(() => {
    if (!toolbarNotice || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setToolbarNotice(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toolbarNotice]);

  useEffect(() => {
    if (!isResetConfirmArmed || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setIsResetConfirmArmed(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [isResetConfirmArmed]);

  const toolbarModeSelector = (
    <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 p-1">
      {TOOLBAR_MODES.map((mode) => {
        const isActive = toolbarMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => setToolbarMode(mode.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] transition",
              isActive
                ? "bg-toolbar-active-bg text-toolbar-active-text shadow-[var(--toolbar-active-shadow)]"
                : "text-toolbar-text/70 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );

  const toolbarDockSelector = (
    <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 p-1">
      {TOOLBAR_DOCK_OPTIONS.map((dockOption) => {
        const isActive = toolbarDockPosition === dockOption.value;
        return (
          <button
            key={dockOption.value}
            type="button"
            onClick={() => handleToolbarDockSelect(dockOption.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] transition",
              isActive
                ? "bg-toolbar-active-bg text-toolbar-active-text shadow-[var(--toolbar-active-shadow)]"
                : "text-toolbar-text/70 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
            )}
          >
            {dockOption.label}
          </button>
        );
      })}
    </div>
  );

  const morePanelContent = (
    <div className="grid gap-3 text-[11px] text-toolbar-text/70">
      <div className="grid gap-2">
        <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
          Dock
        </span>
        <div className="flex items-center">{toolbarDockSelector}</div>
      </div>

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
          <button type="button" className={menuButtonClass} onClick={handleOpenClick}>
            파일 열기
          </button>
          <button
            type="button"
            className={menuButtonClass}
            onClick={async () => {
              const result = await exportSlate();
              if (!result.ok) {
                pushToolbarNotice("error", "파일 저장에 실패했습니다.");
                return;
              }
              pushToolbarNotice("success", "파일 저장을 완료했습니다.");
            }}
          >
            파일 저장
          </button>
          {canAdvancedExport && (
            <button
              type="button"
              className={cn(
                menuButtonClass,
                "col-span-2 cursor-not-allowed text-toolbar-muted/50"
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
                pushToolbarNotice("error", "로컬 저장에 실패했습니다.");
                return;
              }
              pushToolbarNotice("success", "로컬 저장을 완료했습니다.");
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
          <button
            type="button"
            className={cn(menuButtonClass, "col-span-2")}
            onClick={handleSoundToggle}
          >
            {isSoundEnabled ? "사운드 끄기" : "사운드 켜기"}
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
            <button type="button" className={menuButtonClass} onClick={toggleOverviewMode}>
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

      {!isPlaybackMode && (
        <>
          <div className="grid gap-2">
            <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
              Steps
            </span>
            <div className="flex items-center justify-between">
              <span>스텝</span>
              <div className="flex items-center gap-2">
                <ToolButton
                  icon={ChevronsLeft}
                  label="Previous Step"
                  onClick={() => dispatchToolbarCommand("prevStep")}
                  disabled={!canStepPrev}
                  className="h-8 w-8"
                />
                <span>
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
            </div>
          </div>

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
            </div>
          </div>
        </>
      )}

      {saveStatus !== "idle" && (
        <div
          className={cn(
            "text-[11px]",
            saveStatus === "error" ? "text-toolbar-danger" : "text-toolbar-text/50"
          )}
        >
          {saveStatus === "saving" && "저장 중..."}
          {saveStatus === "error" && "저장 오류"}
        </div>
      )}
    </div>
  );

  const compactExpandedPanel = (
    <div className="grid gap-4">
      <div className="sticky top-0 z-10 -mx-1 rounded-md border border-toolbar-border/10 bg-toolbar-surface/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-toolbar-muted/60 backdrop-blur">
        {COMPACT_TOOLBAR_SCROLL_HINT}
      </div>
      {showCompactQuickActions && (
        <div className="grid gap-2 text-[11px] text-toolbar-text/70">
          <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/40">
            Quick Actions
          </span>
          <div className="grid grid-cols-3 gap-2">
            {showCompactImageClipboardActions && (
              <>
                <ToolButton
                  icon={ImageIcon}
                  label="Image"
                  onClick={handleImagePicker}
                  disabled={isOverviewMode}
                  className="h-11 w-11 justify-self-center"
                />
                <ToolButton
                  icon={ClipboardList}
                  label="붙여넣기 도움말"
                  onClick={handlePasteHelper}
                  disabled={isOverviewMode}
                  className="h-11 w-11 justify-self-center"
                />
              </>
            )}
            {showCompactFullscreenAction && (
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
                className="h-11 w-11 justify-self-center"
                data-layout-id={
                  isFullscreenInkActive
                    ? "action_exit_fullscreen_ink_toolbar"
                    : "action_enter_fullscreen_ink_toolbar"
                }
              />
            )}
          </div>
        </div>
      )}

      <div data-extension-slot-host="toolbar-inline" className="flex items-center">
        <ExtensionSlot slot="toolbar-inline" />
      </div>
      <div className="h-px bg-toolbar-border/10" />
      {morePanelContent}
    </div>
  );

  const toolbarNoticeClass =
    toolbarNotice?.tone === "error"
      ? "border-toolbar-danger/40 bg-toolbar-danger/10 text-toolbar-danger"
      : toolbarNotice?.tone === "success"
        ? "border-toolbar-border/30 bg-toolbar-chip/10 text-toolbar-text/80"
        : "border-toolbar-border/20 bg-toolbar-chip/10 text-toolbar-text/70";

  return (
    <div
      data-panel-mount-mode={mountMode}
      className={cn("w-full", mountMode === "window-host" && "h-full", className)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".slate"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {isCompactViewport ? (
        <ThumbZoneDock
          compact
          controls={
            <>
              <div className="shrink-0">{toolbarModeSelector}</div>

              {isDrawMode && (
                <>
                  {showDrawCoreTools && (
                    <>
                      {/* Safety fallback while core template cutover is disabled. */}
                      <ToolButton
                        icon={Hand}
                        label="Hand"
                        active={activeTool === "hand"}
                        onClick={handleTool("hand")}
                        className="h-11 w-11 shrink-0"
                      />
                      <Popover
                        open={isPenOpen}
                        onOpenChange={handleToolPopoverOpenChange("pen")}
                      >
                        <PopoverTrigger asChild>
                          <ToolButton
                            icon={PenLine}
                            label="Pen"
                            active={activeTool === "pen"}
                            colorIndicator={normalizedPenColor}
                            onClick={handlePenClick}
                            className="h-11 w-11 shrink-0"
                          />
                        </PopoverTrigger>
                        <ToolbarPanel side="top" align="center" sideOffset={14}>
                          <PenControls />
                        </ToolbarPanel>
                      </Popover>
                      <ToolButton
                        icon={SlidersHorizontal}
                        label="Pen Settings"
                        active={isPenOpen}
                        onClick={handlePenSettingsClick}
                        className="h-11 w-11 shrink-0"
                      />
                    </>
                  )}

                  <Popover
                    open={isEraserOpen}
                    onOpenChange={handleToolPopoverOpenChange("eraser")}
                  >
                    <PopoverTrigger asChild>
                      <ToolButton
                        icon={Eraser}
                        label="Eraser"
                        active={activeTool === "eraser"}
                        onClick={handleEraserClick}
                        className="h-11 w-11 shrink-0"
                      />
                    </PopoverTrigger>
                    <ToolbarPanel side="top" align="center" sideOffset={14}>
                      <EraserControls />
                    </ToolbarPanel>
                  </Popover>

                  {showDrawCoreTools && (
                    <Popover
                      open={isLaserOpen}
                      onOpenChange={handleToolPopoverOpenChange("laser")}
                    >
                      <PopoverTrigger asChild>
                        <ToolButton
                          icon={Zap}
                          label="Laser"
                          active={activeTool === "laser"}
                          onClick={handleLaserClick}
                          className="h-11 w-11 shrink-0"
                        />
                      </PopoverTrigger>
                      <ToolbarPanel side="top" align="center" sideOffset={14}>
                        <LaserControls />
                      </ToolbarPanel>
                    </Popover>
                  )}

                  <ToolButton
                    icon={Type}
                    label="Text"
                    active={isDataInputOpen}
                    onClick={toggleDataInput}
                    disabled={isOverviewMode}
                    className="h-11 w-11 shrink-0"
                  />
                  <ToolButton
                    icon={ImageIcon}
                    label="Image"
                    onClick={handleImagePicker}
                    disabled={isOverviewMode}
                    className="h-11 w-11 shrink-0"
                  />
                  <ToolButton
                    icon={ClipboardList}
                    label="붙여넣기 도움말"
                    onClick={handlePasteHelper}
                    disabled={isOverviewMode}
                    className="h-11 w-11 shrink-0"
                  />

                  {showBreakActions && (
                    <>
                      <ToolButton
                        icon={CornerDownLeft}
                        label="Line Break"
                        onClick={() => handleInsertBreak("line")}
                        disabled={isOverviewMode}
                        className="h-11 w-11 shrink-0"
                      />
                      <ToolButton
                        icon={Columns}
                        label="Column Break"
                        onClick={() => handleInsertBreak("column")}
                        disabled={isOverviewMode}
                        className="h-11 w-11 shrink-0"
                      />
                      <ToolButton
                        icon={FilePlus}
                        label="Page Break"
                        onClick={() => handleInsertBreak("page")}
                        disabled={isOverviewMode}
                        className="h-11 w-11 shrink-0"
                      />
                    </>
                  )}
                </>
              )}

              {isPlaybackMode && (
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
              )}

              {isCanvasMode && (
                <>
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
                    className="h-11 w-11 shrink-0"
                    data-layout-id={
                      isFullscreenInkActive
                        ? "action_exit_fullscreen_ink_toolbar"
                        : "action_enter_fullscreen_ink_toolbar"
                    }
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
                  <div className="shrink-0">{toolbarDockSelector}</div>
                </>
              )}
            </>
          }
          expandedPanel={compactExpandedPanel}
          panelClassName="p-3"
        />
      ) : (
        <div className="flex flex-nowrap items-center gap-2 rounded-3xl border border-toolbar-border/10 bg-toolbar-surface/90 px-4 py-3 shadow-[var(--toolbar-shell-shadow)] backdrop-blur-md">
          <div className="shrink-0">{toolbarModeSelector}</div>

          {isDrawMode && (
            <>
              {showDrawCoreTools && (
                <>
                  {/* Safety fallback while core template cutover is disabled. */}
                  <ToolButton
                    icon={Hand}
                    label="Hand"
                    active={activeTool === "hand"}
                    onClick={handleTool("hand")}
                  />
                  <Popover
                    open={isPenOpen}
                    onOpenChange={handleToolPopoverOpenChange("pen")}
                  >
                    <PopoverTrigger asChild>
                      <ToolButton
                        icon={PenLine}
                        label="Pen"
                        active={activeTool === "pen"}
                        colorIndicator={normalizedPenColor}
                        onClick={handlePenClick}
                      />
                    </PopoverTrigger>
                    <ToolbarPanel side="top" align="center" sideOffset={18}>
                      <PenControls />
                    </ToolbarPanel>
                  </Popover>
                  <ToolButton
                    icon={SlidersHorizontal}
                    label="Pen Settings"
                    active={isPenOpen}
                    onClick={handlePenSettingsClick}
                  />
                </>
              )}

              <Popover
                open={isEraserOpen}
                onOpenChange={handleToolPopoverOpenChange("eraser")}
              >
                <PopoverTrigger asChild>
                  <ToolButton
                    icon={Eraser}
                    label="Eraser"
                    active={activeTool === "eraser"}
                    onClick={handleEraserClick}
                  />
                </PopoverTrigger>
                <ToolbarPanel side="top" align="center" sideOffset={18}>
                  <EraserControls />
                </ToolbarPanel>
              </Popover>

              {showDrawCoreTools && (
                <Popover
                  open={isLaserOpen}
                  onOpenChange={handleToolPopoverOpenChange("laser")}
                >
                  <PopoverTrigger asChild>
                    <ToolButton
                      icon={Zap}
                      label="Laser"
                      active={activeTool === "laser"}
                      onClick={handleLaserClick}
                    />
                  </PopoverTrigger>
                  <ToolbarPanel side="top" align="center" sideOffset={18}>
                    <LaserControls />
                  </ToolbarPanel>
                </Popover>
              )}

              <ToolButton
                icon={Type}
                label="Text"
                active={isDataInputOpen}
                onClick={toggleDataInput}
                disabled={isOverviewMode}
              />
              <ToolButton
                icon={ImageIcon}
                label="Image"
                onClick={handleImagePicker}
                disabled={isOverviewMode}
              />
              <ToolButton
                icon={ClipboardList}
                label="붙여넣기 도움말"
                onClick={handlePasteHelper}
                disabled={isOverviewMode}
              />

              {showBreakActions && (
                <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1 text-[11px] text-toolbar-text/70">
                  <ToolButton
                    icon={CornerDownLeft}
                    label="Line Break"
                    onClick={() => handleInsertBreak("line")}
                    disabled={isOverviewMode}
                    className="h-8 w-8"
                  />
                  <ToolButton
                    icon={Columns}
                    label="Column Break"
                    onClick={() => handleInsertBreak("column")}
                    disabled={isOverviewMode}
                    className="h-8 w-8"
                  />
                  <ToolButton
                    icon={FilePlus}
                    label="Page Break"
                    onClick={() => handleInsertBreak("page")}
                    disabled={isOverviewMode}
                    className="h-8 w-8"
                  />
                </div>
              )}
            </>
          )}

          {isPlaybackMode && (
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
          )}

          {isCanvasMode && (
            <>
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
                data-layout-id={
                  isFullscreenInkActive
                    ? "action_exit_fullscreen_ink_toolbar"
                    : "action_enter_fullscreen_ink_toolbar"
                }
              />
              <ToolButton
                icon={isSoundEnabled ? Volume2 : VolumeX}
                label={isSoundEnabled ? "Sound On" : "Sound Off"}
                active={isSoundEnabled}
                onClick={() => {
                  void handleSoundToggle();
                }}
              />
              <div className="flex items-center">{toolbarDockSelector}</div>
            </>
          )}

          <div data-extension-slot-host="toolbar-inline" className="flex items-center">
            <ExtensionSlot slot="toolbar-inline" />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <ToolButton icon={MoreHorizontal} label="More" />
            </PopoverTrigger>
            <ToolbarPanel side="top" align="end" sideOffset={18} className="w-80">
              {morePanelContent}
            </ToolbarPanel>
          </Popover>
        </div>
      )}

      {isFullscreenInkActive && (
        <div className="mt-2 rounded-xl border border-toolbar-border/20 bg-toolbar-surface/70 px-3 py-1.5 text-[11px] text-toolbar-text/70">
          전체화면 종료: Esc 키 또는 전체화면 버튼을 다시 누르세요.
        </div>
      )}

      {toolbarNotice && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "mt-2 rounded-xl border px-3 py-1.5 text-[11px]",
            toolbarNoticeClass
          )}
        >
          {toolbarNotice.message}
        </div>
      )}
    </div>
  );
}
