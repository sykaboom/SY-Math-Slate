import type { ModPackageId } from "../../../types";
import { fail, toStringArray } from "../../utils";

export const parseConflictsImpl = (
  value: unknown
):
  | { ok: true; value: ModPackageId[] }
  | { ok: false; value: ReturnType<typeof fail> } =>
  toStringArray(
    value,
    "invalid-conflicts",
    "manifest.conflicts",
    "conflicts must be an array of non-empty strings."
  );
