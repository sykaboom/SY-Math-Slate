import type { ModPackageValidationFailure } from "../types";
import { fail } from "./failure";
import { isNonEmptyString } from "./predicates";

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
