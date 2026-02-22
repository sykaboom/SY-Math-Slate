import type {
  LocalCloudFallbackHealthHint,
  LocalCloudFallbackHealthState,
} from "@features/platform/extensions/routing";

import { isRecord, readStringFromRecord } from "./bootstrapParsers";

export const parseLocalHealthState = (
  value: unknown
): LocalCloudFallbackHealthState | undefined => {
  if (typeof value !== "string") return undefined;
  const token = value.trim().toLowerCase();
  if (
    token === "healthy" ||
    token === "degraded" ||
    token === "unhealthy" ||
    token === "unknown"
  ) {
    return token;
  }
  return undefined;
};

export const normalizeHealthHint = (
  hint: LocalCloudFallbackHealthHint
): LocalCloudFallbackHealthHint | null => {
  const adapterId = hint.adapterId.trim();
  if (adapterId === "") return null;

  const normalizedState = parseLocalHealthState(hint.state);
  const normalizedHealthy =
    typeof hint.healthy === "boolean" ? hint.healthy : undefined;

  return {
    adapterId,
    ...(normalizedState ? { state: normalizedState } : {}),
    ...(normalizedHealthy !== undefined ? { healthy: normalizedHealthy } : {}),
  };
};

const toHealthHintFromRecord = (value: unknown): LocalCloudFallbackHealthHint | null => {
  if (!isRecord(value)) return null;
  const adapterId =
    readStringFromRecord(value, "adapterId") ?? readStringFromRecord(value, "id");
  if (!adapterId) return null;
  const parsedState = parseLocalHealthState(value.state);
  const hint: LocalCloudFallbackHealthHint = {
    adapterId,
    ...(parsedState ? { state: parsedState } : {}),
    ...(typeof value.healthy === "boolean" ? { healthy: value.healthy } : {}),
  };
  return normalizeHealthHint(hint);
};

const toHealthHintFromMapValue = (
  adapterId: string,
  value: unknown
): LocalCloudFallbackHealthHint | null => {
  const trimmedAdapterId = adapterId.trim();
  if (trimmedAdapterId === "") return null;

  if (typeof value === "boolean") {
    return {
      adapterId: trimmedAdapterId,
      healthy: value,
    };
  }

  const state = parseLocalHealthState(value);
  if (state) {
    return {
      adapterId: trimmedAdapterId,
      state,
    };
  }

  if (!isRecord(value)) return null;
  const recordState = parseLocalHealthState(value.state);
  const recordHealthy = typeof value.healthy === "boolean" ? value.healthy : undefined;
  return normalizeHealthHint({
    adapterId: trimmedAdapterId,
    ...(recordState ? { state: recordState } : {}),
    ...(recordHealthy !== undefined ? { healthy: recordHealthy } : {}),
  });
};

const appendUniqueHealthHint = (
  target: LocalCloudFallbackHealthHint[],
  seen: Set<string>,
  hint: LocalCloudFallbackHealthHint | null
): void => {
  if (!hint) return;
  const normalized = normalizeHealthHint(hint);
  if (!normalized) return;
  if (seen.has(normalized.adapterId)) return;
  seen.add(normalized.adapterId);
  target.push(normalized);
};

const appendHealthHintsFromArray = (
  target: LocalCloudFallbackHealthHint[],
  seen: Set<string>,
  value: unknown
): void => {
  if (!Array.isArray(value)) return;
  value.forEach((entry) => {
    appendUniqueHealthHint(target, seen, toHealthHintFromRecord(entry));
  });
};

const appendHealthHintsFromMap = (
  target: LocalCloudFallbackHealthHint[],
  seen: Set<string>,
  value: unknown
): void => {
  if (!isRecord(value)) return;
  Object.entries(value).forEach(([adapterId, entry]) => {
    appendUniqueHealthHint(target, seen, toHealthHintFromMapValue(adapterId, entry));
  });
};

export const pickLocalHealthHints = (
  meta: Record<string, unknown> | undefined
): LocalCloudFallbackHealthHint[] => {
  const metaRecord = isRecord(meta) ? meta : null;
  if (!metaRecord) return [];

  const hints: LocalCloudFallbackHealthHint[] = [];
  const seen = new Set<string>();

  appendHealthHintsFromArray(hints, seen, metaRecord.adapterHealthHints);
  appendHealthHintsFromArray(hints, seen, metaRecord.localAdapterHealthHints);
  appendHealthHintsFromArray(hints, seen, metaRecord.healthHints);
  appendHealthHintsFromMap(hints, seen, metaRecord.adapterHealthById);
  appendHealthHintsFromMap(hints, seen, metaRecord.localAdapterHealthById);

  return hints;
};
