"use client";

import { useEffect, useMemo, useState } from "react";

import type { SnapshotScope } from "@core/types/snapshot";
import { cn } from "@core/utils";
import { LayerPickerModal } from "@features/sharing/LayerPickerModal";
import { ShareScopeSelector } from "@features/sharing/ShareScopeSelector";
import { useSnapshotShare } from "@features/sharing/useSnapshotShare";
import { useCanvasStore } from "@features/store/useCanvasStore";

type ShareButtonProps = {
  isPublic: boolean;
  disabled?: boolean;
};

type ShareStatus = "idle" | "copied" | "error";

const copyText = async (text: string): Promise<boolean> => {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below.
    }
  }

  if (typeof document === "undefined") return false;
  const element = document.createElement("textarea");
  element.value = text;
  element.setAttribute("readonly", "");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  document.body.appendChild(element);
  element.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(element);
  return copied;
};

export function ShareButton({ isPublic, disabled = false }: ShareButtonProps) {
  const { createSnapshotShare } = useSnapshotShare();
  const { pageOrder, currentPageId } = useCanvasStore((state) => ({
    pageOrder: state.pageOrder,
    currentPageId: state.currentPageId,
  }));
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [scope, setScope] = useState<SnapshotScope>("full_canvas");
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [isLayerPickerOpen, setIsLayerPickerOpen] = useState(false);

  const resolvedLayerIds = useMemo(() => {
    if (scope !== "selected_layer") return [];
    const available = new Set(pageOrder);
    const selected = selectedLayerIds.filter((layerId) => available.has(layerId));
    if (selected.length > 0) return selected;
    if (currentPageId && available.has(currentPageId)) return [currentPageId];
    return pageOrder[0] ? [pageOrder[0]] : [];
  }, [currentPageId, pageOrder, scope, selectedLayerIds]);

  useEffect(() => {
    if (status !== "copied") return;
    const timeout = window.setTimeout(() => {
      setStatus("idle");
      setFeedback("");
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [status]);

  const buttonLabel = useMemo(() => {
    if (status === "copied") return "Copied";
    return "Share";
  }, [status]);

  const handleShare = async () => {
    if (disabled) return;

    if (scope === "selected_layer" && resolvedLayerIds.length === 0) {
      setStatus("error");
      setFeedback("Pick a layer before sharing.");
      return;
    }

    const result = createSnapshotShare({
      isPublic,
      scope,
      layerIds: resolvedLayerIds,
    });
    if (!result.ok) {
      setStatus("error");
      setFeedback(result.error);
      return;
    }

    const absoluteViewerUrl =
      typeof window === "undefined"
        ? result.meta.viewerUrl
        : new URL(result.meta.viewerUrl, window.location.origin).toString();

    const didCopy = await copyText(absoluteViewerUrl);
    if (!didCopy) {
      setStatus("error");
      setFeedback(`Created: ${absoluteViewerUrl}`);
      return;
    }

    setStatus("copied");
    setFeedback(absoluteViewerUrl);
  };

  return (
    <div className="flex items-center gap-2">
      <ShareScopeSelector
        scope={scope}
        selectedLayerCount={resolvedLayerIds.length}
        disabled={disabled}
        onScopeChange={(nextScope) => {
          if (disabled) return;
          setScope(nextScope);
          setStatus("idle");
          setFeedback("");
          if (nextScope === "selected_layer") {
            setIsLayerPickerOpen(true);
          } else {
            setIsLayerPickerOpen(false);
          }
        }}
        onOpenLayerPicker={() => setIsLayerPickerOpen(true)}
      />
      <button
        type="button"
        className={cn(
          "rounded-full border border-theme-border/10 px-3 py-1 text-[11px]",
          "transition-colors",
          disabled
            ? "cursor-not-allowed bg-theme-surface-soft text-theme-text/40"
            : status === "copied"
              ? "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
              : status === "error"
                ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                : "bg-theme-surface-soft text-theme-text/75 hover:bg-theme-surface/30"
        )}
        onClick={() => {
          void handleShare();
        }}
        disabled={disabled}
        aria-label="Create snapshot and copy viewer URL"
      >
        {buttonLabel}
      </button>
      {feedback ? (
        <span
          className={cn(
            "max-w-[220px] truncate text-[10px]",
            status === "error" ? "text-rose-200/90" : "text-theme-text/60"
          )}
          title={feedback}
        >
          {feedback}
        </span>
      ) : null}
      <LayerPickerModal
        open={isLayerPickerOpen}
        pageOrder={pageOrder}
        currentPageId={currentPageId}
        selectedLayerIds={resolvedLayerIds}
        onClose={() => setIsLayerPickerOpen(false)}
        onConfirm={(layerIds) => {
          setSelectedLayerIds(layerIds);
          setScope("selected_layer");
          setIsLayerPickerOpen(false);
        }}
      />
    </div>
  );
}
