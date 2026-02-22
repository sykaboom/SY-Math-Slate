import type { ModPackageValidationResult } from "../../../types";
import {
  buildValidatedDefinition,
  type BuildValidatedDefinitionInput,
} from "../../dependenciesAndFinalize";
import type { ValidationBaseContext } from "../../baseFields/types";
import type { ParsedValidationPolicies } from "./policies";
import type { ParsedValidationRelations } from "./relations";

export const buildValidatedDefinitionResult = (
  base: ValidationBaseContext,
  toolbarModeMap: BuildValidatedDefinitionInput["toolbarModeMap"],
  policies: ParsedValidationPolicies,
  relations: ParsedValidationRelations
): ModPackageValidationResult => ({
  ok: true,
  value: buildValidatedDefinition({
    packId: base.packId,
    version: base.version,
    label: base.label,
    modIds: base.modIds,
    defaultModId: base.defaultModId,
    toolbarModeMap,
    uiPolicy: policies.uiPolicy,
    resourcePolicy: policies.resourcePolicy,
    dependencies: relations.dependencies,
    conflicts: relations.conflicts,
    defaultEnabled: relations.defaultEnabled,
  }),
});
