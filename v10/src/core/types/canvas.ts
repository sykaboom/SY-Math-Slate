export type ItemType = "stroke" | "text" | "image" | "math" | "unknown";
export type PenType = "ink" | "pencil" | "highlighter";
export type StrokeTool = "pen" | "eraser";
export type StepSegmentType = "text" | "image" | "video";
export type StepBlockKind = "content" | "line-break" | "column-break" | "page-break";

export interface Point {
  x: number;
  y: number;
  p?: number;
  t?: number;
}

export interface BaseItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  zIndex: number;
}

export interface StrokeItem extends BaseItem {
  type: "stroke";
  tool: StrokeTool;
  path: Point[];
  color: string;
  width: number;
  penType: PenType;
  alpha?: number;
  pointerType?: string;
}

export interface TextItem extends BaseItem {
  type: "text";
  content: string;
  stepIndex: number;
  layoutMode?: "flow" | "absolute";
  style?: Record<string, unknown>;
  segmentId?: string;
}

export interface ImageItem extends BaseItem {
  type: "image";
  src: string;
  w: number;
  h: number;
  isInverted?: boolean;
  layoutMode?: "flow" | "absolute";
  stepIndex?: number;
  segmentId?: string;
  mediaType?: "image" | "video";
}

export interface MathItem extends BaseItem {
  type: "math";
  latex: string;
}

export interface UnknownItem extends BaseItem {
  type: "unknown";
  raw?: Record<string, unknown>;
}

export type CanvasItem =
  | StrokeItem
  | TextItem
  | ImageItem
  | MathItem
  | UnknownItem;

export type PersistedSlateDoc = {
  version: 2;
  pages: Record<string, CanvasItem[]>;
  pageOrder: string[];
  pageColumnCounts?: Record<string, number>;
  stepBlocks?: StepBlock[];
  anchorMap?: AnchorMap | null;
  audioByStep?: Record<number, StepAudio>;
};

export type PersistedCanvasV2 = PersistedSlateDoc & {
  currentPageId: string;
  currentStep: number;
};

export type StepSegmentBase = {
  id: string;
  type: StepSegmentType;
  orderIndex: number;
};

export type TextSegment = StepSegmentBase & {
  type: "text";
  html: string;
};

export type ImageSegment = StepSegmentBase & {
  type: "image";
  src: string;
  width: number;
  height: number;
};

export type VideoSegment = StepSegmentBase & {
  type: "video";
  src: string;
  width?: number;
  height?: number;
};

export type StepSegment = TextSegment | ImageSegment | VideoSegment;

export type StepBlock = {
  id: string;
  kind?: StepBlockKind;
  segments: StepSegment[];
};

export type StepAudio = {
  id: string;
  stepIndex: number;
  src: string;
  duration: number;
  type: "recording" | "tts" | "upload";
  blockId?: string;
};

export type AnchorPosition = {
  segmentId: string;
  orderIndex: number;
  stepIndex: number;
  pageId: string;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnchorMap = Record<string, Record<number, AnchorPosition[]>>;
