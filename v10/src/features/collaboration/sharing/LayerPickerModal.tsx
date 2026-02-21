"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import { cn } from "@core/utils";

type LayerPickerModalProps = {
  open: boolean;
  pageOrder: string[];
  currentPageId: string | null;
  selectedLayerIds: string[];
  onConfirm: (layerIds: string[]) => void;
  onClose: () => void;
};

const resolveInitialLayerId = (
  pageOrder: string[],
  selectedLayerIds: string[],
  currentPageId: string | null
): string => {
  const selected = selectedLayerIds.find((layerId) => pageOrder.includes(layerId));
  if (selected) return selected;
  if (currentPageId && pageOrder.includes(currentPageId)) return currentPageId;
  return pageOrder[0] ?? "";
};

export function LayerPickerModal({
  open,
  pageOrder,
  currentPageId,
  selectedLayerIds,
  onConfirm,
  onClose,
}: LayerPickerModalProps) {
  const pageOptions = useMemo(
    () =>
      pageOrder.map((pageId, index) => ({
        pageId,
        label: `Layer ${index + 1}`,
      })),
    [pageOrder]
  );
  const selectedLayerId = useMemo(
    () => resolveInitialLayerId(pageOrder, selectedLayerIds, currentPageId),
    [pageOrder, selectedLayerIds, currentPageId]
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-theme-surface/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
      aria-hidden="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-theme-border/15 bg-theme-surface-overlay p-4 text-theme-text shadow-2xl">
        <p className="text-sm font-semibold">Pick Layer</p>
        <p className="mt-1 text-[11px] text-theme-text/60">
          Selected-layer scope shares only one page in this phase.
        </p>

        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {pageOptions.map((option) => {
            const isSelected = option.pageId === selectedLayerId;
            return (
              <button
                key={option.pageId}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                  isSelected
                    ? "border-theme-border/35 bg-theme-surface/45 text-theme-text"
                    : "border-theme-border/10 bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface/35"
                )}
                onClick={() => onConfirm([option.pageId])}
                aria-pressed={isSelected}
              >
                <span>{option.label}</span>
                <span className="max-w-[132px] truncate text-[10px] text-theme-text/45">
                  {option.pageId}
                </span>
              </button>
            );
          })}

          {pageOptions.length === 0 ? (
            <p className="rounded-xl border border-theme-border/10 bg-theme-surface-soft px-3 py-2 text-xs text-theme-text/55">
              No layers available.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-theme-border/10 px-3 py-1 text-[11px] text-theme-text/65 hover:bg-theme-surface-soft"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
