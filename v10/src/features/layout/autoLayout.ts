"use client";

import {
  getBoardPadding,
  getBoardSize,
  type BoardRatio,
} from "@core/foundation/policies/boardSpec";
import {
  DEFAULT_TEXT_LINE_HEIGHT,
  toTextItemStyle,
} from "@core/ui/theming/engine/typography";
import { sanitizeRichTextHtml } from "@core/security/sanitization/richTextSanitizer";
import { loadMathJax } from "@core/domain/math/loader";
import { typesetElement } from "@core/domain/math/render";
import type {
  AnchorMap,
  AnchorPosition,
  CanvasItem,
  StepBlock,
  StepSegment,
} from "@core/foundation/types/canvas";

const CONTENT_PADDING = getBoardPadding();
const COLUMN_GAP = 48;
const DEFAULT_MEDIA_GAP = 12;
const DEFAULT_VIDEO_RATIO = 16 / 9;

type LayoutContext = {
  ratio: BoardRatio;
  columnCount: number;
  basePageId: string;
};

export type AutoLayoutResult = {
  pages: Record<string, CanvasItem[]>;
  pageOrder: string[];
  pageColumnCounts: Record<string, number>;
  anchorMap: AnchorMap;
};

type BuiltStep = {
  root: HTMLDivElement;
  segmentElements: Map<string, HTMLElement>;
  orderedSegments: StepSegment[];
};

const createPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createItemId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sanitizeHtml = (value: string) => sanitizeRichTextHtml(value);

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const getColumnWidth = (boardWidth: number, columnCount: number) => {
  const innerWidth = boardWidth - CONTENT_PADDING * 2;
  const totalGap = COLUMN_GAP * (columnCount - 1);
  return Math.max(1, (innerWidth - totalGap) / columnCount);
};

const getSegmentRatio = (segment: StepSegment) => {
  if (segment.type === "text") return 1;
  const width = Math.max(segment.width ?? 1, 1);
  const height = Math.max(segment.height ?? 1, 1);
  if (segment.type === "video" && (!segment.width || !segment.height)) {
    return DEFAULT_VIDEO_RATIO;
  }
  return width / height;
};

const buildTextSegment = (segment: StepSegment) => {
  const element = document.createElement("div");
  const textStyle = toTextItemStyle(segment.type === "text" ? segment.style : undefined);
  const fontFamily =
    typeof textStyle.fontFamily === "string" ? textStyle.fontFamily : "";
  const fontSize = typeof textStyle.fontSize === "string" ? textStyle.fontSize : "";
  const fontWeight =
    typeof textStyle.fontWeight === "string" ? textStyle.fontWeight : "";
  const color = typeof textStyle.color === "string" ? textStyle.color : "";
  const lineHeight =
    typeof textStyle.lineHeight === "string"
      ? textStyle.lineHeight
      : DEFAULT_TEXT_LINE_HEIGHT;
  element.style.fontFamily = fontFamily;
  element.style.fontSize = fontSize;
  element.style.fontWeight = fontWeight;
  element.style.lineHeight = lineHeight;
  element.style.color = color;
  element.style.wordBreak = "break-word";
  element.style.whiteSpace = "normal";
  element.innerHTML = sanitizeHtml(segment.type === "text" ? segment.html : "");
  element.dataset.segmentId = segment.id;
  return element;
};

const buildMediaRow = (
  segments: StepSegment[],
  columnWidth: number
): { row: HTMLDivElement; map: Map<string, HTMLElement> } => {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = `${DEFAULT_MEDIA_GAP}px`;
  row.style.alignItems = "flex-start";
  row.style.width = `${columnWidth}px`;

  const ratios = segments.map(getSegmentRatio);
  const gapSpace = DEFAULT_MEDIA_GAP * Math.max(0, segments.length - 1);
  const availableWidth = Math.max(1, columnWidth - gapSpace);
  const totalRatio = ratios.reduce((sum, r) => sum + r, 0) || 1;
  const rawRowHeight = availableWidth / totalRatio;
  const rowHeight = Math.max(120, Math.min(rawRowHeight, columnWidth));

  const map = new Map<string, HTMLElement>();
  segments.forEach((segment, index) => {
    const ratio = ratios[index];
    const width = Math.max(60, ratio * rowHeight);
    const height = Math.max(60, rowHeight);
    const cell = document.createElement("div");
    cell.dataset.segmentId = segment.id;
    cell.style.width = `${width}px`;
    cell.style.height = `${height}px`;
    cell.style.borderRadius = "10px";
    cell.style.overflow = "hidden";
    cell.style.background =
      segment.type === "video"
        ? "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))"
        : "rgba(255,255,255,0.05)";
    cell.style.border = "1px solid rgba(255,255,255,0.2)";

    if (segment.type === "image") {
      const img = document.createElement("img");
      img.src = segment.src;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      cell.appendChild(img);
    } else if (segment.type === "video") {
      const label = document.createElement("div");
      label.textContent = "VIDEO";
      label.style.width = "100%";
      label.style.height = "100%";
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.justifyContent = "center";
      label.style.color = "rgba(255,255,255,0.6)";
      label.style.fontSize = "12px";
      label.style.letterSpacing = "0.2em";
      cell.appendChild(label);
    }
    row.appendChild(cell);
    map.set(segment.id, cell);
  });

  return { row, map };
};

const buildStepElement = (
  block: StepBlock,
  columnWidth: number
): BuiltStep => {
  const root = document.createElement("div");
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.gap = "24px";
  root.style.marginBottom = "32px";
  root.style.breakInside = "avoid";
  root.style.width = "100%";

  const orderedSegments = [...block.segments].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const segmentElements = new Map<string, HTMLElement>();

  let index = 0;
  while (index < orderedSegments.length) {
    const segment = orderedSegments[index];
    if (segment.type === "text") {
      const textEl = buildTextSegment(segment);
      root.appendChild(textEl);
      segmentElements.set(segment.id, textEl);
      index += 1;
      continue;
    }

    const mediaSegments: StepSegment[] = [];
    while (
      index < orderedSegments.length &&
      orderedSegments[index].type !== "text"
    ) {
      mediaSegments.push(orderedSegments[index]);
      index += 1;
    }
    const { row, map } = buildMediaRow(mediaSegments, columnWidth);
    root.appendChild(row);
    map.forEach((value, key) => {
      segmentElements.set(key, value);
    });
  }

  return { root, segmentElements, orderedSegments };
};

const isOverflowing = (container: HTMLElement) => {
  return container.scrollWidth > container.clientWidth + 1;
};

const measureStep = (
  step: BuiltStep,
  container: HTMLElement,
  stepIndex: number,
  pageId: string,
  columnWidth: number,
  columnCount: number,
  zIndexStart: number
): { items: CanvasItem[]; anchors: AnchorPosition[]; nextZIndex: number } => {
  const items: CanvasItem[] = [];
  const anchors: AnchorPosition[] = [];
  const containerRect = container.getBoundingClientRect();
  let zIndex = zIndexStart;

  step.orderedSegments.forEach((segment) => {
    const element = step.segmentElements.get(segment.id);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left - containerRect.left + CONTENT_PADDING;
    const y = rect.top - containerRect.top + CONTENT_PADDING;
    const width = rect.width;
    const height = rect.height;
    const column = Math.max(
      0,
      Math.min(
        columnCount - 1,
        Math.floor((rect.left - containerRect.left) / (columnWidth + COLUMN_GAP))
      )
    );

    anchors.push({
      segmentId: segment.id,
      orderIndex: segment.orderIndex,
      stepIndex,
      pageId,
      column,
      x,
      y,
      width,
      height,
    });

    if (segment.type === "text") {
      items.push({
        id: createItemId(),
        type: "text",
        content: segment.html,
        layoutMode: "absolute",
        stepIndex,
        x,
        y,
        zIndex: zIndex++,
        style: toTextItemStyle(segment.style),
        segmentId: segment.id,
      });
      return;
    }

    items.push({
      id: createItemId(),
      type: "image",
      src: segment.src,
      w: Math.max(1, width),
      h: Math.max(1, height),
      layoutMode: "absolute",
      stepIndex,
      x,
      y,
      zIndex: zIndex++,
      segmentId: segment.id,
      mediaType: segment.type === "video" ? "video" : "image",
    });
  });

  return { items, anchors, nextZIndex: zIndex };
};

const measureBreakAnchor = (
  element: HTMLElement,
  container: HTMLElement,
  stepIndex: number,
  pageId: string,
  columnWidth: number,
  columnCount: number,
  segmentId: string
): AnchorPosition => {
  const containerRect = container.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const relativeLeft = rect.left - containerRect.left;
  const column = Math.max(
    0,
    Math.min(
      columnCount - 1,
      Math.floor(relativeLeft / (columnWidth + COLUMN_GAP))
    )
  );
  return {
    segmentId,
    orderIndex: 0,
    stepIndex,
    pageId,
    column,
    x: relativeLeft + CONTENT_PADDING,
    y: rect.top - containerRect.top + CONTENT_PADDING,
    width: rect.width,
    height: rect.height,
  };
};

const createPageBreakAnchor = (
  stepIndex: number,
  pageId: string,
  segmentId: string
): AnchorPosition => {
  return {
    segmentId,
    orderIndex: 0,
    stepIndex,
    pageId,
    column: 0,
    x: CONTENT_PADDING,
    y: CONTENT_PADDING,
    width: 1,
    height: 1,
  };
};

export const runAutoLayout = async (
  blocks: StepBlock[],
  context: LayoutContext
): Promise<AutoLayoutResult> => {
  const boardSize = getBoardSize(context.ratio);
  const columnWidth = getColumnWidth(boardSize.width, context.columnCount);
  const pages: Record<string, CanvasItem[]> = {};
  const anchorMap: AnchorMap = {};
  const pageOrder: string[] = [];
  const pageColumnCounts: Record<string, number> = {};

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.visibility = "hidden";
  container.style.width = `${boardSize.width - CONTENT_PADDING * 2}px`;
  container.style.height = `${boardSize.height - CONTENT_PADDING * 2}px`;
  container.style.columnCount = String(context.columnCount);
  container.style.columnGap = `${COLUMN_GAP}px`;
  container.style.columnFill = "auto";
  container.style.boxSizing = "border-box";
  container.style.padding = "0";

  document.body.appendChild(container);
  await loadMathJax();
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  let currentPageId = context.basePageId || createPageId();
  let currentStepIndex = 0;
  let currentZIndex = 0;
  pages[currentPageId] = [];
  anchorMap[currentPageId] = {};
  pageOrder.push(currentPageId);
  pageColumnCounts[currentPageId] = context.columnCount;

  for (const block of blocks) {
    if (block.kind === "page-break") {
      container.innerHTML = "";
      currentPageId = createPageId();
      currentZIndex = 0;
      pages[currentPageId] = [];
      anchorMap[currentPageId] = {};
      pageOrder.push(currentPageId);
      pageColumnCounts[currentPageId] = context.columnCount;
      anchorMap[currentPageId][currentStepIndex] = [
        createPageBreakAnchor(currentStepIndex, currentPageId, block.id),
      ];
      currentStepIndex += 1;
      continue;
    }
    if (block.kind === "line-break" || block.kind === "column-break") {
      const spacer = document.createElement("div");
      spacer.className =
        block.kind === "column-break" ? "force-break" : "line-break-spacer";
      container.appendChild(spacer);
      await nextFrame();
      anchorMap[currentPageId][currentStepIndex] = [
        measureBreakAnchor(
          spacer,
          container,
          currentStepIndex,
          currentPageId,
          columnWidth,
          context.columnCount,
          block.id
        ),
      ];
      currentStepIndex += 1;
      continue;
    }
    const built = buildStepElement(block, columnWidth);
    container.appendChild(built.root);
    await typesetElement(built.root);
    await nextFrame();

    if (isOverflowing(container)) {
      container.removeChild(built.root);
      container.innerHTML = "";
      currentPageId = createPageId();
      currentZIndex = 0;
      pages[currentPageId] = [];
      anchorMap[currentPageId] = {};
      pageOrder.push(currentPageId);
      pageColumnCounts[currentPageId] = context.columnCount;
      container.appendChild(built.root);
      await typesetElement(built.root);
      await nextFrame();
    }

    const measured = measureStep(
      built,
      container,
      currentStepIndex,
      currentPageId,
      columnWidth,
      context.columnCount,
      currentZIndex
    );
    pages[currentPageId].push(...measured.items);
    anchorMap[currentPageId][currentStepIndex] = measured.anchors;
    currentZIndex = measured.nextZIndex;
    currentStepIndex += 1;
  }

  document.body.removeChild(container);

  return { pages, pageOrder, pageColumnCounts, anchorMap };
};
