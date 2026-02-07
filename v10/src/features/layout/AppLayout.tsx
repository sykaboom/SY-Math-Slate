"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import { CanvasStage } from "@features/canvas/CanvasStage";
import { PasteHelperModal } from "@features/canvas/PasteHelperModal";
import { DataInputPanel } from "@features/layout/DataInputPanel";
import { Prompter } from "@features/layout/Prompter";
import { PlayerBar } from "@features/layout/PlayerBar";
import { Button } from "@ui/components/button";
import { useUIStore } from "@features/store/useUIStore";
import { Minus, MonitorPlay, Plus, ZoomIn } from "lucide-react";

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

export function AppLayout({ children }: AppLayoutProps) {
  const {
    viewMode,
    isOverviewMode,
    overviewZoom,
    setOverviewZoom,
    toggleOverviewMode,
    setViewMode,
    openDataInput,
    isDataInputOpen,
  } = useUIStore();
  const isPresentation = viewMode === "presentation";
  const zoomLabel = isOverviewMode ? Math.round(overviewZoom * 100) : 100;

  const handleHeaderZoom = (delta: number) => {
    if (!isOverviewMode) return;
    setOverviewZoom(overviewZoom + delta);
  };

  return (
    <div
      data-layout-state={isDataInputOpen ? "state_input_mode" : "state_canvas_mode"}
      className="flex h-[100dvh] w-full flex-col bg-slate-app text-white"
    >
      {!isPresentation && (
        <header
          data-layout-id="region_chrome_top"
          className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-4 sm:py-2.5 xl:px-6 xl:py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                SY
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold">Math Slate</p>
                <p className="text-xs text-white/50">Dark Canvas Workspace</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
                onClick={() => setViewMode("presentation")}
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
          {!isPresentation && <DataInputPanel />}
        </div>
      </main>

      {!isPresentation && (
        <footer
          data-layout-id="region_chrome_bottom"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-center px-3 pb-3 sm:px-4 sm:pb-4 xl:pointer-events-auto xl:static xl:px-6 xl:pb-6"
        >
          <div
            data-layout-id="region_toolchips"
            className="pointer-events-auto flex w-full max-w-[min(1120px,96vw)] flex-col gap-2 xl:max-w-[min(1120px,94vw)]"
          >
            <div className="hidden xl:block">
              <Prompter />
            </div>
            <FloatingToolbar />
          </div>
        </footer>
      )}
      {isPresentation && (
        <footer className="relative flex items-center justify-center px-3 pb-3 sm:px-4 sm:pb-4 xl:px-6 xl:pb-6">
          <PlayerBar />
        </footer>
      )}
      {!isPresentation && <PasteHelperModal />}
    </div>
  );
}
