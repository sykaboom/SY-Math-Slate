import type { ModPackageValidationFailure } from "../types";

export const fail = (
  code: ModPackageValidationFailure["code"],
  path: string,
  message: string
): ModPackageValidationFailure => ({ ok: false, code, path, message });
