"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { migrateToV2 } from "@core/migrations/migrateToV2";
import { getBoardSize } from "@core/config/boardSpec";
import { toTextItemStyle } from "@core/config/typography";
import { buildPersistedDoc } from "@core/persistence/buildPersistedDoc";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStore";
import type { PersistedSlateDoc } from "@core/types/canvas";

const STORAGE_KEY = "v10_board_data";
const COORD_MIGRATION_KEY = "v10_board_coords_migrated";
const DEFAULT_DEBOUNCE_MS = 600;

type SaveStatus = "idle" | "saving" | "error";

export function usePersistence(options?: {
  autoSave?: boolean;
  debounceMs?: number;
}) {
  const autoSave = options?.autoSave ?? true;
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const timeoutRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);
  const errorNotifiedRef = useRef(false);
  const imageNotifiedRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const didSeedRef = useRef(false);

  const scalePx = (value: unknown, factor: number) => {
    if (typeof value === "number") return value * factor;
    if (typeof value === "string" && value.endsWith("px")) {
      const num = Number.parseFloat(value);
      if (Number.isFinite(num)) return `${num * factor}px`;
    }
    return value;
  };

  const scaleStyle = (style: Record<string, unknown> | undefined, factor: number) => {
    if (!style) return style;
    const next = { ...style };
    if ("fontSize" in next) {
      next.fontSize = scalePx(next.fontSize, factor);
    }
    return next;
  };

  const scalePersistedData = (
    data: PersistedSlateDoc,
    factor: number
  ): PersistedSlateDoc => {
    const scaledPages: PersistedSlateDoc["pages"] = {};
    Object.entries(data.pages).forEach(([pageId, items]) => {
      scaledPages[pageId] = items.map((item) => {
        const base = {
          ...item,
          x: item.x * factor,
          y: item.y * factor,
        } as typeof item;
        if (item.type === "stroke") {
          return {
            ...base,
            width: item.width * factor,
            path: item.path.map((p) => ({
              ...p,
              x: p.x * factor,
              y: p.y * factor,
            })),
          };
        }
        if (item.type === "image") {
          return {
            ...base,
            w: item.w * factor,
            h: item.h * factor,
          };
        }
        if (item.type === "text") {
          return {
            ...base,
            style: scaleStyle(item.style, factor),
          };
        }
        return base;
      });
    });
    return {
      ...data,
      pages: scaledPages,
    };
  };

  const getSeededItems = useCallback((): PersistedSlateDoc | null => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("seed") !== "1") return null;
    const state = useCanvasStore.getState();
    const pageId = state.pageOrder[0] ?? state.currentPageId;
    return {
      version: 2,
      pageOrder: state.pageOrder,
      pageColumnCounts: state.pageColumnCounts,
      pages: {
        ...state.pages,
        [pageId]: [
          {
            id: `seed-${Date.now()}-1`,
            type: "text",
            layoutMode: "flow",
            content: "문항 1. 그래프를 그려라.",
            x: 0,
            y: 0,
            zIndex: 0,
            stepIndex: 0,
            style: toTextItemStyle(undefined),
          },
          {
            id: `seed-${Date.now()}-2`,
            type: "text",
            layoutMode: "flow",
            content: "조건: $f(x)=x^2+1$ 을 만족한다.",
            x: 0,
            y: 0,
            zIndex: 1,
            stepIndex: 1,
            style: toTextItemStyle(undefined),
          },
          {
            id: `seed-${Date.now()}-3`,
            type: "text",
            layoutMode: "flow",
            content: "힌트: 도함수로 증가구간을 판단한다.",
            x: 0,
            y: 0,
            zIndex: 2,
            stepIndex: 2,
            style: toTextItemStyle(undefined),
          },
        ],
      },
    };
  }, []);

  const saveSnapshot = useCallback(
    (
      data: PersistedSlateDoc,
      options?: {
        notifyOnError?: boolean;
        notifyOnImageSkip?: boolean;
        context?: string;
      }
    ) => {
      const { doc: payload, hasImages } = buildPersistedDoc(data, {
        includeImages: false,
      });
      setSaveStatus("saving");
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setSaveStatus("idle");
        setLastError(null);
        errorNotifiedRef.current = false;
        if (hasImages && options?.notifyOnImageSkip && !imageNotifiedRef.current) {
          window.alert(
            "이미지 항목은 로컬 자동복구에 저장되지 않습니다. .slate로 저장해 주세요."
          );
          imageNotifiedRef.current = true;
        }
        return { ok: true } as const;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[persistence] ${options?.context ?? "save"} failed`,
          error
        );
        setSaveStatus("error");
        setLastError(message);
        if (options?.notifyOnError && !errorNotifiedRef.current) {
          window.alert("로컬 저장에 실패했습니다.");
          errorNotifiedRef.current = true;
        }
        return { ok: false, error } as const;
      }
    },
    []
  );

  const saveNow = useCallback(() => {
    const state = useCanvasStore.getState();
    return saveSnapshot(
      {
        version: 2,
        pages: state.pages,
        pageOrder: state.pageOrder,
        pageColumnCounts: state.pageColumnCounts,
        stepBlocks: state.stepBlocks,
        anchorMap: state.anchorMap ?? undefined,
        audioByStep: state.audioByStep,
        animationModInput: state.animationModInput,
      },
      { context: "manual-save", notifyOnImageSkip: true }
    );
  }, [saveSnapshot]);

  const clearLocal = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COORD_MIGRATION_KEY);
      setSaveStatus("idle");
      setLastError(null);
      errorNotifiedRef.current = false;
      imageNotifiedRef.current = false;
      return { ok: true } as const;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[persistence] clear failed", error);
      setSaveStatus("error");
      setLastError(message);
      return { ok: false, error } as const;
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        let normalized = migrateToV2(parsed);

        const hydrateState = (data: PersistedSlateDoc) => {
          useCanvasStore.getState().hydrate(data);
          isReadyRef.current = true;
        };

        if (!localStorage.getItem(COORD_MIGRATION_KEY)) {
          const ratio = useUIStore.getState().overviewViewportRatio;
          const tryMigrate = () => {
            const board = document.querySelector<HTMLElement>("[data-board-root]");
            if (!board) return false;
            const rect = board.getBoundingClientRect();
            const { width: boardWidth } = getBoardSize(ratio);
            const scale = rect.width / boardWidth;
            if (!Number.isFinite(scale) || scale <= 0) return false;
            normalized = scalePersistedData(normalized, 1 / scale);
            localStorage.setItem(COORD_MIGRATION_KEY, "1");
            return true;
          };
          if (!tryMigrate()) {
            requestAnimationFrame(() => {
              tryMigrate();
              hydrateState(normalized);
            });
            return;
          }
        }

        hydrateState(normalized);
        return;
      } catch {
        // Ignore malformed local data.
      }
    }

    if (!didSeedRef.current) {
        const seeded = getSeededItems();
        if (seeded) {
          didSeedRef.current = true;
          useCanvasStore.getState().hydrate(seeded);
        }
    }
    isReadyRef.current = true;
  }, [getSeededItems]);

  useEffect(() => {
    if (!autoSave) return;

    const unsub = useCanvasStore.subscribe((state) => {
      if (!isReadyRef.current) return;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        saveSnapshot(
          {
            version: 2,
            pages: state.pages,
            pageOrder: state.pageOrder,
            pageColumnCounts: state.pageColumnCounts,
            stepBlocks: state.stepBlocks,
            anchorMap: state.anchorMap ?? undefined,
            audioByStep: state.audioByStep,
            animationModInput: state.animationModInput,
          },
          { notifyOnError: true, context: "auto-save", notifyOnImageSkip: false }
        );
      }, debounceMs);
    });

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      unsub();
    };
  }, [autoSave, debounceMs, saveSnapshot]);

  return { saveNow, clearLocal, saveStatus, lastError };
}
