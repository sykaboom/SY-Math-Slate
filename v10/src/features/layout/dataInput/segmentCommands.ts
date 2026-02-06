import type {
  SegmentHtmlUpdater,
  SegmentRefMap,
  SelectionRefMap,
} from "./types";

const getActiveRange = (id: string, selectionRefs: SelectionRefMap) => {
  const stored = selectionRefs[id];
  if (stored) return stored;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  return selection.getRangeAt(0);
};

export const captureSelection = (
  segmentRefs: SegmentRefMap,
  selectionRefs: SelectionRefMap
) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const hostEntry = Object.entries(segmentRefs).find(([, el]) =>
    el ? el.contains(range.commonAncestorContainer) : false
  );
  if (!hostEntry) return;
  const [segmentId] = hostEntry;
  selectionRefs[segmentId] = range.cloneRange();
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
  const range = getActiveRange(id, selectionRefs);
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
