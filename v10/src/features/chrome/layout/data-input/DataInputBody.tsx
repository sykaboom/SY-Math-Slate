import { type CSSProperties } from "react";

import { cn } from "@core/utils";
import {
  DEFAULT_TEXT_LINE_HEIGHT,
  TEXT_FONT_FAMILY_OPTIONS,
  TEXT_INLINE_BOLD_CLASS,
  TEXT_INLINE_COLOR_OPTIONS,
  TEXT_INLINE_SIZE_OPTIONS,
  normalizeTextSegmentStyle,
} from "@core/ui/theming/engine/typography";
import {
  InputStudioBlocksSection,
  InputStudioRawSection,
} from "@features/editor/input-studio/components";
import type { InputStudioBlockRenderArgs } from "@features/editor/input-studio/hooks/types";
import {
  StructuredSchemaEditor,
} from "@features/editor/input-studio/schema/StructuredSchemaEditor";
import {
  wrapSelectionWithClass,
  wrapSelectionWithHighlight,
  wrapSelectionWithMath,
} from "@features/chrome/layout/dataInput/segmentCommands";
import { Button } from "@ui/components/button";
import { ImagePlus, Minus, PlaySquare, Plus } from "lucide-react";

import type { DataInputPanelRuntime } from "./useDataInputPanelRuntime";

const FONT_SIZE_PATTERN_PX = /^(\d+(?:\.\d+)?)px$/i;

const parseFontSizePx = (
  value: string | undefined,
  fallback: number
): number => {
  if (!value) return fallback;
  const match = value.trim().match(FONT_SIZE_PATTERN_PX);
  if (!match) return fallback;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed);
};

const formatDiagnostic = (
  diagnostic: DataInputPanelRuntime["body"]["pipelineDiagnostics"][number]
): string => {
  const scope = diagnostic.stepId ? `[${diagnostic.stepId}] ` : "";
  return `${scope}${diagnostic.phase}:${diagnostic.code} - ${diagnostic.message}`;
};

type DataInputBodyProps = {
  body: DataInputPanelRuntime["body"];
};

export function DataInputBody({ body }: DataInputBodyProps) {
  const renderExpandedContent = ({
    block,
  }: InputStudioBlockRenderArgs) => {
    let imageIndex = 0;
    let videoIndex = 0;

    return (
      <>
        <div className="flex flex-col gap-2">
          {block.segments.map((segment) => {
            const label =
              segment.type === "text"
                ? "TXT"
                : segment.type === "image"
                  ? `img${String(++imageIndex).padStart(2, "0")}`
                  : `play${String(++videoIndex).padStart(2, "0")}`;

            const textStyle =
              segment.type === "text"
                ? normalizeTextSegmentStyle(segment.style)
                : null;

            const editorStyle: CSSProperties | undefined = textStyle
              ? {
                  fontFamily: textStyle.fontFamily,
                  fontSize: textStyle.fontSize,
                  fontWeight: textStyle.fontWeight as CSSProperties["fontWeight"],
                  color: textStyle.color,
                  lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
                }
              : undefined;

            const fontSizePx = textStyle
              ? parseFontSizePx(textStyle.fontSize, body.defaultFontSizePx)
              : body.defaultFontSizePx;
            const canDecreaseFontSize = fontSizePx > body.fontSizeMinPx;
            const canIncreaseFontSize = fontSizePx < body.fontSizeMaxPx;

            return (
              <div
                key={segment.id}
                className="flex items-start gap-2 rounded-md border border-theme-border/10 bg-theme-surface/30 p-2"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", `${block.id}:${segment.id}`);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const raw = event.dataTransfer.getData("text/plain");
                  const [fromBlockId, fromSegmentId] = raw.split(":");
                  if (!fromBlockId || !fromSegmentId || fromBlockId !== block.id) {
                    return;
                  }
                  body.moveSegment(block.id, fromSegmentId, segment.id);
                }}
              >
                <span
                  data-segment-drag
                  className="rounded-full border border-theme-border/20 bg-theme-surface-soft px-2 py-0.5 text-[10px] uppercase text-theme-text/70"
                >
                  {label}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {segment.type === "text" ? (
                    <>
                      <div
                        ref={(node) => {
                          body.segmentRefs.current[segment.id] = node;
                        }}
                        className={cn(
                          "min-h-[40px] rounded-md border border-theme-border/10 bg-theme-surface/30 px-2 py-2 text-sm text-theme-text/80 outline-none",
                          "focus-within:border-theme-border/40"
                        )}
                        style={editorStyle}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={() => body.onSegmentCommit(segment.id)}
                        dangerouslySetInnerHTML={{
                          __html: segment.html,
                        }}
                      />

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex h-11 min-w-[192px] items-center gap-2 rounded-md border border-theme-border/15 bg-theme-surface/40 px-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-theme-text/45">
                              폰트
                            </span>
                            <select
                              className="h-9 min-w-[108px] flex-1 rounded-md border border-theme-border/15 bg-theme-surface/50 px-2 text-[11px] text-theme-text/80 outline-none"
                              value={textStyle?.fontFamily ?? ""}
                              onChange={(event) =>
                                body.updateTextSegmentStyle(block.id, segment.id, {
                                  fontFamily: event.target.value,
                                })
                              }
                            >
                              {TEXT_FONT_FAMILY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="inline-flex h-11 items-center rounded-md border border-theme-border/15 bg-theme-surface/40">
                            <Button
                              variant="ghost"
                              className="h-11 rounded-r-none px-3 text-[11px] text-theme-text/75 hover:text-theme-text"
                              onClick={() =>
                                body.adjustTextSegmentFontSize(
                                  block.id,
                                  segment.id,
                                  -body.fontSizeStepPx
                                )
                              }
                              disabled={!canDecreaseFontSize}
                            >
                              A-
                            </Button>
                            <span className="min-w-[56px] border-x border-[var(--theme-border)] px-2 text-center text-[11px] font-semibold text-[var(--theme-text)]">
                              {fontSizePx}px
                            </span>
                            <Button
                              variant="ghost"
                              className="h-11 rounded-l-none px-3 text-[11px] text-theme-text/75 hover:text-theme-text"
                              onClick={() =>
                                body.adjustTextSegmentFontSize(
                                  block.id,
                                  segment.id,
                                  body.fontSizeStepPx
                                )
                              }
                              disabled={!canIncreaseFontSize}
                            >
                              A+
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            className="h-10 px-3 text-[11px] font-bold"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              wrapSelectionWithClass(
                                segment.id,
                                TEXT_INLINE_BOLD_CLASS,
                                body.segmentRefs.current,
                                body.selectionRef.current,
                                body.updateSegmentHtml
                              );
                            }}
                          >
                            B
                          </Button>
                          {body.canMath && (
                            <Button
                              variant="outline"
                              className="h-10 px-3 text-[11px]"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                wrapSelectionWithMath(
                                  segment.id,
                                  body.segmentRefs.current,
                                  body.selectionRef.current,
                                  body.updateSegmentHtml
                                );
                              }}
                            >
                              $$
                            </Button>
                          )}
                          {body.canHighlight && (
                            <Button
                              variant="outline"
                              className="h-10 px-3 text-[11px]"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                wrapSelectionWithHighlight(
                                  segment.id,
                                  body.segmentRefs.current,
                                  body.selectionRef.current,
                                  body.updateSegmentHtml
                                );
                              }}
                            >
                              HL
                            </Button>
                          )}
                        </div>

                        {body.studioMode === "advanced" && (
                          <div className="flex flex-wrap items-center gap-2">
                            {TEXT_INLINE_COLOR_OPTIONS.map((option) => (
                              <Button
                                key={`${segment.id}-${option.className}`}
                                variant="outline"
                                className="h-10 px-3 text-[11px]"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  wrapSelectionWithClass(
                                    segment.id,
                                    option.className,
                                    body.segmentRefs.current,
                                    body.selectionRef.current,
                                    body.updateSegmentHtml
                                  );
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                            {TEXT_INLINE_SIZE_OPTIONS.map((option) => (
                              <Button
                                key={`${segment.id}-${option.className}`}
                                variant="outline"
                                className="h-10 px-3 text-[11px]"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  wrapSelectionWithClass(
                                    segment.id,
                                    option.className,
                                    body.segmentRefs.current,
                                    body.selectionRef.current,
                                    body.updateSegmentHtml
                                  );
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-theme-text/60">
                      {segment.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={segment.src}
                          alt="preview"
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-theme-border/20 bg-theme-surface-soft text-[10px] tracking-widest text-theme-text/50">
                          PLAY
                        </div>
                      )}
                      <span className="truncate">
                        {segment.type === "image" ? "이미지" : "비디오"}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-theme-text/50 hover:text-theme-text"
                  onClick={() => body.removeSegment(block.id, segment.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-3 text-xs"
            onClick={() => body.addTextSegment(block.id)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Text
          </Button>
          <Button
            variant="outline"
            className="h-10 px-3 text-xs"
            onClick={() => body.onMediaPick(block.id, "image")}
          >
            <ImagePlus className="mr-1 h-3 w-3" />
            Image
          </Button>
          <Button
            variant="ghost"
            className="h-10 px-3 text-[11px] text-theme-text/60 hover:text-theme-text"
            onClick={() => {
              body.openMediaUrlInput(block.id, "image");
            }}
          >
            URL
          </Button>
          <Button
            variant="outline"
            className="h-10 px-3 text-xs"
            onClick={() => body.onMediaPick(block.id, "video")}
          >
            <PlaySquare className="mr-1 h-3 w-3" />
            Video
          </Button>
          <Button
            variant="ghost"
            className="h-10 px-3 text-[11px] text-theme-text/60 hover:text-theme-text"
            onClick={() => {
              body.openMediaUrlInput(block.id, "video");
            }}
          >
            URL
          </Button>
        </div>
        {body.mediaUrlInput && body.mediaUrlInput.blockId === block.id && (
          <div className="flex items-center gap-2 rounded-lg border border-theme-border/20 bg-theme-surface/60 px-2 py-1.5">
            <input
              type="url"
              value={body.mediaUrlValue}
              onChange={(e) => body.setMediaUrlValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void body.submitMediaUrl();
                } else if (e.key === "Escape") {
                  body.cancelMediaUrlInput();
                }
              }}
              placeholder={
                body.mediaUrlInput.type === "image" ? "이미지 URL" : "비디오 URL"
              }
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-text outline-none placeholder:text-theme-text/40"
              autoFocus
            />
            <Button
              variant="ghost"
              className="h-7 shrink-0 px-2 text-[11px]"
              onClick={() => {
                void body.submitMediaUrl();
              }}
              disabled={!body.mediaUrlValue.trim()}
            >
              확인
            </Button>
            <Button
              variant="ghost"
              className="h-7 shrink-0 px-2 text-[11px] text-theme-text/50"
              onClick={body.cancelMediaUrlInput}
            >
              취소
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      data-layout-id="region_drafting_content"
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [scrollbar-gutter:stable]"
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          body.activeTab === "input" ? "flex" : "hidden",
          "xl:flex"
        )}
      >
        <InputStudioRawSection
          rawText={body.rawText}
          onRawTextChange={body.onRawTextChange}
          syncDecisionCount={body.syncDecisionCount}
        />

        {body.studioMode === "advanced" && (
          <StructuredSchemaEditor
            jsonText={body.schemaJsonText}
            onJsonTextChange={body.setSchemaJsonText}
            onValidationResult={body.setSchemaValidation}
            onValidBlocks={body.onSchemaValidBlocks}
          />
        )}

        <section className="rounded-lg border border-theme-border/10 bg-theme-surface/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-theme-text/70">LLM Draft</p>
            <span className="text-[11px] text-theme-text/45">role: {body.effectiveRole}</span>
          </div>

          <textarea
            className="mt-2 h-20 w-full resize-none rounded-md border border-theme-border/15 bg-theme-surface/40 p-2 text-xs text-theme-text/85 outline-none focus:border-theme-border/35"
            value={body.llmPrompt}
            onChange={(event) => {
              body.setLlmPrompt(event.target.value);
              if (body.llmError) {
                body.clearLlmError();
              }
            }}
            placeholder="프롬프트를 입력하고 초안 생성을 요청하세요."
          />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 px-3 text-xs"
              disabled={!body.hasNormalizedPrompt || body.isLlmRequesting}
              onClick={() => {
                void body.onRequestLlmDraft();
              }}
            >
              {body.isLlmRequesting ? "요청 중..." : "초안 요청"}
            </Button>
            <Button
              variant="ghost"
              className="h-10 px-3 text-xs text-theme-text/65"
              disabled={!body.hasCandidate}
              onClick={body.clearCandidate}
            >
              후보 초기화
            </Button>
          </div>

          {body.llmError && (
            <p className="mt-2 text-[11px] text-[var(--theme-warning)]">
              요청 실패: {body.llmError.message}
            </p>
          )}

          {body.candidate && (
            <div className="mt-3 rounded-md border border-theme-border/10 bg-theme-surface/30 p-2">
              <p className="text-[11px] text-theme-text/70">
                후보 블록: {body.candidate.diff.summary.totalCandidate}개 / 변경:{" "}
                {body.candidate.diff.summary.changed}개
              </p>
              <p className="mt-1 text-[11px] text-theme-text/45">
                추가 {body.candidate.diff.summary.added} / 수정 {body.candidate.diff.summary.modified} / 삭제 {body.candidate.diff.summary.removed}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  className="h-10 px-3 text-xs"
                  onClick={body.onApplyCandidateToDraft}
                >
                  초안 반영
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-3 text-xs"
                  onClick={body.onQueueCandidateForApproval}
                >
                  승인 큐 전송
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          body.activeTab === "blocks" ? "flex" : "hidden",
          "xl:flex"
        )}
      >
        <InputStudioBlocksSection
          blocks={body.blocks}
          editorSurface={body.editorSurface}
          contentOrderByBlockId={body.contentOrderByBlockId}
          expandedBlockId={body.expandedBlockId}
          onExpandedBlockChange={body.setExpandedBlockId}
          onMoveBlock={body.moveBlock}
          onMoveBlockByIndex={body.moveBlockByIndex}
          onDeleteBlock={body.deleteBlock}
          onInsertionIndexChange={body.onInsertionIndexChange}
          onInsertBreakBlock={body.onInsertBreakBlock}
          renderExpandedContent={renderExpandedContent}
        />
      </div>

      {body.pipelineDiagnostics.length > 0 && (
        <section className="rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-3">
          <p className="text-xs font-semibold text-[var(--theme-text)]">
            검증/파이프라인 진단
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-[var(--theme-text-muted)]">
            {body.pipelineDiagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic.code}:${diagnostic.path}:${index}`}>
                {formatDiagnostic(diagnostic)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {body.schemaValidation && !body.schemaValidation.ok && (
        <section className="rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-3 text-[11px] text-[var(--theme-text-muted)]">
          스키마 오류 {body.schemaValidation.issues.length}건이 감지되었습니다.
        </section>
      )}

      {body.publishMessage && (
        <p className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface-soft)] px-2 py-1 text-[11px] text-[var(--theme-text-muted)]">
          {body.publishMessage}
        </p>
      )}
    </div>
  );
}
