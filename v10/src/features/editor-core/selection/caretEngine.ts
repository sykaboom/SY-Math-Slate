export interface CaretPointSnapshot {
  path: number[];
  offset: number;
}

export interface CaretRangeSnapshot {
  start: CaretPointSnapshot;
  end: CaretPointSnapshot;
  collapsed: boolean;
}

export interface CaretSelectionSnapshot {
  kind: "caret-selection-snapshot";
  segmentId: string;
  range: CaretRangeSnapshot;
}

const CARET_SELECTION_SNAPSHOT_KIND = "caret-selection-snapshot";

const isNodeWithinRoot = (root: Node, node: Node) =>
  root === node || root.contains(node);

const getNodePathFromRoot = (root: Node, target: Node): number[] | null => {
  const path: number[] = [];
  let current: Node | null = target;
  while (current && current !== root) {
    const parentNode: Node | null = current.parentNode;
    if (!parentNode) return null;
    let index = -1;
    for (let i = 0; i < parentNode.childNodes.length; i += 1) {
      if (parentNode.childNodes[i] === current) {
        index = i;
        break;
      }
    }
    if (index < 0) return null;
    path.push(index);
    current = parentNode;
  }
  if (current !== root) return null;
  path.reverse();
  return path;
};

const resolveNodePathFromRoot = (root: Node, path: number[]): Node | null => {
  let current: Node | null = root;
  for (const index of path) {
    if (!current) return null;
    if (index < 0 || index >= current.childNodes.length) return null;
    current = current.childNodes[index] ?? null;
  }
  return current;
};

const getNodeOffsetLimit = (node: Node) => {
  if (
    node.nodeType === Node.TEXT_NODE ||
    node.nodeType === Node.CDATA_SECTION_NODE ||
    node.nodeType === Node.COMMENT_NODE
  ) {
    return node.textContent?.length ?? 0;
  }
  return node.childNodes.length;
};

const clampNodeOffset = (node: Node, offset: number) => {
  if (!Number.isFinite(offset)) return 0;
  const normalized = Math.trunc(offset);
  if (normalized <= 0) return 0;
  return Math.min(normalized, getNodeOffsetLimit(node));
};

const captureCaretPointSnapshot = (
  root: Node,
  container: Node,
  offset: number
): CaretPointSnapshot | null => {
  if (!isNodeWithinRoot(root, container)) return null;
  const path = getNodePathFromRoot(root, container);
  if (!path) return null;
  return {
    path,
    offset: clampNodeOffset(container, offset),
  };
};

const resolveCaretPointSnapshot = (
  root: Node,
  snapshot: CaretPointSnapshot
): { node: Node; offset: number } | null => {
  const node = resolveNodePathFromRoot(root, snapshot.path);
  if (!node) return null;
  return {
    node,
    offset: clampNodeOffset(node, snapshot.offset),
  };
};

export const captureCaretRangeSnapshot = (
  root: Node,
  range: Range
): CaretRangeSnapshot | null => {
  if (
    !isNodeWithinRoot(root, range.startContainer) ||
    !isNodeWithinRoot(root, range.endContainer)
  ) {
    return null;
  }
  const start = captureCaretPointSnapshot(
    root,
    range.startContainer,
    range.startOffset
  );
  const end = captureCaretPointSnapshot(root, range.endContainer, range.endOffset);
  if (!start || !end) return null;
  return {
    start,
    end,
    collapsed: range.collapsed,
  };
};

export const resolveCaretRangeSnapshot = (
  root: Node,
  snapshot: CaretRangeSnapshot
): Range | null => {
  const start = resolveCaretPointSnapshot(root, snapshot.start);
  const end = resolveCaretPointSnapshot(root, snapshot.end);
  if (!start || !end) return null;
  try {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range;
  } catch {
    return null;
  }
};

export const captureCaretSelectionSnapshot = (
  segmentId: string,
  root: Node,
  selection: Selection | null
): CaretSelectionSnapshot | null => {
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const snapshot = captureCaretRangeSnapshot(root, range);
  if (!snapshot) return null;
  return {
    kind: CARET_SELECTION_SNAPSHOT_KIND,
    segmentId,
    range: snapshot,
  };
};

export const resolveCaretSelectionSnapshot = (
  root: Node,
  snapshot: CaretSelectionSnapshot
) => resolveCaretRangeSnapshot(root, snapshot.range);

export const isCaretSelectionSnapshot = (
  value: unknown
): value is CaretSelectionSnapshot => {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<CaretSelectionSnapshot>;
  return (
    snapshot.kind === CARET_SELECTION_SNAPSHOT_KIND &&
    typeof snapshot.segmentId === "string" &&
    Boolean(snapshot.range)
  );
};
