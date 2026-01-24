"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  useCanvasStore,
  type PersistedCanvas,
} from "@/store/useCanvasStore";

const STORAGE_KEY = "v10_board_data";
const DEFAULT_DEBOUNCE_MS = 600;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

type SaveStatus = "idle" | "saving" | "error";

type PersistedCanvasInput = {
  pages: Record<string, unknown>;
  pageOrder?: unknown;
  currentPageId?: unknown;
};

const isPersistedCanvasInput = (
  value: unknown
): value is PersistedCanvasInput => {
  if (!isRecord(value)) return false;
  if (!isRecord(value.pages)) return false;
  return true;
};

const isValidStroke = (
  value: unknown
): value is PersistedCanvas["pages"][string][number] => {
  if (!isRecord(value)) return false;
  const path = value.path;
  return Array.isArray(path) && path.length > 0;
};

const createPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizePersistedCanvas = (
  data: PersistedCanvasInput
): PersistedCanvas => {
  const pages = data.pages ?? {};
  const orderedIds = (Array.isArray(data.pageOrder)
    ? data.pageOrder.filter((id) => typeof id === "string" && id in pages)
    : []) as string[];
  const orphanedIds = Object.keys(pages).filter(
    (id) => !orderedIds.includes(id)
  );
  if (orphanedIds.length > 0) {
    console.warn(
      "[slate] Orphaned pages recovered:",
      orphanedIds.join(", ")
    );
  }
  const mergedOrder = [...orderedIds, ...orphanedIds];
  const fallbackOrder =
    mergedOrder.length > 0 ? mergedOrder : Object.keys(pages);
  const normalizedOrder =
    fallbackOrder.length > 0 ? fallbackOrder : [createPageId()];

  const normalizedPages: Record<string, PersistedCanvas["pages"][string]> = {};

  Object.keys(pages).forEach((id) => {
    const rawStrokes = Array.isArray(pages[id]) ? pages[id] : [];
    const filtered = rawStrokes.filter(isValidStroke);
    if (filtered.length !== rawStrokes.length) {
      console.warn(`[slate] Dropped invalid strokes on page ${id}`);
    }
    normalizedPages[id] = filtered;
  });

  normalizedOrder.forEach((id) => {
    if (!normalizedPages[id]) normalizedPages[id] = [];
  });

  const currentPageId =
    typeof data.currentPageId === "string" &&
    normalizedPages[data.currentPageId]
      ? data.currentPageId
      : normalizedOrder[0];

  return {
    version: 1,
    pages: normalizedPages,
    pageOrder: normalizedOrder,
    currentPageId,
  };
};

export function usePersistence(options?: {
  autoSave?: boolean;
  debounceMs?: number;
}) {
  const autoSave = options?.autoSave ?? true;
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const timeoutRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);
  const errorNotifiedRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  const saveSnapshot = useCallback((
    data: PersistedCanvas,
    options?: { notifyOnError?: boolean; context?: string }
  ) => {
    const payload: PersistedCanvas = {
      version: 1,
      pages: data.pages,
      pageOrder: data.pageOrder,
      currentPageId: data.currentPageId,
    };
    setSaveStatus("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSaveStatus("idle");
      setLastError(null);
      errorNotifiedRef.current = false;
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
  }, []);

  const saveNow = useCallback(() => {
    const state = useCanvasStore.getState();
    return saveSnapshot(
      {
        version: 1,
        pages: state.pages,
        pageOrder: state.pageOrder,
        currentPageId: state.currentPageId,
      },
      { context: "manual-save" }
    );
  }, [saveSnapshot]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (isPersistedCanvasInput(parsed)) {
          const normalized = normalizePersistedCanvas(parsed);
          useCanvasStore.getState().hydrate(normalized);
        }
      } catch {
        // Ignore malformed local data.
      }
    }
    isReadyRef.current = true;
  }, []);

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
            version: 1,
            pages: state.pages,
            pageOrder: state.pageOrder,
            currentPageId: state.currentPageId,
          },
          { notifyOnError: true, context: "auto-save" }
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

  return { saveNow, saveStatus, lastError };
}
