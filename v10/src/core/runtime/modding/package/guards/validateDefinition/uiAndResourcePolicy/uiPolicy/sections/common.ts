import type { ModPackageDefinition } from "../../../../../types";
import { fail } from "../../../../utils";

export type UiPolicyParseResult =
  | { ok: true; value: ModPackageDefinition["uiPolicy"] }
  | { ok: false; value: ReturnType<typeof fail> };

export const mergeUiPolicy = (
  current: ModPackageDefinition["uiPolicy"],
  patch: NonNullable<ModPackageDefinition["uiPolicy"]>
): ModPackageDefinition["uiPolicy"] => ({
  ...(current ?? {}),
  ...patch,
});
