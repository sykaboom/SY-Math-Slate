import type { ModPackageId } from "../../../types";

export type ValidationBaseContext = {
  manifest: Record<string, unknown>;
  packId: string;
  version: string;
  label: string;
  modIds: ModPackageId[];
  modIdSet: Set<string>;
  activation: Record<string, unknown>;
  defaultModId: string;
};
