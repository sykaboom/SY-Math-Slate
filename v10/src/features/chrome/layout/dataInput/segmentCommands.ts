import {
  captureCaretSelectionSnapshot,
  isCaretSelectionSnapshot,
  resolveCaretSelectionSnapshot,
} from "@features/editor/editor-core/selection/caretEngine";
import type {
  SegmentHtmlUpdater,
  SegmentRefMap,
  SelectionRefMap,
} from "./types";

const isRangeValue = (value: unknown): value is Range =>
  typeof Range !== "undefined" && value instanceof Range;

const getActiveRange = (
  id: string,
  host: HTMLDivElement,
  selectionRefs: SelectionRefMap
) => {
  const stored = selectionRefs[id];
  if (isRangeValue(stored)) return stored.cloneRange();
  if (isCaretSelectionSnapshot(stored)) {
    if (stored.segmentId !== id) return null;
    const resolved = resolveCaretSelectionSnapshot(host, stored);
    if (resolved) return resolved;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const active = selection.getRangeAt(0);
  if (!host.contains(active.commonAncestorContainer)) return null;
  return active.cloneRange();
};

export const captureSelection = (
  segmentRefs: SegmentRefMap,
  selectionRefs: SelectionRefMap
) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const hostEntry = Object.entries(segmentRefs).find(
    (entry): entry is [string, HTMLDivElement] => {
      const [, el] = entry;
      return Boolean(el && el.contains(range.commonAncestorContainer));
    }
  );
  if (!hostEntry) return;
  const [segmentId, host] = hostEntry;
  const snapshot = captureCaretSelectionSnapshot(segmentId, host, selection);
  selectionRefs[segmentId] = snapshot ?? range.cloneRange();
};

const applySelectionWrap = (
  id: string,
  segmentRefs: SegmentRefMap,
  selectionRefs: SelectionRefMap,
  updateSegmentHtml: SegmentHtmlUpdater,
  wrap: (range: Range) => void,
  allowCollapsed = false
) => {
  const host = segmentRefs[id];
  if (!host) return;
  const range = getActiveRange(id, host, selectionRefs);
  if (!range) return;
  if (!allowCollapsed && range.collapsed) return;
  if (!host.contains(range.commonAncestorContainer)) return;
  wrap(range);
  updateSegmentHtml(id, host.innerHTML);
};

export const wrapSelectionWithHighlight = (
  id: string,
  segmentRefs: SegmentRefMap,
  selectionRefs: SelectionRefMap,
  updateSegmentHtml: SegmentHtmlUpdater
) => {
  applySelectionWrap(
    id,
    segmentRefs,
    selectionRefs,
    updateSegmentHtml,
    (range) => {
      const selection = window.getSelection();
      if (!selection) return;
      const contents = range.extractContents();
      const span = document.createElement("span");
      span.className = "hl-yellow";
      span.appendChild(contents);
      range.insertNode(span);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    },
    true
  );
};

export const wrapSelectionWithClass = (
  id: string,
  className: string,
  segmentRefs: SegmentRefMap,
  selectionRefs: SelectionRefMap,
  updateSegmentHtml: SegmentHtmlUpdater
) => {
  applySelectionWrap(
    id,
    segmentRefs,
    selectionRefs,
    updateSegmentHtml,
    (range) => {
      const selection = window.getSelection();
      if (!selection) return;
      const contents = range.extractContents();
      const span = document.createElement("span");
      span.className = className;
      span.appendChild(contents);
      range.insertNode(span);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    }
  );
};

export const wrapSelectionWithMath = (
  id: string,
  segmentRefs: SegmentRefMap,
  selectionRefs: SelectionRefMap,
  updateSegmentHtml: SegmentHtmlUpdater
) => {
  applySelectionWrap(
    id,
    segmentRefs,
    selectionRefs,
    updateSegmentHtml,
    (range) => {
      const selection = window.getSelection();
      if (!selection) return;
      const contents = range.extractContents();
      const text = contents.textContent ?? "";
      const node = document.createTextNode(`$$${text}$$`);
      range.insertNode(node);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(node, node.length);
      newRange.collapse(true);
      selection.addRange(newRange);
    },
    true
  );
};
