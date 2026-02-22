import type { ModPackageDefinition, ModPackageId } from "../../../../../types";
import { selectActiveModPackage } from "../../../../packageSelection";

export const withActiveDefinition = <T>(
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined,
  pick: (definition: ModPackageDefinition | null) => T
): T => pick(selectActiveModPackage(definitions, activePackageId));
