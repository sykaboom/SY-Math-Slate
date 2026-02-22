import type { ModPackageJsonObject } from "../../types";
import { isPlainRecord } from "./predicates";

const isJsonPrimitive = (value: unknown): boolean =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

const isJsonValue = (value: unknown, depth = 0): boolean => {
  if (depth > 32) return false;
  if (isJsonPrimitive(value)) return true;
  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry, depth + 1));
  }
  if (isPlainRecord(value)) {
    return Object.values(value).every((entry) => isJsonValue(entry, depth + 1));
  }
  return false;
};

export const isJsonObject = (value: unknown): value is ModPackageJsonObject =>
  isPlainRecord(value) && isJsonValue(value);
