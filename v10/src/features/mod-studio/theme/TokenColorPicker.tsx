"use client";

import { useMemo } from "react";

import type { ThemeGlobalTokenKey } from "@core/config/themeTokens";

type TokenColorPickerProps = {
  tokenKey: ThemeGlobalTokenKey;
  value: string;
  onChange: (tokenKey: ThemeGlobalTokenKey, tokenValue: string) => void;
};

type RgbaColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

const RGBA_PATTERN =
  /^rgba?\(\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)(?:\s*,\s*([0-9]+(?:\.[0-9]+)?))?\s*\)$/i;
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const clampByte = (value: number): number =>
  Math.max(0, Math.min(255, Math.round(value)));

const clampAlpha = (value: number): number => Math.max(0, Math.min(1, value));

const formatHexByte = (value: number): string =>
  clampByte(value).toString(16).padStart(2, "0");

const formatAlpha = (value: number): string => {
  const normalized = clampAlpha(value);
  if (Math.abs(normalized - 1) <= 0.001) return "1";
  return normalized.toFixed(3).replace(/0+$/g, "").replace(/\.$/g, "");
};

const toHexColor = (red: number, green: number, blue: number): string =>
  `#${formatHexByte(red)}${formatHexByte(green)}${formatHexByte(blue)}`;

const toRgbaColorString = (
  red: number,
  green: number,
  blue: number,
  alpha: number
): string =>
  `rgba(${clampByte(red)}, ${clampByte(green)}, ${clampByte(blue)}, ${formatAlpha(alpha)})`;

const parseRgbColor = (value: string): RgbaColor | null => {
  const match = value.trim().match(RGBA_PATTERN);
  if (!match) return null;

  const red = Number.parseFloat(match[1]);
  const green = Number.parseFloat(match[2]);
  const blue = Number.parseFloat(match[3]);
  if (!Number.isFinite(red) || !Number.isFinite(green) || !Number.isFinite(blue)) {
    return null;
  }
  const rawAlpha = match[4] ? Number.parseFloat(match[4]) : 1;
  const alpha = Number.isFinite(rawAlpha) ? rawAlpha : 1;
  return {
    red: clampByte(red),
    green: clampByte(green),
    blue: clampByte(blue),
    alpha: clampAlpha(alpha),
  };
};

const parseHexColor = (value: string): RgbaColor | null => {
  const match = value.trim().match(HEX_PATTERN);
  if (!match) return null;
  const hex = match[1];

  if (hex.length === 3 || hex.length === 4) {
    const red = Number.parseInt(`${hex[0]}${hex[0]}`, 16);
    const green = Number.parseInt(`${hex[1]}${hex[1]}`, 16);
    const blue = Number.parseInt(`${hex[2]}${hex[2]}`, 16);
    const alpha =
      hex.length === 4 ? Number.parseInt(`${hex[3]}${hex[3]}`, 16) / 255 : 1;
    return {
      red,
      green,
      blue,
      alpha: clampAlpha(alpha),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return {
      red,
      green,
      blue,
      alpha: clampAlpha(alpha),
    };
  }

  return null;
};

const parseColor = (value: string): RgbaColor | null =>
  parseRgbColor(value) ?? parseHexColor(value);

export function TokenColorPicker({
  tokenKey,
  value,
  onChange,
}: TokenColorPickerProps) {
  const parsedColor = useMemo(() => parseColor(value), [value]);
  const colorInputValue = parsedColor
    ? toHexColor(parsedColor.red, parsedColor.green, parsedColor.blue)
    : "#000000";

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_76px_minmax(0,2fr)] sm:items-center">
      <label className="font-medium text-theme-text/85">{tokenKey}</label>
      <input
        type="color"
        aria-label={`${tokenKey} color`}
        value={colorInputValue}
        onChange={(event) => {
          const nextColor = parseHexColor(event.target.value);
          if (!nextColor) return;
          const alpha = parsedColor?.alpha ?? 1;
          onChange(
            tokenKey,
            toRgbaColorString(nextColor.red, nextColor.green, nextColor.blue, alpha)
          );
        }}
        className="h-8 w-full cursor-pointer rounded border border-theme-border/30 bg-theme-surface/50 p-1"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(tokenKey, event.target.value)}
        placeholder="rgba(0, 0, 0, 1)"
        className="w-full rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
      />
    </div>
  );
}
