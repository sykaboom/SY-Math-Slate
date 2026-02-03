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
  } = useUIStore();
  const isPresentation = viewMode === "presentation";
  const zoomLabel = isOverviewMode ? Math.round(overviewZoom * 100) : 100;

  const handleHeaderZoom = (delta: number) => {
    if (!isOverviewMode) return;
    setOverviewZoom(overviewZoom + delta);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-slate-app text-white">
      {!isPresentation && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                SY
              </span>
              <div>
                <p className="text-lg font-semibold">Math Slate</p>
                <p className="text-xs text-white/50">Dark Canvas Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
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
              >
                <ZoomIn className="h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </header>
      )}

      <main
        className={
          isPresentation
            ? "relative flex min-h-0 flex-1 overflow-hidden px-6 py-6"
            : "relative flex min-h-0 flex-1 overflow-hidden px-6 pt-6"
        }
      >
        <div className="flex h-full w-full min-h-0 flex-1 gap-4">
          <div className="min-w-0 flex-1">
            <CanvasStage>{children}</CanvasStage>
          </div>
          {!isPresentation && <DataInputPanel />}
        </div>
      </main>

      {!isPresentation && (
        <footer className="relative flex flex-col items-center px-6 pb-6">
          <div className="flex w-full max-w-[min(1120px,94vw)] flex-col gap-2">
            <Prompter />
            <FloatingToolbar />
          </div>
        </footer>
      )}
      {isPresentation && (
        <footer className="relative flex items-center justify-center px-6 pb-6">
          <PlayerBar />
        </footer>
      )}
      {!isPresentation && <PasteHelperModal />}
    </div>
  );
}
