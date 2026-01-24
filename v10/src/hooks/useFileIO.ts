"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
  useCanvasStore,
  type PersistedCanvas,
} from "@/store/useCanvasStore";

const MANIFEST_VERSION = "1.0";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 1000;

type BoardFileData = {
  pages: Record<string, PersistedCanvas["pages"][string]>;
  pageOrder: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidStroke = (
  value: unknown
): value is PersistedCanvas["pages"][string][number] => {
  if (!isRecord(value)) return false;
  const path = value.path;
  return Array.isArray(path) && path.length > 0;
};

const isValidBoardData = (value: unknown): value is BoardFileData => {
  if (!isRecord(value)) return false;
  if (!isRecord(value.pages)) return false;
  if (!Array.isArray(value.pageOrder)) return false;
  return true;
};

const createPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeBoardData = (data: BoardFileData): PersistedCanvas => {
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
  const fallbackOrder = mergedOrder.length > 0 ? mergedOrder : Object.keys(pages);
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

  return {
    version: 1,
    pages: normalizedPages,
    pageOrder: normalizedOrder,
    currentPageId: normalizedOrder[0],
  };
};

export function useFileIO() {
  const exportSlate = async () => {
    try {
      const state = useCanvasStore.getState();
      const zip = new JSZip();

      const manifest = {
        version: MANIFEST_VERSION,
        createdAt: new Date().toISOString(),
        title: "Untitled Board",
      };
      const board: BoardFileData = {
        pages: state.pages,
        pageOrder: state.pageOrder,
      };

      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("board.json", JSON.stringify(board));

      const blob = await zip.generateAsync({ type: "blob" });
      const filename = `math-slate-${Date.now()}.slate`;
      saveAs(blob, filename);
      return { ok: true } as const;
    } catch (error) {
      return { ok: false, error } as const;
    }
  };

  const importSlate = async (file: File) => {
    try {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
          ok: false,
          error: new Error("File too large"),
        } as const;
      }
      const zip = await JSZip.loadAsync(file);
      const entries = Object.keys(zip.files).length;
      if (entries > MAX_ZIP_ENTRIES) {
        return {
          ok: false,
          error: new Error("Too many entries in archive"),
        } as const;
      }
      const boardEntry = zip.file("board.json");
      if (!boardEntry) {
        return {
          ok: false,
          error: new Error("board.json not found"),
        } as const;
      }

      const raw = await boardEntry.async("string");
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidBoardData(parsed)) {
        return { ok: false, error: new Error("Invalid board.json") } as const;
      }

      const normalized = normalizeBoardData(parsed);
      useCanvasStore.getState().hydrate(normalized);
      return { ok: true } as const;
    } catch (error) {
      return { ok: false, error } as const;
    }
  };

  return { exportSlate, importSlate };
}
