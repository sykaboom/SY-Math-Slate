"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { CORE_PANEL_POLICY_IDS } from "@core/foundation/policies/panel-policy";
import { CanvasStage } from "@features/canvas/CanvasStage";
import { PasteHelperModal } from "@features/canvas/PasteHelperModal";
import { dispatchCommand } from "@core/runtime/command/commandBus";
import {
  ROLE_POLICY_ACTIONS,
  canAccessLayoutVisibilityForRole,
  resolveExecutionRole,
  resolveLegacyLayoutVisibilityForRole,
} from "@core/foundation/policies/rolePolicy";
import { ExtensionSlot } from "@features/extensions/ui/ExtensionSlot";
import {
  listCorePanelLauncherContract,
} from "@features/extensions/ui/registerCoreSlots";
import { PlayerBar } from "@features/layout/PlayerBar";
import { useTabletShellProfile } from "@features/layout/useTabletShellProfile";
import {
  PanelLauncher,
  type PanelLauncherEntry,
} from "@features/layout/windowing/PanelLauncher";
import { buildCoreWindowHostPanelAdapters } from "@features/layout/windowing/panelAdapters";
import { WindowHost } from "@features/layout/windowing/WindowHost";
import {
  resolveToolbarCanvasInsets,
  resolveToolbarPlacementFromWindowRuntime,
} from "@features/layout/windowing/windowRuntime";
import { ModStudioShell } from "@features/mod-studio";
import { reportPolicyBooleanDiffBatch } from "@features/policy/policyShadow";
import { useResolvedPanelPolicy } from "@features/policy/useResolvedPanelPolicy";
import { useAuthoringShortcuts } from "@features/shortcuts/useAuthoringShortcuts";
import { useAsymmetricSessionSync } from "@features/sync/useAsymmetricSessionSync";
import { Button } from "@ui/components/button";
import ErrorBoundary from "@ui/components/ErrorBoundary";
import { useChromeStore } from "@features/store/useChromeStore";
import { useLocalStore } from "@features/store/useLocalStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { Maximize2, Minimize2, Minus, MonitorPlay, Plus, ZoomIn } from "lucide-react";
import type { WindowRuntimeRect } from "@features/layout/windowing/windowRuntime.types";

interface AppLayoutProps {
  children?: ReactNode;
}

type LayoutRoleVisibilityPolicy = {
  showTopChrome: boolean;
  showDataInputPanel: boolean;
  showHostToolchips: boolean;
  showStudentPlayerBar: boolean;
  showPasteHelperModal: boolean;
};

const WINDOW_HOST_CLAMP_INSET_PX = 16;

const createDefaultWindowHostClampBounds = (): WindowRuntimeRect => ({
  x: WINDOW_HOST_CLAMP_INSET_PX,
  y: WINDOW_HOST_CLAMP_INSET_PX,
  width: 960,
  height: 640,
});

const SHELL_ERROR_FALLBACK_CLASSNAME =
  "rounded border border-[var(--theme-border-strong)] bg-[var(--theme-danger-soft)] px-2 py-1 text-xs text-[var(--theme-text)]";

export function AppLayout({ children }: AppLayoutProps) {
  useAsymmetricSessionSync();
  useResolvedPanelPolicy();
  const layoutRootRef = useRef<HTMLDivElement | null>(null);
  const windowHostViewportRef = useRef<HTMLDivElement | null>(null);
  const [windowHostClampBounds, setWindowHostClampBounds] =
    useState<WindowRuntimeRect>(createDefaultWindowHostClampBounds);
  const tabletShellProfile = useTabletShellProfile();
  const role = useLocalStore((state) => state.role);
  const {
    viewMode,
    isOverviewMode,
    overviewZoom,
    setOverviewZoom,
    toggleOverviewMode,
    openDataInput,
    closeDataInput,
    isDataInputOpen,
    fullscreenInkMode,
    toolbarPlacement,
    enterFullscreenInkNative,
    enterFullscreenInkFallback,
    exitFullscreenInk,
  } = useUIStore();
  const windowRuntimePanels = useChromeStore((state) => state.windowRuntimePanels);
  const setToolbarPlacement = useChromeStore((state) => state.setToolbarPlacement);
  const windowRuntimePanelOpenState = useChromeStore(
    (state) => state.windowRuntimePanelOpenState
  );
  const setWindowRuntimePanelOpenState = useChromeStore(
    (state) => state.setWindowRuntimePanelOpenState
  );
  const isPresentation = viewMode === "presentation";
  const isNativeFullscreen = fullscreenInkMode === "native";
  const isAppFullscreen = fullscreenInkMode === "app";
  const isFullscreenInkActive = fullscreenInkMode !== "off";
  const useLayoutSlotCutover =
    process.env.NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER !== "0";
  const roleVisibilityPolicy: LayoutRoleVisibilityPolicy = {
    showTopChrome: canAccessLayoutVisibilityForRole(
      role,
      ROLE_POLICY_ACTIONS.UI_SHOW_TOP_CHROME
    ),
    showDataInputPanel: canAccessLayoutVisibilityForRole(
      role,
      ROLE_POLICY_ACTIONS.UI_SHOW_DATA_INPUT_PANEL
    ),
    showHostToolchips: canAccessLayoutVisibilityForRole(
      role,
      ROLE_POLICY_ACTIONS.UI_SHOW_EDITING_FOOTER
    ),
    showStudentPlayerBar: canAccessLayoutVisibilityForRole(
      role,
      ROLE_POLICY_ACTIONS.UI_SHOW_STUDENT_PLAYER_BAR
    ),
    showPasteHelperModal: canAccessLayoutVisibilityForRole(
      role,
      ROLE_POLICY_ACTIONS.UI_SHOW_PASTE_HELPER_MODAL
    ),
  };
  const isPolicyStudentRole =
    roleVisibilityPolicy.showStudentPlayerBar &&
    !roleVisibilityPolicy.showHostToolchips;
  const layoutState = isNativeFullscreen
    ? "state_native_fullscreen"
    : isAppFullscreen
      ? "state_app_fullscreen_fallback"
      : isDataInputOpen
        ? "state_input_mode"
        : "state_canvas_mode";
  const zoomLabel = isOverviewMode ? Math.round(overviewZoom * 100) : 100;
  const useCompactHorizontalInsets =
    tabletShellProfile.shouldUseCompactHorizontalInsets;
  const chromeHorizontalSafeAreaStyle =
    tabletShellProfile.shouldPadHorizontalChromeWithSafeArea
      ? {
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }
      : undefined;
  const bottomChromeStyle =
    tabletShellProfile.shouldPadBottomChromeWithSafeArea ||
    tabletShellProfile.shouldPadHorizontalChromeWithSafeArea
      ? {
          ...(tabletShellProfile.shouldPadBottomChromeWithSafeArea
            ? {
                paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
              }
            : {}),
          ...(tabletShellProfile.shouldPadHorizontalChromeWithSafeArea
            ? {
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
              }
            : {}),
        }
    : undefined;
  const topChromeClassName = tabletShellProfile.shouldPadTopChromeWithSafeArea
    ? "sticky top-0 z-40 border-b border-theme-border/10 bg-theme-surface/40 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    : "sticky top-0 z-40 border-b border-theme-border/10 bg-theme-surface/40 backdrop-blur-md";
  const mainShellClass = isPresentation
    ? useCompactHorizontalInsets
      ? "relative flex min-h-0 flex-1 overflow-hidden px-2 py-2.5 sm:px-3 sm:py-3 xl:px-6 xl:py-6"
      : "relative flex min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4 xl:px-6 xl:py-6"
    : useCompactHorizontalInsets
      ? "relative flex min-h-0 flex-1 overflow-hidden px-2 pt-2.5 sm:px-3 sm:pt-3 xl:px-6 xl:pt-6"
      : "relative flex min-h-0 flex-1 overflow-hidden px-3 pt-3 sm:px-4 sm:pt-4 xl:px-6 xl:pt-6";
  const footerHorizontalInsetClass = useCompactHorizontalInsets
    ? "px-2 sm:px-3"
    : "px-3 sm:px-4";
  const footerBottomInsetClass = tabletShellProfile.shouldPadBottomChromeWithSafeArea
    ? "pb-2"
    : "pb-3 sm:pb-4";
  const presentationFooterClass = useCompactHorizontalInsets
    ? "relative flex items-center justify-center px-2 pb-2 sm:px-3 sm:pb-3 xl:px-6 xl:pb-6"
    : "relative flex items-center justify-center px-3 pb-3 sm:px-4 sm:pb-4 xl:px-6 xl:pb-6";
  const legacyRoleVisibility: LayoutRoleVisibilityPolicy =
    resolveLegacyLayoutVisibilityForRole(role);

  const showTopChromeLegacy =
    !isPresentation &&
    !isFullscreenInkActive &&
    legacyRoleVisibility.showTopChrome;
  const showTopChromePolicy =
    !isPresentation &&
    !isFullscreenInkActive &&
    roleVisibilityPolicy.showTopChrome;

  const showDataInputPanelLegacy =
    !isPresentation &&
    !isFullscreenInkActive &&
    legacyRoleVisibility.showDataInputPanel;
  const showDataInputPanelPolicy =
    !isPresentation &&
    !isFullscreenInkActive &&
    roleVisibilityPolicy.showDataInputPanel;

  const showHostToolchipsLegacy =
    !isPresentation && legacyRoleVisibility.showHostToolchips;
  const showHostToolchipsPolicy =
    !isPresentation && roleVisibilityPolicy.showHostToolchips;
  const runtimeRole = resolveExecutionRole(role);
  // Keep layout-level gating aligned with runtime role policy; panel policy
  // remains the final source of truth for role visibility.
  const showThemePicker = !isPresentation && runtimeRole === "host";
  useAuthoringShortcuts({
    enabled: showHostToolchipsPolicy,
  });

  const showStudentPlayerBarLegacy =
    !isPresentation && legacyRoleVisibility.showStudentPlayerBar;
  const showStudentPlayerBarPolicy =
    !isPresentation && roleVisibilityPolicy.showStudentPlayerBar;

  const showPasteHelperModalLegacy =
    !isPresentation && legacyRoleVisibility.showPasteHelperModal;
  const showPasteHelperModalPolicy =
    !isPresentation && roleVisibilityPolicy.showPasteHelperModal;
  const corePanelLauncherContractById = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof listCorePanelLauncherContract>[number]
    >();
    for (const contract of listCorePanelLauncherContract()) {
      map.set(contract.panelId, contract);
    }
    return map;
  }, []);
  const isPendingApprovalOpen =
    windowRuntimePanelOpenState[CORE_PANEL_POLICY_IDS.PENDING_APPROVAL] === true;
  const isModerationConsoleOpen =
    windowRuntimePanelOpenState[CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE] ===
    true;
  const isHostLiveSessionOpen =
    windowRuntimePanelOpenState[CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION] === true;
  const windowHostPanelModules = useMemo(
    () =>
      buildCoreWindowHostPanelAdapters({
        role: runtimeRole,
        layoutSlotCutoverEnabled: useLayoutSlotCutover,
        showDataInputPanel: showDataInputPanelPolicy,
        showThemePicker,
        showHostToolchips: showHostToolchipsPolicy,
        isDataInputOpen,
        closeDataInput,
        isPendingApprovalOpen,
        closePendingApproval: () =>
          setWindowRuntimePanelOpenState(
            CORE_PANEL_POLICY_IDS.PENDING_APPROVAL,
            false
          ),
        isModerationConsoleOpen,
        closeModerationConsole: () =>
          setWindowRuntimePanelOpenState(
            CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE,
            false
          ),
        isHostLiveSessionOpen,
        closeHostLiveSession: () =>
          setWindowRuntimePanelOpenState(
            CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION,
            false
          ),
        closeThemePicker: () =>
          setWindowRuntimePanelOpenState(CORE_PANEL_POLICY_IDS.THEME_PICKER, false),
        viewportSize: {
          width: windowHostClampBounds.width,
          height: windowHostClampBounds.height,
        },
      }),
    [
      closeDataInput,
      isHostLiveSessionOpen,
      isDataInputOpen,
      isModerationConsoleOpen,
      isPendingApprovalOpen,
      runtimeRole,
      setWindowRuntimePanelOpenState,
      showDataInputPanelPolicy,
      showHostToolchipsPolicy,
      showThemePicker,
      useLayoutSlotCutover,
      windowHostClampBounds.height,
      windowHostClampBounds.width,
    ]
  );
  const windowHostPanels = useMemo(
    () =>
      windowHostPanelModules.map((panel) => {
        if (panel.panelId === CORE_PANEL_POLICY_IDS.DATA_INPUT) {
          return {
            ...panel,
            isOpen: isDataInputOpen,
          };
        }
        return {
          ...panel,
          isOpen: windowRuntimePanelOpenState[panel.panelId] === true,
        };
      }),
    [isDataInputOpen, windowHostPanelModules, windowRuntimePanelOpenState]
  );
  const useWindowHostPanels =
    useLayoutSlotCutover && windowHostPanels.length > 0;
  const floatingToolbarPanel = useMemo(
    () =>
      windowHostPanels.find(
        (panel) => panel.panelId === CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR
      ) ?? null,
    [windowHostPanels]
  );
  const floatingToolbarLayout =
    windowRuntimePanels[CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR] ?? null;
  const isFloatingToolbarOpen =
    windowRuntimePanelOpenState[CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR] === true;
  const resolvedToolbarPlacement = useMemo(
    () =>
      resolveToolbarPlacementFromWindowRuntime({
        position: isFloatingToolbarOpen ? floatingToolbarLayout?.position : null,
        panelSize: isFloatingToolbarOpen ? floatingToolbarPanel?.size : null,
        clampBounds: windowHostClampBounds,
        fallbackEdge: toolbarPlacement.edge,
      }),
    [
      floatingToolbarLayout?.position,
      floatingToolbarPanel?.size,
      isFloatingToolbarOpen,
      toolbarPlacement.edge,
      windowHostClampBounds,
    ]
  );
  const toolbarCanvasInsets = useMemo(
    () =>
      resolveToolbarCanvasInsets({
        placement: resolvedToolbarPlacement,
        panelSize: isFloatingToolbarOpen ? floatingToolbarPanel?.size : null,
        clampBounds: windowHostClampBounds,
      }),
    [
      floatingToolbarPanel?.size,
      isFloatingToolbarOpen,
      resolvedToolbarPlacement,
      windowHostClampBounds,
    ]
  );
  const canvasPrimaryStyle = useMemo<CSSProperties | undefined>(() => {
    if (
      toolbarCanvasInsets.top <= 0 &&
      toolbarCanvasInsets.right <= 0 &&
      toolbarCanvasInsets.bottom <= 0 &&
      toolbarCanvasInsets.left <= 0
    ) {
      return undefined;
    }
    return {
      paddingTop:
        toolbarCanvasInsets.top > 0 ? `${toolbarCanvasInsets.top}px` : undefined,
      paddingRight:
        toolbarCanvasInsets.right > 0
          ? `${toolbarCanvasInsets.right}px`
          : undefined,
      paddingBottom:
        toolbarCanvasInsets.bottom > 0
          ? `${toolbarCanvasInsets.bottom}px`
          : undefined,
      paddingLeft:
        toolbarCanvasInsets.left > 0
          ? `${toolbarCanvasInsets.left}px`
          : undefined,
    };
  }, [toolbarCanvasInsets]);
  const shouldOverlayLeftPanel = !useWindowHostPanels && showDataInputPanelPolicy;
  const mainContentClass = "relative flex h-full w-full min-h-0 flex-1";
  const shouldRenderToolbarBottomSlot =
    showHostToolchipsPolicy && !useWindowHostPanels;
  const shouldRenderBottomChrome =
    !isPresentation &&
    (showStudentPlayerBarPolicy || shouldRenderToolbarBottomSlot);
  const panelLauncherEntries = useMemo<PanelLauncherEntry[]>(
    () =>
      useWindowHostPanels
        ? windowHostPanels.flatMap((panel) => {
            const launcherContract = corePanelLauncherContractById.get(panel.panelId);
            if (!launcherContract) return [];
            return [
              {
                panelId: panel.panelId,
                launcherId: launcherContract.launcherId,
                title: launcherContract.title,
                description: launcherContract.description,
                icon: launcherContract.icon,
                isOpen: panel.isOpen === true,
              },
            ];
          })
        : [],
    [corePanelLauncherContractById, useWindowHostPanels, windowHostPanels]
  );
  const shouldRenderPanelLauncher =
    !isPresentation &&
    !isFullscreenInkActive &&
    panelLauncherEntries.length > 0;
  const windowHostDockedContainerClass =
    tabletShellProfile.shouldPadBottomChromeWithSafeArea
      ? "pointer-events-none absolute inset-x-0 bottom-2 z-20 flex flex-col items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] sm:px-4 xl:px-6"
      : "pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-col items-center gap-2 px-3 sm:px-4 xl:px-6";

  const handleToggleLauncherPanel = (panelId: string, nextOpen: boolean) => {
    if (panelId === CORE_PANEL_POLICY_IDS.DATA_INPUT) {
      if (nextOpen) {
        openDataInput();
      } else {
        closeDataInput();
      }
      return;
    }
    setWindowRuntimePanelOpenState(panelId, nextOpen);
  };

  const handleHeaderZoom = (delta: number) => {
    if (!isOverviewMode) return;
    setOverviewZoom(overviewZoom + delta);
  };

  const handleEnterPresentation = () => {
    void dispatchCommand("setViewMode", { mode: "presentation" }, {
      meta: { source: "layout.app-layout" },
    }).catch(() => undefined);
  };

  const handleEnterFullscreenInk = async () => {
    closeDataInput();
    const rootNode = layoutRootRef.current;
    if (!rootNode || typeof rootNode.requestFullscreen !== "function") {
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

  useEffect(() => {
    if (!useWindowHostPanels) return;

    const viewportNode = windowHostViewportRef.current;
    if (!viewportNode) return;

    const updateClampBounds = () => {
      const rect = viewportNode.getBoundingClientRect();
      const nextWidth = Math.max(
        320,
        Math.round(rect.width) - WINDOW_HOST_CLAMP_INSET_PX * 2
      );
      const nextHeight = Math.max(
        240,
        Math.round(rect.height) - WINDOW_HOST_CLAMP_INSET_PX * 2
      );
      setWindowHostClampBounds((previous) => {
        if (
          previous.x === WINDOW_HOST_CLAMP_INSET_PX &&
          previous.y === WINDOW_HOST_CLAMP_INSET_PX &&
          previous.width === nextWidth &&
          previous.height === nextHeight
        ) {
          return previous;
        }
        return {
          x: WINDOW_HOST_CLAMP_INSET_PX,
          y: WINDOW_HOST_CLAMP_INSET_PX,
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateClampBounds();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        updateClampBounds();
      });
      observer.observe(viewportNode);
      return () => observer.disconnect();
    }

    if (typeof window === "undefined") return;
    window.addEventListener("resize", updateClampBounds);
    return () => window.removeEventListener("resize", updateClampBounds);
  }, [useWindowHostPanels]);

  useEffect(() => {
    if (
      toolbarPlacement.mode === resolvedToolbarPlacement.mode &&
      toolbarPlacement.edge === resolvedToolbarPlacement.edge
    ) {
      return;
    }
    setToolbarPlacement(resolvedToolbarPlacement);
  }, [
    resolvedToolbarPlacement,
    setToolbarPlacement,
    toolbarPlacement.edge,
    toolbarPlacement.mode,
  ]);

  useEffect(() => {
    reportPolicyBooleanDiffBatch([
      {
        decisionKey: "app-layout.region_chrome_top",
        role,
        legacyValue: showTopChromeLegacy,
        policyValue: showTopChromePolicy,
        metadata: {
          isPresentation,
          isFullscreenInkActive,
        },
      },
      {
        decisionKey: "app-layout.region_data_input_panel",
        role,
        legacyValue: showDataInputPanelLegacy,
        policyValue: showDataInputPanelPolicy,
        metadata: {
          isPresentation,
          isFullscreenInkActive,
        },
      },
      {
        decisionKey: "app-layout.region_toolchips",
        role,
        legacyValue: showHostToolchipsLegacy,
        policyValue: showHostToolchipsPolicy,
        metadata: {
          isPresentation,
        },
      },
      {
        decisionKey: "app-layout.region_student_player_bar",
        role,
        legacyValue: showStudentPlayerBarLegacy,
        policyValue: showStudentPlayerBarPolicy,
        metadata: {
          isPresentation,
        },
      },
      {
        decisionKey: "app-layout.region_paste_helper_modal",
        role,
        legacyValue: showPasteHelperModalLegacy,
        policyValue: showPasteHelperModalPolicy,
        metadata: {
          isPresentation,
        },
      },
    ]);
  }, [
    role,
    isPresentation,
    isFullscreenInkActive,
    showTopChromeLegacy,
    showTopChromePolicy,
    showDataInputPanelLegacy,
    showDataInputPanelPolicy,
    showHostToolchipsLegacy,
    showHostToolchipsPolicy,
    showStudentPlayerBarLegacy,
    showStudentPlayerBarPolicy,
    showPasteHelperModalLegacy,
    showPasteHelperModalPolicy,
  ]);

  return (
    <div
      ref={layoutRootRef}
      data-layout-state={layoutState}
      className={
        isAppFullscreen
          ? "flex h-[100svh] w-full flex-col bg-slate-app text-theme-text"
          : "flex h-[100dvh] w-full flex-col bg-slate-app text-theme-text"
      }
    >
      {showTopChromePolicy && (
        <header
          data-layout-id="region_chrome_top"
          style={chromeHorizontalSafeAreaStyle}
          className={topChromeClassName}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 xl:px-6 xl:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-text/50">
                SY
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold sm:text-lg">Math Slate</p>
                <p className="hidden text-xs text-theme-text/50 lg:block">Dark Canvas Workspace</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 border-theme-border/15 bg-theme-surface-soft text-theme-text/80 hover:bg-theme-surface-soft hover:text-theme-text"
                onClick={handleEnterFullscreenInk}
                aria-label="전체화면 필기 시작"
                title="전체화면 필기 시작"
                data-layout-id="action_enter_fullscreen_ink"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1.5 rounded-full border border-theme-border/10 bg-theme-surface-soft px-2 py-1 sm:gap-2 sm:px-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-theme-text/70 hover:text-theme-text disabled:text-theme-text/30"
                  onClick={() => handleHeaderZoom(-0.1)}
                  disabled={!isOverviewMode || overviewZoom <= 0.2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xs text-theme-text/60">{zoomLabel}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-theme-text/70 hover:text-theme-text disabled:text-theme-text/30"
                  onClick={() => handleHeaderZoom(0.1)}
                  disabled={!isOverviewMode || overviewZoom >= 1}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-theme-border/15 bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface-soft hover:text-theme-text disabled:text-theme-text/30"
                onClick={handleEnterPresentation}
                disabled={isOverviewMode}
                aria-label="발표 모드"
                title="발표 모드"
              >
                <MonitorPlay className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-theme-border/15 bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface-soft hover:text-theme-text"
                onClick={toggleOverviewMode}
                aria-label="개요 보기"
                title="개요 보기"
              >
                <ZoomIn className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Button>
              <ModStudioShell />
              <div data-extension-slot-host="chrome-top-toolbar" className="flex items-center">
                <ExtensionSlot slot="chrome-top-toolbar" />
              </div>
            </div>
          </div>
        </header>
      )}

      <main
        className={mainShellClass}
      >
        <div className={mainContentClass}>
          <ErrorBoundary
            fallback={
              <section role="alert" className={SHELL_ERROR_FALLBACK_CLASSNAME}>
                Canvas region failed to render.
              </section>
            }
          >
            <div
              data-layout-id="region_canvas_primary"
              className="min-w-0 flex-1"
              style={canvasPrimaryStyle}
            >
              <CanvasStage>{children}</CanvasStage>
            </div>
          </ErrorBoundary>
          {shouldOverlayLeftPanel ? (
            <ErrorBoundary
              fallback={
                <section role="alert" className={SHELL_ERROR_FALLBACK_CLASSNAME}>
                  Panel region failed to render.
                </section>
              }
            >
              <aside
                data-layout-id="region_left_panel_overlay"
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-full max-w-[min(420px,92vw)]"
              >
                <div className="pointer-events-auto h-full w-full">
                  <ExtensionSlot slot="left-panel" />
                </div>
              </aside>
            </ErrorBoundary>
          ) : null}
          {useWindowHostPanels ? (
            <ErrorBoundary
              fallback={
                <section role="alert" className={SHELL_ERROR_FALLBACK_CLASSNAME}>
                  Window host panel region failed to render.
                </section>
              }
            >
              <div
                ref={windowHostViewportRef}
                data-layout-id="region_window_host"
                className="pointer-events-none absolute inset-0 z-30"
              >
                <WindowHost
                  panels={windowHostPanels}
                  clampBounds={windowHostClampBounds}
                  className="pointer-events-none h-full w-full"
                  dockedContainerClassName={windowHostDockedContainerClass}
                  windowLayerClassName="absolute inset-0 z-30"
                />
              </div>
            </ErrorBoundary>
          ) : null}
        </div>
      </main>

      {shouldRenderBottomChrome && (
        <footer
          data-layout-id="region_chrome_bottom"
          style={bottomChromeStyle}
          className={
            isFullscreenInkActive
              ? `pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-center ${footerHorizontalInsetClass} ${footerBottomInsetClass}`
              : `pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-center ${footerHorizontalInsetClass} ${footerBottomInsetClass} xl:pointer-events-auto xl:static xl:px-6 xl:pb-6`
          }
        >
          {showStudentPlayerBarPolicy ? (
            <div className="pointer-events-auto flex w-full justify-center">
              <PlayerBar readOnly />
            </div>
          ) : shouldRenderToolbarBottomSlot ? (
            <ErrorBoundary
              fallback={
                <section role="alert" className={SHELL_ERROR_FALLBACK_CLASSNAME}>
                  Toolbar region failed to render.
                </section>
              }
            >
              <div
                data-layout-id="region_toolchips"
                className={
                  isFullscreenInkActive
                    ? "pointer-events-auto flex w-full max-w-[min(980px,96vw)] flex-col items-center gap-2"
                    : "pointer-events-auto flex w-full max-w-[min(1120px,96vw)] flex-col items-center gap-2 xl:max-w-[min(1120px,94vw)]"
                }
              >
                <div data-extension-slot-host="toolbar-bottom" className="flex flex-col gap-2">
                  <ExtensionSlot slot="toolbar-bottom" />
                </div>
              </div>
            </ErrorBoundary>
          ) : null}
        </footer>
      )}
      {isPresentation && (
        <footer
          style={bottomChromeStyle}
          className={presentationFooterClass}
        >
          <PlayerBar readOnly={isPolicyStudentRole} />
        </footer>
      )}
      {shouldRenderPanelLauncher && (
        <div className="pointer-events-none fixed inset-0 z-40">
          <div
            className="pointer-events-auto absolute left-6"
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
            data-layout-id="anchor_panel_launcher"
          >
            <PanelLauncher
              entries={panelLauncherEntries}
              onTogglePanelOpen={handleToggleLauncherPanel}
            />
          </div>
        </div>
      )}
      {showPasteHelperModalPolicy && <PasteHelperModal />}
      {isFullscreenInkActive && !isPresentation && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="pointer-events-auto absolute left-3 top-3 sm:left-4 sm:top-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-theme-border/20 bg-theme-surface/60 text-theme-text hover:bg-theme-surface/75"
              onClick={handleExitFullscreenInk}
              aria-label="전체화면 필기 종료"
              title="전체화면 필기 종료"
              data-layout-id="action_exit_fullscreen_ink"
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
