import type {
  ModPackageJsonObject,
  ModPackageToolbarMode,
} from "../types";
import { MOD_PACKAGE_TOOLBAR_MODES } from "../types";
import type { ModPackageValidationFailure } from "./types";

const KNOWN_TOOLBAR_MODES = new Set<string>(MOD_PACKAGE_TOOLBAR_MODES);

export const KNOWN_UI_ITEM_OPERATIONS = new Set(["add", "override", "remove"]);
export const KNOWN_COMMAND_OPERATIONS = new Set(["upsert", "remove"]);
export const KNOWN_SHORTCUT_OPERATIONS = new Set(["upsert", "remove"]);
export const KNOWN_INPUT_BEHAVIOR_STRATEGIES = new Set([
  "exclusive",
  "handled-pass-chain",
]);

export const fail = (
  code: ModPackageValidationFailure["code"],
  path: string,
  message: string
): ModPackageValidationFailure => ({ ok: false, code, path, message });

export const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

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

export const toStringArray = (
  value: unknown,
  code: ModPackageValidationFailure["code"],
  path: string,
  message: string
):
  | { ok: true; value: string[] }
  | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return { ok: false, value: fail(code, path, message) };
  }
  if (!value.every(isNonEmptyString)) {
    return { ok: false, value: fail(code, path, message) };
  }
  return { ok: true, value: [...value] };
};

export const hasDuplicateStrings = (value: readonly string[]): boolean => {
  const unique = new Set(value);
  return unique.size !== value.length;
};

export const isToolbarMode = (value: string): value is ModPackageToolbarMode =>
  KNOWN_TOOLBAR_MODES.has(value);
