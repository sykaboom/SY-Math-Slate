"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useImageInsert } from "@features/hooks/useImageInsert";
import { useUIStore } from "@features/store/useUIStore";

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
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          await insertImageFile(file);
          closePasteHelper();
          return;
        }
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[360px] max-w-[90vw] rounded-2xl border border-white/10 bg-slate-900/95 p-6 text-center text-white shadow-xl">
        <p className="text-sm font-semibold text-amber-300">태블릿 붙여넣기 도우미</p>
        <p className="mt-2 text-xs text-white/60">
          아래 박스를 길게 눌러 ‘붙여넣기’를 선택하세요.
        </p>
        <div
          ref={targetRef}
          onPaste={handlePaste}
          contentEditable
          suppressContentEditableWarning
          className="mt-4 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-cyan-300/70 bg-black/40 text-sm text-white/70 outline-none"
        >
          여기를 길게 터치하여<br />'붙여넣기'를 선택하세요.
        </div>
        <button
          className="mt-4 rounded-full border border-white/10 px-6 py-2 text-xs text-white/70 hover:bg-white/10"
          onClick={closePasteHelper}
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}
