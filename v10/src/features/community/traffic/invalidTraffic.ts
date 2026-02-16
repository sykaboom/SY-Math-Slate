import type { CommunityTrafficAction } from "@core/contracts/community";

export type InvalidTrafficInput = {
  action: CommunityTrafficAction;
  fingerprint: string;
  actorId: string | null;
  now: number;
};

export type InvalidTrafficAssessment = {
  level: "normal" | "elevated" | "blocked";
  sampleCount: number;
  reason: string;
};

const WINDOW_MS = 60_000;
const ELEVATED_THRESHOLD = 8;
const BLOCK_THRESHOLD = 16;
const MAX_KEYS = 800;

const samplesByKey = new Map<string, number[]>();

const normalizeActor = (value: string | null): string => {
  if (typeof value !== "string") return "anon";
  const trimmed = value.trim();
  return trimmed === "" ? "anon" : trimmed.slice(0, 40);
};

const normalizeFingerprint = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed === "") return "unknown";
  return trimmed.slice(0, 64);
};

const buildKey = (input: InvalidTrafficInput): string =>
  `${input.action}:${normalizeActor(input.actorId)}:${normalizeFingerprint(
    input.fingerprint
  )}`;

const pruneWindow = (samples: number[], now: number): number[] =>
  samples.filter((timestamp) => now - timestamp <= WINDOW_MS);

const pruneMapIfNeeded = (): void => {
  if (samplesByKey.size <= MAX_KEYS) return;
  const oldestKey = samplesByKey.keys().next().value;
  if (typeof oldestKey === "string") {
    samplesByKey.delete(oldestKey);
  }
};

export const assessInvalidTraffic = (
  input: InvalidTrafficInput
): InvalidTrafficAssessment => {
  const key = buildKey(input);
  const current = samplesByKey.get(key) ?? [];
  const pruned = pruneWindow(current, input.now);
  pruned.push(input.now);
  samplesByKey.set(key, pruned);
  pruneMapIfNeeded();

  const sampleCount = pruned.length;
  if (sampleCount >= BLOCK_THRESHOLD) {
    return {
      level: "blocked",
      sampleCount,
      reason: "burst-threshold-exceeded",
    };
  }

  if (sampleCount >= ELEVATED_THRESHOLD) {
    return {
      level: "elevated",
      sampleCount,
      reason: "burst-threshold-elevated",
    };
  }

  return {
    level: "normal",
    sampleCount,
    reason: "within-threshold",
  };
};
