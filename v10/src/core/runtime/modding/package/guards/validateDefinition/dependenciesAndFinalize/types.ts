import type { ModPackageDefinition, ModPackageId, ModPackageToolbarMode } from "../../../types";

export type BuildValidatedDefinitionInput = {
  packId: string;
  version: string;
  label: string;
  modIds: ModPackageId[];
  defaultModId: string;
  toolbarModeMap: Partial<Record<ModPackageToolbarMode, string>> | undefined;
  uiPolicy: ModPackageDefinition["uiPolicy"];
  resourcePolicy: ModPackageDefinition["resourcePolicy"];
  dependencies: ModPackageId[] | undefined;
  conflicts: ModPackageId[] | undefined;
  defaultEnabled: boolean | undefined;
};
