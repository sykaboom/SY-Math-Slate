import type { CapabilityRouterRequestShape } from "@features/platform/extensions/routing";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

export const readStringFromRecord = (
  value: Record<string, unknown> | null,
  key: string
): string | undefined => {
  if (!value) return undefined;
  const candidate = value[key];
  if (typeof candidate !== "string") return undefined;
  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const readNumberFromRecord = (
  value: Record<string, unknown> | null,
  key: string
): number | undefined => {
  if (!value) return undefined;
  const candidate = value[key];
  if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < 0) {
    return undefined;
  }
  return candidate;
};

export const pickRoutingRequestShape = (
  payload: unknown,
  meta: Record<string, unknown> | undefined
): CapabilityRouterRequestShape => {
  const payloadRecord = isRecord(payload) ? payload : null;
  const metaRecord = isRecord(meta) ? meta : null;

  const locale =
    readStringFromRecord(payloadRecord, "locale") ??
    readStringFromRecord(metaRecord, "locale");
  const mediaType =
    readStringFromRecord(payloadRecord, "mediaType") ??
    readStringFromRecord(payloadRecord, "mimeType") ??
    readStringFromRecord(metaRecord, "mediaType");
  const inputTokens =
    readNumberFromRecord(payloadRecord, "inputTokens") ??
    readNumberFromRecord(metaRecord, "inputTokens");
  const outputTokens =
    readNumberFromRecord(payloadRecord, "outputTokens") ??
    readNumberFromRecord(metaRecord, "outputTokens");
  const assetBytes =
    readNumberFromRecord(payloadRecord, "assetBytes") ??
    readNumberFromRecord(metaRecord, "assetBytes");

  return {
    ...(locale ? { locale } : {}),
    ...(mediaType ? { mediaType } : {}),
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
    ...(assetBytes !== undefined ? { assetBytes } : {}),
  };
};

const appendUniqueAdapterId = (
  target: string[],
  seen: Set<string>,
  value: unknown
): void => {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (trimmed === "" || seen.has(trimmed)) return;
  seen.add(trimmed);
  target.push(trimmed);
};

const appendAdapterIds = (
  target: string[],
  seen: Set<string>,
  value: unknown
): void => {
  if (typeof value === "string") {
    appendUniqueAdapterId(target, seen, value);
    return;
  }

  if (!Array.isArray(value)) return;
  value.forEach((entry) => {
    appendUniqueAdapterId(target, seen, entry);
  });
};

export const pickPreferredLocalAdapterIds = (
  meta: Record<string, unknown> | undefined,
  fallbackAdapterId: string
): string[] => {
  const preferred: string[] = [];
  const seen = new Set<string>();
  appendUniqueAdapterId(preferred, seen, fallbackAdapterId);

  const metaRecord = isRecord(meta) ? meta : null;
  if (!metaRecord) return preferred;

  appendAdapterIds(preferred, seen, metaRecord.preferredLocalAdapterIds);
  appendAdapterIds(preferred, seen, metaRecord.localPreferredAdapterIds);
  appendAdapterIds(preferred, seen, metaRecord.localAdapterIds);

  return preferred;
};
