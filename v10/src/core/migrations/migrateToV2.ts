import {
  type CanvasItem,
  type ImageItem,
  type MathItem,
  type ModInput,
  type PersistedSlateDoc,
  type Point,
  type StepBlock,
  type StepBlockKind,
  type StepSegment,
  type StrokeItem,
  type StrokeTool,
  type TextItem,
  type UnknownItem,
  type PenType,
} from "@core/types/canvas";
import {
  ALLOWED_RICH_TEXT_CLASSES,
  createDefaultTextSegmentStyle,
  normalizeTextSegmentStyle,
  toTextItemStyle,
} from "@core/config/typography";

const DEFAULT_COLOR = "#FFFFFF";
const DEFAULT_ERASER_COLOR = "#000000";
const DEFAULT_MEDIA_WIDTH = 320;
const DEFAULT_MEDIA_HEIGHT = 180;
const ALLOWED_TAGS = new Set(["span", "br", "b", "strong", "i", "em", "u", "sub", "sup"]);
const ALLOWED_CLASS_SET = new Set(ALLOWED_RICH_TEXT_CLASSES);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPenType = (value: unknown): value is PenType =>
  value === "ink" || value === "pencil" || value === "highlighter";

const isStrokeTool = (value: unknown): value is StrokeTool =>
  value === "pen" || value === "eraser";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sanitizeClassName = (value: string) => {
  const tokens = value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && ALLOWED_CLASS_SET.has(token));
  return tokens.join(" ");
};

const sanitizeHtmlForStep = (value: unknown) => {
  if (typeof value !== "string") return "&nbsp;";
  if (value.trim().length === 0) return "&nbsp;";
  if (typeof document === "undefined") {
    const escaped = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    return escaped.trim().length > 0 ? escaped : "&nbsp;";
  }

  const template = document.createElement("template");
  template.innerHTML = value;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object") {
      el.remove();
      return;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      return;
    }

    Array.from(el.attributes).forEach((attr) => {
      if (attr.name !== "class") {
        el.removeAttribute(attr.name);
      }
    });
    if (el.className) {
      const safeClass = sanitizeClassName(el.className);
      if (safeClass.length > 0) {
        el.className = safeClass;
      } else {
        el.removeAttribute("class");
      }
    }

    Array.from(el.childNodes).forEach((child) => walk(child));
  };

  Array.from(template.content.childNodes).forEach((node) => walk(node));
  const sanitized = template.innerHTML.trim();
  return sanitized.length > 0 ? sanitized : "&nbsp;";
};

const asStepBlockKind = (value: unknown): StepBlockKind | undefined => {
  if (
    value === "content" ||
    value === "line-break" ||
    value === "column-break" ||
    value === "page-break"
  ) {
    return value;
  }
  return undefined;
};

const normalizeOrderIndex = (value: unknown, fallback: number) => {
  if (isNumber(value) && value >= 0) return Math.floor(value);
  return fallback;
};

const normalizeStepSegment = (
  value: unknown,
  fallbackIndex: number
): StepSegment | null => {
  if (!isRecord(value)) return null;
  const rawType = value.type;
  const type = rawType === "text" || rawType === "image" || rawType === "video" ? rawType : null;
  if (!type) return null;
  const id =
    typeof value.id === "string" && value.id.length > 0 ? value.id : createId();
  const orderIndex = normalizeOrderIndex(value.orderIndex, fallbackIndex);

  if (type === "text") {
    return {
      id,
      type: "text",
      html: sanitizeHtmlForStep(value.html),
      style: normalizeTextSegmentStyle(value.style),
      orderIndex,
    };
  }

  const src = typeof value.src === "string" ? value.src : "";
  const width = isNumber(value.width) && value.width > 0 ? value.width : DEFAULT_MEDIA_WIDTH;
  const height = isNumber(value.height) && value.height > 0 ? value.height : DEFAULT_MEDIA_HEIGHT;
  if (type === "image") {
    return {
      id,
      type: "image",
      src,
      width,
      height,
      orderIndex,
    };
  }

  return {
    id,
    type: "video",
    src,
    width,
    height,
    orderIndex,
  };
};

const normalizeStepSegments = (value: unknown): StepSegment[] => {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map((segment, index) => normalizeStepSegment(segment, index))
    .filter((segment): segment is StepSegment => Boolean(segment))
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((segment, index) => ({ ...segment, orderIndex: index }));
  return normalized;
};

const normalizeStepBlock = (value: unknown, index: number): StepBlock | null => {
  if (!isRecord(value)) return null;
  const id =
    typeof value.id === "string" && value.id.length > 0
      ? value.id
      : `block-${index}-${createId()}`;
  const kind = asStepBlockKind(value.kind);

  if (kind && kind !== "content") {
    return { id, kind, segments: [] };
  }

  const segments = normalizeStepSegments(value.segments);
  if (segments.length > 0) {
    return { id, segments };
  }

  return {
    id,
    segments: [
      {
        id: createId(),
        type: "text",
        html: "&nbsp;",
        style: createDefaultTextSegmentStyle(),
        orderIndex: 0,
      },
    ],
  };
};

const normalizeStepBlocks = (value: unknown): StepBlock[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((block, index) => normalizeStepBlock(block, index))
    .filter((block): block is StepBlock => Boolean(block));
};

const normalizeModInput = (value: unknown): ModInput | undefined => {
  if (!isRecord(value)) return undefined;
  const format =
    typeof value.format === "string" && value.format.trim().length > 0
      ? value.format.trim()
      : "";
  if (!format) return undefined;
  return {
    format,
    payload: value.payload ?? null,
  };
};

const normalizePoint = (value: unknown): Point | null => {
  if (!isRecord(value)) return null;
  const x = value.x;
  const y = value.y;
  if (!isNumber(x) || !isNumber(y)) return null;
  const p = isNumber(value.p) ? value.p : undefined;
  const t = isNumber(value.t) ? value.t : undefined;
  return { x, y, p, t };
};

const normalizePath = (value: unknown): Point[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((point) => normalizePoint(point))
    .filter((point): point is Point => Boolean(point));
};

const normalizeBase = (value: Record<string, unknown>, index: number) => {
  const id =
    typeof value.id === "string" && value.id.length > 0 ? value.id : createId();
  const x = isNumber(value.x) ? value.x : 0;
  const y = isNumber(value.y) ? value.y : 0;
  const rotation = isNumber(value.rotation) ? value.rotation : undefined;
  const scale = isNumber(value.scale) ? value.scale : undefined;
  const opacity = isNumber(value.opacity) ? value.opacity : undefined;
  const zIndex = isNumber(value.zIndex) ? value.zIndex : index;
  return { id, x, y, rotation, scale, opacity, zIndex };
};

const normalizeUnknownBase = (value: Record<string, unknown>) => {
  const id =
    typeof value.id === "string" && value.id.length > 0 ? value.id : createId();
  const x = isNumber(value.x) ? value.x : 0;
  const y = isNumber(value.y) ? value.y : 0;
  const rotation = isNumber(value.rotation) ? value.rotation : undefined;
  const scale = isNumber(value.scale) ? value.scale : undefined;
  const opacity = isNumber(value.opacity) ? value.opacity : undefined;
  const zIndex = isNumber(value.zIndex) ? value.zIndex : 0;
  return { id, x, y, rotation, scale, opacity, zIndex };
};

const normalizeStrokeItem = (
  value: Record<string, unknown>,
  index: number,
  fallbackAlpha?: number
): StrokeItem | null => {
  const path = normalizePath(value.path);
  if (path.length === 0) return null;
  const base = normalizeBase(value, index);
  const tool = isStrokeTool(value.tool) ? value.tool : "pen";
  const penType = isPenType(value.penType)
    ? value.penType
    : (fallbackAlpha ?? 1) < 0.4
      ? "highlighter"
      : "ink";
  const color =
    typeof value.color === "string"
      ? value.color
      : tool === "eraser"
        ? DEFAULT_ERASER_COLOR
        : DEFAULT_COLOR;
  const width = isNumber(value.width) ? value.width : 1;
  const alpha = isNumber(value.alpha) ? value.alpha : undefined;
  const pointerType =
    typeof value.pointerType === "string" ? value.pointerType : undefined;

  return {
    ...base,
    type: "stroke",
    tool,
    path,
    color,
    width,
    penType,
    alpha,
    pointerType,
  };
};

const normalizeTextItem = (
  value: Record<string, unknown>,
  index: number
): TextItem => {
  const base = normalizeBase(value, index);
  const content = sanitizeHtmlForStep(value.content);
  const stepIndex = isNumber(value.stepIndex) ? value.stepIndex : 0;
  const layoutMode = value.layoutMode === "absolute" ? "absolute" : "flow";
  const style = toTextItemStyle(value.style);
  return {
    ...base,
    type: "text",
    content,
    stepIndex,
    layoutMode,
    style,
  };
};

const normalizeImageItem = (
  value: Record<string, unknown>,
  index: number
): ImageItem => {
  const base = normalizeBase(value, index);
  const src = typeof value.src === "string" ? value.src : "";
  const w = isNumber(value.w) ? value.w : 0;
  const h = isNumber(value.h) ? value.h : 0;
  const isInverted =
    typeof value.isInverted === "boolean" ? value.isInverted : undefined;
  return { ...base, type: "image", src, w, h, isInverted };
};

const normalizeMathItem = (
  value: Record<string, unknown>,
  index: number
): MathItem => {
  const base = normalizeBase(value, index);
  const latex = typeof value.latex === "string" ? value.latex : "";
  return { ...base, type: "math", latex };
};

const normalizeUnknownItem = (value: Record<string, unknown>): UnknownItem => {
  const base = normalizeUnknownBase(value);
  const raw = isRecord(value.raw) ? value.raw : value;
  return { ...base, type: "unknown", raw };
};

const normalizeItem = (value: unknown, index: number): CanvasItem | null => {
  if (!isRecord(value)) return null;
  const type = typeof value.type === "string" ? value.type : "unknown";

  if (type === "stroke") {
    return normalizeStrokeItem(
      value,
      index,
      isNumber(value.alpha) ? value.alpha : undefined
    );
  }
  if (type === "text") return normalizeTextItem(value, index);
  if (type === "image") return normalizeImageItem(value, index);
  if (type === "math") return normalizeMathItem(value, index);
  if (type === "unknown") return normalizeUnknownItem(value);

  return normalizeUnknownItem(value);
};

const normalizePageOrder = (
  pages: Record<string, unknown>,
  pageOrderInput: unknown
) => {
  const ordered = Array.isArray(pageOrderInput)
    ? pageOrderInput.filter((id) => typeof id === "string" && id in pages)
    : [];
  const orphaned = Object.keys(pages).filter((id) => !ordered.includes(id));
  if (orphaned.length > 0) {
    console.warn("[slate] Orphaned pages recovered:", orphaned.join(", "));
  }
  const merged = [...ordered, ...orphaned];
  const fallback = merged.length > 0 ? merged : Object.keys(pages);
  return fallback;
};

const normalizePages = (input: unknown): Record<string, CanvasItem[]> => {
  if (!isRecord(input)) return {};
  const pages: Record<string, CanvasItem[]> = {};

  Object.entries(input).forEach(([pageId, rawItems]) => {
    if (!Array.isArray(rawItems)) return;
    pages[pageId] = rawItems
      .map((item, index) => normalizeItem(item, index))
      .filter((item): item is CanvasItem => Boolean(item));
  });

  return pages;
};

const normalizeColumnCounts = (input: unknown, pageOrder: string[]) => {
  if (!isRecord(input)) return {};
  const result: Record<string, number> = {};
  pageOrder.forEach((pageId) => {
    const raw = input[pageId];
    result[pageId] = isNumber(raw) ? raw : 2;
  });
  return result;
};

const normalizeVersion = (value: unknown) => {
  if (isNumber(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 2;
};

export function migrateToV2(data: unknown): PersistedSlateDoc {
  if (!isRecord(data)) {
    const pageId = createPageId();
    return {
      version: 2,
      pages: { [pageId]: [] },
      pageOrder: [pageId],
      pageColumnCounts: { [pageId]: 2 },
      stepBlocks: [],
      animationModInput: null,
    };
  }

  const pages = normalizePages(data.pages);
  let pageOrder = normalizePageOrder(pages, data.pageOrder);
  if (pageOrder.length === 0) {
    const fallbackId = createPageId();
    pages[fallbackId] = [];
    pageOrder = [fallbackId];
  }
  const pageColumnCounts = normalizeColumnCounts(data.pageColumnCounts, pageOrder);
  const docVersion = normalizeVersion(data.version);
  const resolvedVersion = docVersion >= 2.1 ? 2.1 : 2;
  const stepBlocks = normalizeStepBlocks(data.stepBlocks);
  const animationModInput = normalizeModInput(data.animationModInput);

  return {
    version: resolvedVersion as PersistedSlateDoc["version"],
    pages,
    pageOrder,
    pageColumnCounts,
    stepBlocks,
    anchorMap: isRecord(data.anchorMap)
      ? (data.anchorMap as PersistedSlateDoc["anchorMap"])
      : undefined,
    audioByStep: isRecord(data.audioByStep)
      ? (data.audioByStep as PersistedSlateDoc["audioByStep"])
      : undefined,
    animationModInput: animationModInput ?? null,
  };
}
