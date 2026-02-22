import type { ModId } from "@core/runtime/modding/api";

import type { ModPackageDefinition } from "../../../../types";

export const selectModPackageActivationDefaultModId = (
  definition: ModPackageDefinition | null | undefined
): ModId | null => definition?.activation.defaultModId ?? null;
