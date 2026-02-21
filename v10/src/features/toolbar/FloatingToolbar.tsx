"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent } from "react";

import type { ModContext, ModId } from "@core/mod/contracts";
import { registerBuiltinMods } from "@core/mod/builtin";
import {
  configureRuntimeModManager,
  type ModManager,
} from "@core/mod/host";
import { Popover, PopoverTrigger } from "@ui/components/popover";
import { useFileIO } from "@features/hooks/useFileIO";
import { useImageInsert } from "@features/hooks/useImageInsert";
import { ExtensionSlot } from "@features/extensions/ui/ExtensionSlot";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { listResolvedModToolbarContributions } from "@features/ui-host/modContributionBridge";
import { useLocalStore } from "@features/store/useLocalStore";
import { useModStore } from "@features/store/useModStore";
import { dispatchCommand } from "@core/engine/commandBus";
import { cn } from "@core/utils";
import { useUIStore } from "@features/store/useUIStoreBridge";
import {
  ClipboardList,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  MoreHorizontal,
} from "lucide-react";

import { CanvasModeTools } from "./CanvasModeTools";
import { DrawModeTools } from "./DrawModeTools";
import { MorePanel } from "./MorePanel";
import { PlaybackModeTools } from "./PlaybackModeTools";
import { COMPACT_TOOLBAR_SCROLL_HINT } from "./compactToolbarSections";
import {
  selectCanvasToolbarActions,
  selectDrawToolbarActions,
  selectMorePanelActions,
  selectPlaybackToolbarActions,
} from "./catalog/toolbarActionSelectors";
import { listToolbarActionIdsByMode } from "./catalog/toolbarActionCatalog";
import {
  getToolbarViewportProfileSnapshot,
  subscribeToolbarViewportProfile,
  type ToolbarViewportProfile,
} from "./catalog/toolbarViewportProfile";
import {
  resolveActiveModIdFromToolbarMode,
  resolveToolbarModeFromActiveModId,
  resolveToolbarRenderPolicy,
  type ToolbarMode,
} from "./toolbarModePolicy";
import { ToolButton } from "./atoms/ToolButton";
import { ToolbarPanel } from "./atoms/ToolbarPanel";
import { ThumbZoneDock } from "./ThumbZoneDock";
import {
  subscribeToolbarNotice,
  publishToolbarNotice,
  type ToolbarFeedbackTone,
} from "./toolbarFeedback";

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

const publishToolbarRequestFailureNotice = (): void => {
  publishToolbarNotice({
    tone: "error",
    message: "요청을 처리하지 못했습니다.",
  });
};

const resolveToolbarRuntimeRole = (): "host" | "student" => {
  const state = useLocalStore.getState();
  return state.trustedRoleClaim ?? state.role;
};

const resolveToolbarModContext = (modId: ModId): ModContext => ({
  modId,
  dispatchCommand: (commandId, payload, meta) =>
    dispatchCommand(commandId, payload, {
      meta: {
        source: "toolbar.mod-manager-bridge",
        modId,
        ...(meta ?? {}),
      },
    }),
  query: {
    activeTool: () => useUIStore.getState().activeTool,
    playbackStep: () => {
      const canvas = useCanvasStore.getState();
      const maxStep = Object.values(canvas.pages).reduce((max, items) => {
        return items.reduce((innerMax, item) => {
          if (item.type !== "text" && item.type !== "image") return innerMax;
          const stepIndex =
            typeof item.stepIndex === "number" ? item.stepIndex : 0;
          return Math.max(innerMax, stepIndex);
        }, max);
      }, -1);
      const total = Math.max(maxStep + 1, 0);
      const current = total === 0 ? 0 : Math.min(canvas.currentStep + 1, total);
      return { current, total };
    },
    role: () => resolveToolbarRuntimeRole(),
  },
  publishNotice: (tone, message) => {
    publishToolbarNotice({ tone, message });
  },
});

const createToolbarModManager = (): ModManager => {
  registerBuiltinMods();
  return configureRuntimeModManager({
    resolveContext: resolveToolbarModContext,
    stateAdapter: {
      getActiveModId: () => useModStore.getState().activeModId ?? null,
      setActiveModId: (modId) => {
        if (!modId) return;
        useModStore.getState().setActiveModId(modId);
      },
    },
  });
};

const activateToolbarRuntimeMod = (manager: ModManager, modId: ModId): void => {
  void manager
    .activate({ modId })
    .then((result) => {
      if (!result.ok) {
        publishToolbarRequestFailureNotice();
      }
    })
    .catch(() => {
      publishToolbarRequestFailureNotice();
    });
};

export function FloatingToolbar(props: FloatingToolbarProps = {}) {
  const { mountMode = "legacy-shell", className } = props;
  const [modRuntimeManager] = useState<ModManager>(createToolbarModManager);
  const viewportProfile = useSyncExternalStore<ToolbarViewportProfile>(
    subscribeToolbarViewportProfile,
    getToolbarViewportProfileSnapshot,
    () => "desktop"
  );
  const isCompactViewport = viewportProfile !== "desktop";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { importSlate } = useFileIO();
  const { insertImageFile } = useImageInsert();
  const [toolbarNotice, setToolbarNotice] = useState<ToolbarNotice | null>(
    null
  );
  const activePackageId = useModStore((state) => state.activePackageId);
  const activeModId = useModStore((state) => state.activeModId);
  const toolbarMode = resolveToolbarModeFromActiveModId(activeModId, {
    activePackageId,
  });
  const {
    isOverviewMode,
    fullscreenInkMode,
    closeDataInput,
    enterFullscreenInkNative,
    enterFullscreenInkFallback,
    exitFullscreenInk,
    openPasteHelper,
  } = useUIStore();

  const isDrawMode = toolbarMode === "draw";
  const isPlaybackMode = toolbarMode === "playback";
  const isCanvasMode = toolbarMode === "canvas";
  const isFullscreenInkActive = fullscreenInkMode !== "off";
  const isNativeFullscreen = fullscreenInkMode === "native";
  const toolbarRenderPolicy = resolveToolbarRenderPolicy(toolbarMode);
  const drawToolbarActions = selectDrawToolbarActions(
    viewportProfile,
    toolbarRenderPolicy.cutoverEnabled
  );
  const playbackToolbarActions = selectPlaybackToolbarActions(
    viewportProfile,
    toolbarRenderPolicy.cutoverEnabled
  );
  const canvasToolbarActions = selectCanvasToolbarActions(viewportProfile);
  const morePanelActions = selectMorePanelActions(toolbarMode, viewportProfile);
  const reservedToolbarActionIds = new Set(listToolbarActionIdsByMode(toolbarMode));
  const activeModToolbarContributions = listResolvedModToolbarContributions({
    mountMode,
    role: resolveToolbarRuntimeRole(),
    reservedActionIds: reservedToolbarActionIds,
  });
  const activeModToolbarContributionCount = activeModToolbarContributions.length;

  const handleToolbarModeSelect = (mode: ToolbarMode) => {
    activateToolbarRuntimeMod(
      modRuntimeManager,
      resolveActiveModIdFromToolbarMode(mode, {
        activePackageId,
      })
    );
  };
  const handleModToolbarContributionClick = (
    contribution: (typeof activeModToolbarContributions)[number]
  ) => {
    void dispatchCommand(contribution.commandId, {}, {
      meta: {
        source: "toolbar.mod-contribution",
        contributionId: contribution.id,
        mode: toolbarMode,
      },
    })
      .then((result) => {
        if (!result.ok) {
          publishToolbarRequestFailureNotice();
        }
      })
      .catch(() => {
        publishToolbarRequestFailureNotice();
      });
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await importSlate(file);
    if (result.ok) {
      publishToolbarNotice({ tone: "success", message: "불러오기 완료" });
    } else {
      publishToolbarNotice({
        tone: "error",
        message: "파일을 불러오지 못했습니다.",
      });
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

  const handlePasteHelper = () => {
    if (isOverviewMode) return;
    openPasteHelper();
  };

  // --- Effects ---

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
    const nextModId =
      activeModId ??
      resolveActiveModIdFromToolbarMode("draw", {
        activePackageId,
      });
    activateToolbarRuntimeMod(modRuntimeManager, nextModId);
  }, [activeModId, activePackageId, modRuntimeManager]);

  useEffect(() => {
    if (!toolbarNotice || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setToolbarNotice(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toolbarNotice]);

  // --- Shared UI elements ---

  const toolbarModeSelector = (
    <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 p-1">
      {TOOLBAR_MODES.map((mode) => {
        const isActive = toolbarMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleToolbarModeSelect(mode.id)}
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

  const morePanelContent = (
    <MorePanel
      showStepSection={morePanelActions.step}
      showHistorySection={morePanelActions.history}
      onOpenClick={handleOpenClick}
    />
  );

  // --- Compact expanded panel ---

  const showCompactImageClipboardActions = !isDrawMode;
  const showCompactFullscreenAction = !isCanvasMode;
  const showCompactQuickActions =
    showCompactImageClipboardActions || showCompactFullscreenAction;

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
                label={
                  isFullscreenInkActive ? "필기 전체화면 종료" : "필기 전체화면"
                }
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

      <div
        data-extension-slot-host="toolbar-inline"
        data-mod-toolbar-bridge-count={activeModToolbarContributionCount}
        className="flex items-center"
      >
        <ExtensionSlot slot="toolbar-inline" />
      </div>
      <div className="h-px bg-toolbar-border/10" />
      {morePanelContent}
    </div>
  );
  const compactModToolbarContributionButtons = activeModToolbarContributions.map(
    (contribution) => (
      <ToolButton
        key={`compact-mod-${contribution.id}`}
        icon={MoreHorizontal}
        label={contribution.label}
        onClick={() => handleModToolbarContributionClick(contribution)}
        className="h-11 w-11 shrink-0"
      />
    )
  );
  const desktopModToolbarContributionButtons = activeModToolbarContributions.map(
    (contribution) => (
      <ToolButton
        key={`desktop-mod-${contribution.id}`}
        icon={MoreHorizontal}
        label={contribution.label}
        onClick={() => handleModToolbarContributionClick(contribution)}
      />
    )
  );

  const toolbarNoticeClass =
    toolbarNotice?.tone === "error"
      ? "border-toolbar-danger/40 bg-toolbar-danger/10 text-toolbar-danger"
      : toolbarNotice?.tone === "success"
        ? "border-toolbar-border/30 bg-toolbar-chip/10 text-toolbar-text/80"
        : "border-toolbar-border/20 bg-toolbar-chip/10 text-toolbar-text/70";

  // --- Render ---

  return (
    <div
      data-panel-mount-mode={mountMode}
      className={cn(
        "w-full",
        mountMode === "window-host" && "h-full",
        className
      )}
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
                <DrawModeTools
                  compact
                  showHandTool={drawToolbarActions.hand}
                  showPenTool={drawToolbarActions.pen}
                  showEraserTool={drawToolbarActions.eraser}
                  showLaserTool={drawToolbarActions.laser}
                  showTextTool={drawToolbarActions.text}
                  showImageTool={drawToolbarActions.image}
                  showClipboardTool={drawToolbarActions.clipboard}
                  showUndoRedo={drawToolbarActions.undoRedo}
                  showBreakActions={drawToolbarActions.breakActions}
                  onImagePicker={handleImagePicker}
                />
              )}

              {isPlaybackMode && (
                <PlaybackModeTools
                  compact
                  showStepNav={playbackToolbarActions.step}
                  showUndoRedo={playbackToolbarActions.undoRedo}
                  showSoundToggle={playbackToolbarActions.sound}
                  showPlaybackExtras={playbackToolbarActions.extras}
                />
              )}

              {isCanvasMode && (
                <CanvasModeTools
                  compact
                  showFullscreen={canvasToolbarActions.fullscreen}
                  showSoundToggle={canvasToolbarActions.sound}
                />
              )}
              {compactModToolbarContributionButtons}
            </>
          }
          expandedPanel={compactExpandedPanel}
          panelClassName="p-3"
        />
      ) : (
        <div className="flex flex-nowrap items-center gap-2 rounded-3xl border border-toolbar-border/10 bg-toolbar-surface/90 px-4 py-3 shadow-[var(--toolbar-shell-shadow)] backdrop-blur-md">
          <div className="shrink-0">{toolbarModeSelector}</div>

          {isDrawMode && (
            <DrawModeTools
              showHandTool={drawToolbarActions.hand}
              showPenTool={drawToolbarActions.pen}
              showEraserTool={drawToolbarActions.eraser}
              showLaserTool={drawToolbarActions.laser}
              showTextTool={drawToolbarActions.text}
              showImageTool={drawToolbarActions.image}
              showClipboardTool={drawToolbarActions.clipboard}
              showUndoRedo={drawToolbarActions.undoRedo}
              showBreakActions={drawToolbarActions.breakActions}
              onImagePicker={handleImagePicker}
            />
          )}

          {isPlaybackMode && (
            <PlaybackModeTools
              showStepNav={playbackToolbarActions.step}
              showUndoRedo={playbackToolbarActions.undoRedo}
              showSoundToggle={playbackToolbarActions.sound}
              showPlaybackExtras={playbackToolbarActions.extras}
            />
          )}

          {isCanvasMode && (
            <CanvasModeTools
              showFullscreen={canvasToolbarActions.fullscreen}
              showSoundToggle={canvasToolbarActions.sound}
            />
          )}
          {desktopModToolbarContributionButtons}

          <div
            data-extension-slot-host="toolbar-inline"
            data-mod-toolbar-bridge-count={activeModToolbarContributionCount}
            className="flex items-center"
          >
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
