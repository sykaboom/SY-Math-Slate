"use client";

import { useRef } from "react";
import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useFileIO } from "@/hooks/useFileIO";
import { cn } from "@/lib/utils";
import { usePersistence } from "@/hooks/usePersistence";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useUIStore, type Tool } from "@/store/useUIStore";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  FolderOpen,
  Hand,
  Image as ImageIcon,
  PenLine,
  Redo2,
  Save,
  Type,
  Undo2,
  Zap,
} from "lucide-react";

import { LaserControls } from "./LaserControls";
import { PenControls } from "./PenControls";

const activeButtonClass =
  "bg-neon-yellow text-black shadow-[0_0_16px_rgba(255,255,0,0.4)]";

export function FloatingToolbar() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { exportSlate, importSlate } = useFileIO();
  const { saveNow, saveStatus } = usePersistence();
  const { activeTool, openPanel, setTool, togglePanel } = useUIStore();
  const { pageOrder, currentPageId, prevPage, nextPage, undo, pages } =
    useCanvasStore();

  const isPenOpen = openPanel === "pen";
  const isLaserOpen = openPanel === "laser";
  const totalPages = pageOrder.length;
  const currentIndex = Math.max(0, pageOrder.indexOf(currentPageId));
  const currentStrokes = pages[currentPageId] ?? [];
  const canUndo = currentStrokes.length > 0;

  const handleTool = (tool: Tool) => () => setTool(tool);

  const handlePenClick = () => {
    if (activeTool === "pen") {
      togglePanel("pen");
      return;
    }
    setTool("pen");
  };

  const handleLaserClick = () => {
    if (activeTool === "laser") {
      togglePanel("laser");
      return;
    }
    setTool("laser");
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await importSlate(file);
    if (result.ok) {
      window.alert("불러오기 완료");
    } else {
      window.alert("파일을 불러오지 못했습니다.");
    }
    event.target.value = "";
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/90 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <input
          ref={fileInputRef}
          type="file"
          accept=".slate"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleTool("hand")}
          className={cn(
            "h-10 w-10 text-white/70 hover:text-white",
            activeTool === "hand" && activeButtonClass
          )}
          aria-pressed={activeTool === "hand"}
        >
          <Hand className="h-4 w-4" />
        </Button>

        <Popover open={isPenOpen} onOpenChange={(open) => !open && isPenOpen && togglePanel("pen")}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePenClick}
              className={cn(
                "h-10 w-10 text-white/70 hover:text-white",
                activeTool === "pen" && activeButtonClass
              )}
              aria-pressed={activeTool === "pen"}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            sideOffset={18}
            className="w-auto rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <PenControls />
          </PopoverContent>
        </Popover>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleTool("eraser")}
          className={cn(
            "h-10 w-10 text-white/70 hover:text-white",
            activeTool === "eraser" && activeButtonClass
          )}
          aria-pressed={activeTool === "eraser"}
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Popover
          open={isLaserOpen}
          onOpenChange={(open) => !open && isLaserOpen && togglePanel("laser")}
        >
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleLaserClick}
              className={cn(
                "h-10 w-10 text-white/70 hover:text-white",
                activeTool === "laser" && activeButtonClass
              )}
              aria-pressed={activeTool === "laser"}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            sideOffset={18}
            className="w-auto rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <LaserControls />
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleTool("text")}
          className={cn(
            "h-10 w-10 text-white/70 hover:text-white",
            activeTool === "text" && activeButtonClass
          )}
          aria-pressed={activeTool === "text"}
        >
          <Type className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          disabled
          className="h-10 w-10 text-white/40"
          aria-label="Image (coming soon)"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
          <Button
            size="icon"
            variant="ghost"
            onClick={prevPage}
            disabled={currentIndex === 0}
            className="h-8 w-8 text-white/70 hover:text-white disabled:text-white/30"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {currentIndex + 1} / {totalPages}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={nextPage}
            className="h-8 w-8 text-white/70 hover:text-white"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

        <Button
          size="icon"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo}
          className="h-10 w-10 text-white/70 hover:text-white disabled:text-white/30"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled
          className="h-10 w-10 text-white/40"
          aria-label="Redo (coming soon)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleOpenClick}
          className="h-10 w-10 text-white/70 hover:text-white"
          aria-label="Open .slate"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={async () => {
            const result = await exportSlate();
            if (!result.ok) {
              window.alert("파일 저장에 실패했습니다.");
            }
          }}
          className="h-10 w-10 text-white/70 hover:text-white"
          aria-label="Save .slate"
        >
          <Download className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const result = saveNow();
              if (result.ok) {
                window.alert("로컬에 저장됨(임시)");
              } else {
                window.alert("로컬 저장에 실패했습니다.");
              }
            }}
            className="h-10 w-10 text-white/70 hover:text-white"
            aria-label="Save"
          >
            <Save className="h-4 w-4" />
          </Button>
          {saveStatus !== "idle" && (
            <span
              className={cn(
                "text-[11px] font-medium",
                saveStatus === "error"
                  ? "text-red-300"
                  : "text-amber-200"
              )}
            >
              {saveStatus === "error" ? "저장 오류" : "저장 중"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
