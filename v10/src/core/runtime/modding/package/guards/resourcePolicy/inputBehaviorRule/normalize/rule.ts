import type { ModPackageInputBehaviorRule } from "../../../../types";

export const buildInputBehaviorRule = (
  strategy: ModPackageInputBehaviorRule["strategy"],
  modId: string | undefined,
  chain: string[] | undefined
): ModPackageInputBehaviorRule => ({
  strategy,
  ...(modId ? { modId } : {}),
  ...(chain ? { chain } : {}),
});
