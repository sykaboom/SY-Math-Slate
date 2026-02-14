import type { TextSegmentStyle } from "@core/types/canvas";

export type MathLaneStyle = {
  color: string;
  scale: number;
};

type StyleOption = {
  label: string;
  className: string;
};

export const DEFAULT_TEXT_LINE_HEIGHT = "1.6";

export const DEFAULT_TEXT_LANE_STYLE: Required<TextSegmentStyle> = {
  fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  fontSize: "28px",
  fontWeight: "400",
  color: "var(--text-color)",
};

export const DEFAULT_MATH_LANE_STYLE: MathLaneStyle = {
  color: "var(--text-color)",
  scale: 1,
};

export const TEXT_FONT_FAMILY_OPTIONS: ReadonlyArray<{
  label: string;
  value: string;
}> = [
  {
    label: "Sans KR",
    value: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  },
  {
    label: "Serif",
    value: '"Noto Serif KR", "Times New Roman", serif',
  },
  {
    label: "Monospace",
    value: '"JetBrains Mono", "Consolas", monospace',
  },
];

export const TEXT_INLINE_BOLD_CLASS = "font-bold";

export const TEXT_INLINE_COLOR_OPTIONS: ReadonlyArray<StyleOption> = [
  { label: "White", className: "text-toolbar-text" },
  { label: "Yellow", className: "text-neon-yellow" },
  { label: "Cyan", className: "text-neon-cyan" },
  { label: "Green", className: "text-neon-green" },
];

export const TEXT_INLINE_SIZE_OPTIONS: ReadonlyArray<StyleOption> = [
  { label: "Base", className: "text-base" },
  { label: "Large", className: "text-xl" },
  { label: "XL", className: "text-2xl" },
];

export const ALLOWED_RICH_TEXT_CLASSES: ReadonlyArray<string> = [
  "hl-yellow",
  "hl-cyan",
  TEXT_INLINE_BOLD_CLASS,
  ...TEXT_INLINE_COLOR_OPTIONS.map((option) => option.className),
  ...TEXT_INLINE_SIZE_OPTIONS.map((option) => option.className),
];

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const CSS_COLOR_FUNC_PATTERN = /^(rgb|rgba|hsl|hsla)\([^()]+\)$/i;
const CSS_VAR_COLOR_PATTERN =
  /^var\(\s*--[a-z0-9_-]+\s*(?:,\s*[^()]+\s*)?\)$/i;
const FONT_SIZE_PATTERN = /^\d+(\.\d+)?(px|rem|em|%)$/i;
const FONT_WEIGHT_PATTERN =
  /^(normal|bold|bolder|lighter|[1-9]00)$/i;

const asTrimmedString = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const normalizeFontSize = (value: unknown, fallback: string) => {
  const next = asTrimmedString(value);
  if (FONT_SIZE_PATTERN.test(next)) return next;
  return fallback;
};

const normalizeFontWeight = (value: unknown, fallback: string) => {
  const next = asTrimmedString(value);
  if (FONT_WEIGHT_PATTERN.test(next)) return next;
  return fallback;
};

const normalizeColor = (value: unknown, fallback: string) => {
  const next = asTrimmedString(value);
  if (HEX_COLOR_PATTERN.test(next)) return next;
  if (CSS_COLOR_FUNC_PATTERN.test(next)) return next;
  if (CSS_VAR_COLOR_PATTERN.test(next)) return next;
  return fallback;
};

export const createDefaultTextSegmentStyle = (): Required<TextSegmentStyle> => {
  return { ...DEFAULT_TEXT_LANE_STYLE };
};

export const normalizeTextSegmentStyle = (
  style: unknown,
  fallback: Required<TextSegmentStyle> = DEFAULT_TEXT_LANE_STYLE
): Required<TextSegmentStyle> => {
  if (!style || typeof style !== "object" || Array.isArray(style)) {
    return { ...fallback };
  }
  const source = style as Record<string, unknown>;
  return {
    fontFamily:
      asTrimmedString(source.fontFamily) || fallback.fontFamily,
    fontSize: normalizeFontSize(source.fontSize, fallback.fontSize),
    fontWeight: normalizeFontWeight(source.fontWeight, fallback.fontWeight),
    color: normalizeColor(source.color, fallback.color),
  };
};

export const toTextItemStyle = (
  style: unknown
): Record<string, unknown> => {
  const normalized = normalizeTextSegmentStyle(style);
  return {
    fontFamily: normalized.fontFamily,
    fontSize: normalized.fontSize,
    fontWeight: normalized.fontWeight,
    color: normalized.color,
    lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
  };
};
