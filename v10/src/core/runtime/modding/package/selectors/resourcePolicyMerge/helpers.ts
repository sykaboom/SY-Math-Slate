import type { ModPackageJsonObject, ModPackageJsonValue } from "../../types";

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const cloneJsonValue = (
  value: ModPackageJsonValue
): ModPackageJsonValue => {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneJsonValue(entry)) as ModPackageJsonValue;
  }
  if (isPlainRecord(value)) {
    return cloneJsonObject(value as ModPackageJsonObject);
  }
  return value;
};

export const cloneJsonObject = (
  value: ModPackageJsonObject
): ModPackageJsonObject => {
  const cloned: ModPackageJsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    cloned[key] = cloneJsonValue(entry);
  }
  return cloned;
};

export const applyJsonMergePatchObject = (
  baseValue: ModPackageJsonObject,
  patchValue: ModPackageJsonObject
): ModPackageJsonObject => {
  const next = cloneJsonObject(baseValue);
  for (const [key, patchEntry] of Object.entries(patchValue)) {
    if (patchEntry === null) {
      delete next[key];
      continue;
    }
    if (Array.isArray(patchEntry)) {
      next[key] = patchEntry.map((entry) => cloneJsonValue(entry));
      continue;
    }
    if (isPlainRecord(patchEntry)) {
      const existing = next[key];
      const existingObject = isPlainRecord(existing)
        ? (existing as ModPackageJsonObject)
        : {};
      next[key] = applyJsonMergePatchObject(
        existingObject,
        patchEntry as ModPackageJsonObject
      );
      continue;
    }
    next[key] = patchEntry;
  }
  return next;
};
