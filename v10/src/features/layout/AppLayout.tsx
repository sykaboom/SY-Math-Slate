"use client";

import { useEffect, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";

import { CanvasStage } from "@features/canvas/CanvasStage";
import { PasteHelperModal } from "@features/canvas/PasteHelperModal";
import { dispatchCommand } from "@core/engine/commandBus";
import {
  ROLE_POLICY_ACTIONS,
  canAccessLayoutVisibilityForRole,
  resolveLegacyLayoutVisibilityForRole,
} from "@core/config/rolePolicy";
import { DataInputPanel } from "@features/layout/DataInputPanel";
import { Prompter } from "@features/layout/Prompter";
import { PlayerBar } from "@features/layout/PlayerBar";
import { ExtensionSlot } from "@features/extensions/ui/ExtensionSlot";
import { ModStudioShell } from "@features/mod-studio";
import { reportPolicyBooleanDiffBatch } from "@features/policy/policyShadow";
import { useAsymmetricSessionSync } from "@features/sync/useAsymmetricSessionSync";
import { Button } from "@ui/components/button";
import { useLocalStore } from "@features/store/useLocalStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { Maximize2, Minimize2, Minus, MonitorPlay, Plus, ZoomIn } from "lucide-react";

const FloatingToolbar = dynamic(
  () =>
    import("@features/toolbar/FloatingToolbar").then(
      (mod) => mod.FloatingToolbar
    ),
  { ssr: false }
);

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

export function AppLayout({ children }: AppLayoutProps) {
  useAsymmetricSessionSync();
  const layoutRootRef = useRef<HTMLDivElement | null>(null);
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
    enterFullscreenInkNative,
    enterFullscreenInkFallback,
    exitFullscreenInk,
  } = useUIStore();
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

  const showStudentPlayerBarLegacy =
    !isPresentation && legacyRoleVisibility.showStudentPlayerBar;
  const showStudentPlayerBarPolicy =
    !isPresentation && roleVisibilityPolicy.showStudentPlayerBar;

  const showPasteHelperModalLegacy =
    !isPresentation && legacyRoleVisibility.showPasteHelperModal;
  const showPasteHelperModalPolicy =
    !isPresentation && roleVisibilityPolicy.showPasteHelperModal;

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
          ? "flex h-[100svh] w-full flex-col bg-slate-app text-white"
          : "flex h-[100dvh] w-full flex-col bg-slate-app text-white"
      }
    >
      {showTopChromePolicy && (
        <header
          data-layout-id="region_chrome_top"
          className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 xl:px-6 xl:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                SY
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold sm:text-lg">Math Slate</p>
                <p className="hidden text-xs text-white/50 lg:block">Dark Canvas Workspace</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
              <Button
                variant={isDataInputOpen ? "default" : "outline"}
                className="h-11 min-w-11 border-white/15 bg-white/5 px-3 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={openDataInput}
                aria-label="입력 편집실 열기"
                title="입력 편집실 열기"
                data-layout-id="action_open_drafting_room"
              >
                입력
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={handleEnterFullscreenInk}
                aria-label="전체화면 필기 시작"
                title="전체화면 필기 시작"
                data-layout-id="action_enter_fullscreen_ink"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:gap-2 sm:px-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white disabled:text-white/30"
                  onClick={() => handleHeaderZoom(-0.1)}
                  disabled={!isOverviewMode || overviewZoom <= 0.2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xs text-white/60">{zoomLabel}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white disabled:text-white/30"
                  onClick={() => handleHeaderZoom(0.1)}
                  disabled={!isOverviewMode || overviewZoom >= 1}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:text-white/30"
                onClick={handleEnterPresentation}
                disabled={isOverviewMode}
                aria-label="발표 모드"
                title="발표 모드"
              >
                <MonitorPlay className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
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
        className={
          isPresentation
            ? "relative flex min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4 xl:px-6 xl:py-6"
            : "relative flex min-h-0 flex-1 overflow-hidden px-3 pt-3 sm:px-4 sm:pt-4 xl:px-6 xl:pt-6"
        }
      >
        <div className="flex h-full w-full min-h-0 flex-1 gap-3 xl:gap-4">
          <div data-layout-id="region_canvas_primary" className="min-w-0 flex-1">
            <CanvasStage>{children}</CanvasStage>
          </div>
          {showDataInputPanelPolicy &&
            (useLayoutSlotCutover ? (
              <aside
                data-layout-id="region_left_panel_slot"
                className="w-full max-w-[420px] min-w-[300px]"
              >
                <div data-extension-slot-host="left-panel" className="h-full">
                  <ExtensionSlot slot="left-panel" />
                </div>
              </aside>
            ) : (
              <DataInputPanel />
            ))}
        </div>
      </main>

      {!isPresentation && (
        <footer
          data-layout-id="region_chrome_bottom"
          className={
            isFullscreenInkActive
              ? "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-center px-3 pb-3 sm:px-4 sm:pb-4"
              : "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-center px-3 pb-3 sm:px-4 sm:pb-4 xl:pointer-events-auto xl:static xl:px-6 xl:pb-6"
          }
        >
          {showStudentPlayerBarPolicy ? (
            <div className="pointer-events-auto flex w-full justify-center">
              <PlayerBar readOnly />
            </div>
          ) : showHostToolchipsPolicy ? (
            <div
              data-layout-id="region_toolchips"
              className={
                isFullscreenInkActive
                  ? "pointer-events-auto flex w-full max-w-[min(980px,96vw)] flex-col gap-2"
                  : "pointer-events-auto flex w-full max-w-[min(1120px,96vw)] flex-col gap-2 xl:max-w-[min(1120px,94vw)]"
              }
            >
              {useLayoutSlotCutover ? (
                <div data-extension-slot-host="toolbar-bottom" className="flex flex-col gap-2">
                  <ExtensionSlot slot="toolbar-bottom" />
                </div>
              ) : (
                <>
                  <div className={isFullscreenInkActive ? "hidden" : "hidden xl:block"}>
                    <Prompter />
                  </div>
                  <div data-extension-slot-host="toolbar-bottom" className="flex flex-col gap-2">
                    <ExtensionSlot slot="toolbar-bottom" />
                  </div>
                  <FloatingToolbar />
                </>
              )}
            </div>
          ) : null}
        </footer>
      )}
      {isPresentation && (
        <footer className="relative flex items-center justify-center px-3 pb-3 sm:px-4 sm:pb-4 xl:px-6 xl:pb-6">
          <PlayerBar readOnly={isPolicyStudentRole} />
        </footer>
      )}
      {showPasteHelperModalPolicy && <PasteHelperModal />}
      {isFullscreenInkActive && !isPresentation && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="pointer-events-auto absolute left-3 top-3 sm:left-4 sm:top-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-white/20 bg-black/60 text-white hover:bg-black/75"
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
