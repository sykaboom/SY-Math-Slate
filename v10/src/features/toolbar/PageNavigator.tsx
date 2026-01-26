"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCanvasStore } from "@features/store/useCanvasStore";

import { ToolButton } from "./atoms/ToolButton";

export function PageNavigator() {
  const { pageOrder, currentPageId, prevPage, nextPage } = useCanvasStore();
  const totalPages = pageOrder.length || 1;
  const currentIndex = Math.max(0, pageOrder.indexOf(currentPageId));

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
      <ToolButton
        icon={ChevronLeft}
        label="Previous Page"
        onClick={prevPage}
        disabled={currentIndex === 0}
        className="h-8 w-8"
      />
      <span className="whitespace-nowrap">
        Page {currentIndex + 1} / {totalPages}
      </span>
      <ToolButton
        icon={ChevronRight}
        label="Next Page"
        onClick={nextPage}
        className="h-8 w-8"
      />
    </div>
  );
}
