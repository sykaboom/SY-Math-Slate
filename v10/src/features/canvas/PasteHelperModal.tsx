"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { extractImageFilesFromClipboard } from "@features/canvas/paste/pasteNormalization";
import { useImageInsert } from "@features/hooks/useImageInsert";
import { useUIStore } from "@features/store/useUIStoreBridge";

export function PasteHelperModal() {
  const { isPasteHelperOpen, closePasteHelper } = useUIStore();
  const { insertImageFile } = useImageInsert();
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPasteHelperOpen) return;
    const id = window.setTimeout(() => targetRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [isPasteHelperOpen]);

  if (typeof document === "undefined" || !isPasteHelperOpen) return null;

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const [imageFile] = extractImageFilesFromClipboard(event);
    if (!imageFile) return;
    event.preventDefault();
    await insertImageFile(imageFile);
    closePasteHelper();
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-theme-surface/70 backdrop-blur-sm"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div className="w-[360px] max-w-[90vw] rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-overlay)] p-6 text-center text-[var(--theme-text)] shadow-xl">
        <p className="text-sm font-semibold text-[var(--theme-warning)]">태블릿 붙여넣기 도우미</p>
        <p className="mt-2 text-xs text-theme-text/60">
          아래 박스를 길게 눌러 ‘붙여넣기’를 선택하세요.
        </p>
        <div
          ref={targetRef}
          onPaste={handlePaste}
          contentEditable
          suppressContentEditableWarning
          className="mt-4 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--theme-accent)] bg-[var(--theme-surface-soft)] text-sm text-[var(--theme-text-muted)] outline-none"
        >
          여기를 길게 터치하여<br />&apos;붙여넣기&apos;를 선택하세요.
        </div>
        <button
          className="mt-4 rounded-full border border-theme-border/10 px-6 py-2 text-xs text-theme-text/70 hover:bg-theme-surface-soft"
          onClick={closePasteHelper}
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}
