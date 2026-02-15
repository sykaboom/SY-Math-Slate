export type PerfProfileName = "low" | "normal" | "high";

export type PerfProfileHints = {
  hardwareConcurrency?: number | null;
  deviceMemoryGb?: number | null;
};

export type PerfProfile = {
  name: PerfProfileName;
  laserTrailMaxLifeMs: number;
  laserShadowMultiplier: number;
  maxCoalescedEvents: number;
};

const LOW_END_MAX_CPU_CORES = 4;
const LOW_END_MAX_DEVICE_MEMORY_GB = 4;
const HIGH_END_MIN_CPU_CORES = 8;
const HIGH_END_MIN_DEVICE_MEMORY_GB = 8;

const profiles: Record<PerfProfileName, PerfProfile> = {
  low: {
    name: "low",
    laserTrailMaxLifeMs: 850,
    laserShadowMultiplier: 0.45,
    maxCoalescedEvents: 4,
  },
  normal: {
    name: "normal",
    laserTrailMaxLifeMs: 1200,
    laserShadowMultiplier: 1,
    maxCoalescedEvents: Number.POSITIVE_INFINITY,
  },
  high: {
    name: "high",
    laserTrailMaxLifeMs: 1200,
    laserShadowMultiplier: 1,
    maxCoalescedEvents: Number.POSITIVE_INFINITY,
  },
};

const sanitizeMetric = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
};

const readNavigatorPerfHints = (): PerfProfileHints => {
  if (typeof navigator === "undefined") return {};
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    hardwareConcurrency: sanitizeMetric(nav.hardwareConcurrency),
    deviceMemoryGb: sanitizeMetric(nav.deviceMemory),
  };
};

export const resolvePerfProfileName = (
  hints?: PerfProfileHints
): PerfProfileName => {
  const source = hints ?? readNavigatorPerfHints();
  const cores = sanitizeMetric(source.hardwareConcurrency);
  const memory = sanitizeMetric(source.deviceMemoryGb);

  const isLowByCores = cores !== null && cores <= LOW_END_MAX_CPU_CORES;
  const isLowByMemory = memory !== null && memory <= LOW_END_MAX_DEVICE_MEMORY_GB;
  if (isLowByCores || isLowByMemory) return "low";

  const isHighByCores = cores !== null && cores >= HIGH_END_MIN_CPU_CORES;
  const isHighByMemory = memory !== null && memory >= HIGH_END_MIN_DEVICE_MEMORY_GB;
  if (isHighByCores && isHighByMemory) return "high";
  if (isHighByCores && memory === null) return "high";
  if (isHighByMemory && cores === null) return "high";

  return "normal";
};

export const getRenderPerfProfile = (hints?: PerfProfileHints): PerfProfile => {
  const profileName = resolvePerfProfileName(hints);
  return { ...profiles[profileName] };
};
