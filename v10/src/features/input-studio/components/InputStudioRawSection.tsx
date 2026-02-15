"use client";

import { useMemo, useRef, type UIEvent } from "react";

import { cn } from "@core/utils";
import type { InputStudioRawSectionProps } from "@features/input-studio/hooks/types";

const DEFAULT_LABEL = "원문 입력";
const DEFAULT_HELPER_TEXT =
  "원문 수정 시 블록은 비파괴 동기화됩니다. 매칭 실패 블록은 임시 보관됩니다.";
const DEFAULT_PLACEHOLDER = "여기에 문제/풀이를 줄 단위로 붙여넣으세요.";

export function InputStudioRawSection({
  rawText,
  onRawTextChange,
  onRawScroll,
  label = DEFAULT_LABEL,
  helperText = DEFAULT_HELPER_TEXT,
  placeholder = DEFAULT_PLACEHOLDER,
  syncDecisionCount = 0,
  syncDecisionSummaryText,
  disabled = false,
  className,
}: InputStudioRawSectionProps) {
  const markerRailRef = useRef<HTMLDivElement | null>(null);
  const rawLines = useMemo(() => rawText.split(/\r?\n/), [rawText]);
  const isSingleLine = rawLines.length <= 1;
  const lineHeight = isSingleLine ? 1.25 : 1.6;
  const lineHeightClass = isSingleLine ? "leading-[1.25]" : "leading-[1.6]";
  const summaryText =
    syncDecisionSummaryText ?? `동기화 결과: ${syncDecisionCount}줄 처리`;

  const handleRawScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (markerRailRef.current) {
      markerRailRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
    }
    onRawScroll?.(event.currentTarget.scrollTop);
  };

  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <label className="text-xs font-semibold text-white/60">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute bottom-3 left-3 top-3 w-4 overflow-hidden text-sm text-white/25">
          <div ref={markerRailRef} className="flex flex-col">
            {rawLines.map((_, index) => (
              <span
                key={`marker-${index}`}
                style={{
                  height: `${lineHeight}em`,
                  lineHeight: `${lineHeight}em`,
                }}
              >
                ·
              </span>
            ))}
          </div>
        </div>
        <textarea
          className={cn(
            "h-40 w-full resize-none rounded-lg border border-white/10 bg-black/40 pb-3 pl-8 pr-3 pt-3 text-sm text-white/80 outline-none focus:border-white/40",
            lineHeightClass
          )}
          value={rawText}
          onChange={(event) => onRawTextChange(event.target.value)}
          onScroll={handleRawScroll}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      <p className="text-[11px] text-white/40">{helperText}</p>
      {syncDecisionCount > 0 && (
        <p className="text-[11px] text-white/30">{summaryText}</p>
      )}
    </section>
  );
}
