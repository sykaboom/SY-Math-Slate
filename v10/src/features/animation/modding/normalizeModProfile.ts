import { CLASSIC_CHALK_PROFILE } from "@features/animation/model/builtinProfiles";
import type {
  AnimationProfile,
  TextRevealMode,
} from "@features/animation/model/animationProfile";
import type {
  AnimationModInput,
  AnimationModNormalizer,
} from "@features/animation/modding/modContract";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const asPositiveNumber = (
  value: unknown,
  fallback: number,
  min = 0.01,
  max = Number.MAX_SAFE_INTEGER
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

const asString = (value: unknown, fallback: string) => {
  if (typeof value !== "string" || value.trim().length === 0) return fallback;
  return value.trim();
};

const asRevealMode = (value: unknown, fallback: TextRevealMode): TextRevealMode => {
  if (value === "clip" || value === "char") return value;
  return fallback;
};

const normalizeObjectProfile = (
  raw: Record<string, unknown>,
  base: AnimationProfile
): AnimationProfile => {
  const text = isRecord(raw.text) ? raw.text : {};
  const highlight = isRecord(raw.highlight) ? raw.highlight : {};
  const math = isRecord(raw.math) ? raw.math : {};

  return {
    version: 1,
    id: asString(raw.id, base.id),
    label: asString(raw.label, base.label),
    text: {
      revealMode: asRevealMode(text.revealMode, base.text.revealMode),
      durationPerCharMs: asPositiveNumber(
        text.durationPerCharMs,
        base.text.durationPerCharMs,
        1,
        400
      ),
      minDurationMs: asPositiveNumber(
        text.minDurationMs,
        base.text.minDurationMs,
        1,
        120000
      ),
      maxDurationMs: asPositiveNumber(
        text.maxDurationMs,
        base.text.maxDurationMs,
        1,
        120000
      ),
      cursorLeadMinPx: asPositiveNumber(
        text.cursorLeadMinPx,
        base.text.cursorLeadMinPx,
        0,
        100
      ),
      cursorLeadMaxPx: asPositiveNumber(
        text.cursorLeadMaxPx,
        base.text.cursorLeadMaxPx,
        0,
        200
      ),
      baselineOffsetPx: asPositiveNumber(
        text.baselineOffsetPx,
        base.text.baselineOffsetPx,
        0,
        100
      ),
      clipOverscanPx: asPositiveNumber(
        text.clipOverscanPx,
        base.text.clipOverscanPx,
        0,
        20
      ),
    },
    highlight: {
      durationPerCharMs: asPositiveNumber(
        highlight.durationPerCharMs,
        base.highlight.durationPerCharMs,
        1,
        500
      ),
      minDurationMs: asPositiveNumber(
        highlight.minDurationMs,
        base.highlight.minDurationMs,
        1,
        120000
      ),
      maxDurationMs: asPositiveNumber(
        highlight.maxDurationMs,
        base.highlight.maxDurationMs,
        1,
        120000
      ),
      markerLeadMinPx: asPositiveNumber(
        highlight.markerLeadMinPx,
        base.highlight.markerLeadMinPx,
        0,
        100
      ),
      markerLeadMaxPx: asPositiveNumber(
        highlight.markerLeadMaxPx,
        base.highlight.markerLeadMaxPx,
        0,
        200
      ),
      baselineOffsetPx: asPositiveNumber(
        highlight.baselineOffsetPx,
        base.highlight.baselineOffsetPx,
        0,
        100
      ),
    },
    math: {
      durationMs: asPositiveNumber(math.durationMs, base.math.durationMs, 1, 120000),
      widthReferencePx: asPositiveNumber(
        math.widthReferencePx,
        base.math.widthReferencePx,
        1,
        4000
      ),
      minWeight: asPositiveNumber(math.minWeight, base.math.minWeight, 0.05, 20),
      maxWeight: asPositiveNumber(math.maxWeight, base.math.maxWeight, 0.05, 20),
      baselineOffsetPx: asPositiveNumber(
        math.baselineOffsetPx,
        base.math.baselineOffsetPx,
        0,
        100
      ),
    },
  };
};

export const normalizeModProfile = (
  input: AnimationModInput | null | undefined,
  fallback: AnimationProfile = CLASSIC_CHALK_PROFILE,
  normalizer?: AnimationModNormalizer
): AnimationProfile => {
  if (!input) return fallback;

  const external = normalizer?.(input);
  if (external) return normalizeObjectProfile(external as unknown as Record<string, unknown>, fallback);

  if (!isRecord(input.payload)) return fallback;
  const normalized = normalizeObjectProfile(input.payload, fallback);

  if (normalized.text.minDurationMs > normalized.text.maxDurationMs) {
    normalized.text.maxDurationMs = normalized.text.minDurationMs;
  }
  if (normalized.highlight.minDurationMs > normalized.highlight.maxDurationMs) {
    normalized.highlight.maxDurationMs = normalized.highlight.minDurationMs;
  }
  if (normalized.math.minWeight > normalized.math.maxWeight) {
    normalized.math.maxWeight = normalized.math.minWeight;
  }

  return normalized;
};
