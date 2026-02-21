"use client";

import { useCallback } from "react";

import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import type { ImageItem } from "@core/foundation/types/canvas";
import { getBoardSize } from "@core/foundation/policies/boardSpec";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

const createItemId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const loadImageSize = (src: string) =>
  new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });

export function useImageInsert() {
  const { addItem, selectItem, pageColumnCounts, currentPageId } =
    useCanvasStore();
  const ratio = useUIStore((state) => state.overviewViewportRatio);

  const insertImageFile = useCallback(
    async (file: File, options?: { containerWidth?: number }) => {
      if (!file.type.startsWith("image/")) return;
      const objectUrl = URL.createObjectURL(file);
      try {
        const { w: naturalW, h: naturalH } = await loadImageSize(objectUrl);
        const containerWidth =
          options?.containerWidth ?? getBoardSize(ratio).width;
        const columns = Math.max(
          1,
          pageColumnCounts?.[currentPageId] ?? 2
        );
        const gap = 48;
        const available = Math.max(0, containerWidth - gap * (columns - 1));
        const columnWidth = available / columns;
        const maxWidth = Math.max(200, columnWidth * 0.9);
        const scale = Math.min(1, maxWidth / naturalW);
        const width = Math.max(80, Math.round(naturalW * scale));
        const height = Math.max(60, Math.round(naturalH * scale));

        const imageItem: ImageItem = {
          id: createItemId(),
          type: "image",
          src: objectUrl,
          w: width,
          h: height,
          x: 0,
          y: 0,
          zIndex: Date.now(),
          layoutMode: "flow",
        };
        addItem(imageItem);
        selectItem(imageItem.id);
      } catch {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [addItem, currentPageId, pageColumnCounts, ratio, selectItem]
  );

  return { insertImageFile };
}
