import type { ModPackageDefinition } from "../../../../../types";
import { fail } from "../../../../utils";

export type ResourcePolicyParseResult =
  | { ok: true; value: ModPackageDefinition["resourcePolicy"] }
  | { ok: false; value: ReturnType<typeof fail> };

export const mergeResourcePolicy = (
  current: ModPackageDefinition["resourcePolicy"],
  patch: NonNullable<ModPackageDefinition["resourcePolicy"]>
): ModPackageDefinition["resourcePolicy"] => ({
  ...(current ?? {}),
  ...patch,
});

export const passThroughPolicy = (
  policy: ModPackageDefinition["resourcePolicy"]
): ResourcePolicyParseResult => ({ ok: true, value: policy });
