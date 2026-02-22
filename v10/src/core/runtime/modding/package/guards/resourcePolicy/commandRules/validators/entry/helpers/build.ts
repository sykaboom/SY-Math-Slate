import type { ModPackageCommandOperation, ModPackageCommandRule } from "../../../../../../types";

export const buildCommandRule = (
  commandId: string,
  operation: ModPackageCommandOperation | undefined,
  overrideAllowed: boolean | undefined
): ModPackageCommandRule => ({
  commandId: commandId.trim(),
  ...(operation ? { operation } : {}),
  ...(overrideAllowed !== undefined ? { overrideAllowed } : {}),
});
