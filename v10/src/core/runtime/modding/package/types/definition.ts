import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageId,
  ModPackageToolbarMode,
} from "./modes";
import type { ModPackageResourcePolicy } from "./resourcePolicy";
import type { ModPackageUIPolicy } from "./uiPolicy";

export type ModPackageActivationPolicy = {
  toolbarModeMap?: Partial<Record<ModPackageToolbarMode, ModId>>;
  defaultModId: ModId;
};

export type ModPackageDefinition = {
  packId: ModPackageId;
  version: string;
  label: string;
  modIds: readonly ModId[];
  activation: ModPackageActivationPolicy;
  uiPolicy?: ModPackageUIPolicy;
  resourcePolicy?: ModPackageResourcePolicy;
  dependencies?: readonly ModPackageId[];
  conflicts?: readonly ModPackageId[];
  defaultEnabled?: boolean;
};
