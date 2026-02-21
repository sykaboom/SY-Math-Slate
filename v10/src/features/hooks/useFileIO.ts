"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";

import { migrateToV2 } from "@core/pipelines/migrations/migrateToV2";
import { buildPersistedDoc } from "@core/pipelines/persistence/buildPersistedDoc";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useDocStore } from "@features/store/useDocStore";
import type { ImageItem, PersistedSlateDoc } from "@core/foundation/types/canvas";

const MANIFEST_VERSION = "1.0";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 1000;

type BoardFileData = PersistedSlateDoc;

const isImageItem = (item: unknown): item is ImageItem =>
  typeof item === "object" &&
  item !== null &&
  (item as ImageItem).type === "image";

const guessExtFromMime = (mime = "") => {
  const value = mime.toLowerCase();
  if (value.includes("png")) return "png";
  if (value.includes("jpeg") || value.includes("jpg")) return "jpg";
  if (value.includes("webp")) return "webp";
  if (value.includes("gif")) return "gif";
  if (value.includes("svg")) return "svg";
  return "png";
};

const guessMimeFromExt = (ext = "") => {
  const value = ext.toLowerCase();
  if (value === "jpg" || value === "jpeg") return "image/jpeg";
  if (value === "webp") return "image/webp";
  if (value === "gif") return "image/gif";
  if (value === "svg") return "image/svg+xml";
  return "image/png";
};

const fetchBytes = async (src: string) => {
  const response = await fetch(src);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return { bytes: new Uint8Array(buffer), mime: blob.type || "image/png" };
};

const collectImageAssets = async (pages: PersistedSlateDoc["pages"]) => {
  const entries: { path: string; data: Uint8Array }[] = [];
  const map = new Map<string, string>();
  let counter = 1;
  for (const items of Object.values(pages)) {
    for (const item of items) {
      if (!isImageItem(item)) continue;
      if (map.has(item.src)) continue;
      try {
        const { bytes, mime } = await fetchBytes(item.src);
        const ext = guessExtFromMime(mime);
        const path = `assets/images/image_${counter}.${ext}`;
        counter += 1;
        map.set(item.src, path);
        entries.push({ path, data: bytes });
      } catch {
        // Skip failed assets.
      }
    }
  }
  return { entries, map };
};

const syncDocStoreFromCanvas = (): PersistedSlateDoc => {
  const canvasState = useCanvasStore.getState();
  const docStore = useDocStore.getState();

  docStore.syncFromCanvas({
    version: canvasState.version,
    pages: canvasState.pages,
    pageOrder: canvasState.pageOrder,
    pageColumnCounts: canvasState.pageColumnCounts,
    stepBlocks: canvasState.stepBlocks,
    anchorMap: canvasState.anchorMap ?? undefined,
    audioByStep: canvasState.audioByStep,
    animationModInput: canvasState.animationModInput,
  });

  return docStore.getDocSnapshot();
};

const hydrateDocStore = (doc: PersistedSlateDoc) => {
  useDocStore.getState().hydrateDoc(doc);
};

export function useFileIO() {
  const exportSlate = async () => {
    try {
      const docSnapshot = syncDocStoreFromCanvas();
      const zip = new JSZip();
      const { entries, map } = await collectImageAssets(docSnapshot.pages);

      const manifest = {
        version: MANIFEST_VERSION,
        createdAt: new Date().toISOString(),
        title: "Untitled Board",
      };
      const mappedPages = Object.fromEntries(
        Object.entries(docSnapshot.pages).map(([pageId, items]) => [
          pageId,
          items.map((item) => {
            if (!isImageItem(item)) return item;
            const nextSrc = map.get(item.src);
            if (!nextSrc) return item;
            return { ...item, src: nextSrc };
          }),
        ])
      );
      const { doc: board } = buildPersistedDoc({
        version: docSnapshot.version,
        pages: mappedPages,
        pageOrder: docSnapshot.pageOrder,
        pageColumnCounts: docSnapshot.pageColumnCounts,
        stepBlocks: docSnapshot.stepBlocks,
        anchorMap: docSnapshot.anchorMap ?? undefined,
        audioByStep: docSnapshot.audioByStep,
        animationModInput: docSnapshot.animationModInput,
      });

      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("board.json", JSON.stringify(board));
      entries.forEach((entry) => {
        zip.file(entry.path, entry.data);
      });

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
      const normalized = migrateToV2(parsed);
      const assetMap = new Map<string, string>();
      await Promise.all(
        Object.keys(zip.files)
          .filter((path) => path.startsWith("assets/"))
          .map(async (path) => {
            const entry = zip.file(path);
            if (!entry) return;
            const buffer = await entry.async("arraybuffer");
            const ext = path.split(".").pop() || "png";
            const blob = new Blob([buffer], { type: guessMimeFromExt(ext) });
            const url = URL.createObjectURL(blob);
            assetMap.set(path, url);
          })
      );

      const hydrated: BoardFileData = {
        ...normalized,
        pages: Object.fromEntries(
          Object.entries(normalized.pages).map(([pageId, items]) => [
            pageId,
            items.map((item) => {
              if (!isImageItem(item)) return item;
              const mapped = assetMap.get(item.src);
              return mapped ? { ...item, src: mapped } : item;
            }),
          ])
        ),
        pageColumnCounts: normalized.pageColumnCounts,
      };

      hydrateDocStore(hydrated);
      useCanvasStore.getState().hydrate(hydrated);
      return { ok: true } as const;
    } catch (error) {
      return { ok: false, error } as const;
    }
  };

  return { exportSlate, importSlate };
}
