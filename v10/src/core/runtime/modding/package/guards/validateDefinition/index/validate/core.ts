import type { ModPackageValidationResult } from "../../../types";
import { parseActivationToolbarModeMap } from "../../activation";
import type { ValidationBaseContext } from "../../baseFields/types";
import { buildValidatedDefinitionResult } from "./finalize";
import { parseValidationPolicies } from "./policies";
import { parseValidationRelations } from "./relations";

export const validateDefinitionFromBase = (
  base: ValidationBaseContext
): ModPackageValidationResult => {
  const toolbarModeMapResult = parseActivationToolbarModeMap(
    base.activation,
    base.modIdSet
  );
  if (!toolbarModeMapResult.ok) {
    return toolbarModeMapResult.value;
  }

  const policiesResult = parseValidationPolicies(base);
  if (!policiesResult.ok) {
    return policiesResult.value;
  }

  const relationsResult = parseValidationRelations(base.manifest);
  if (!relationsResult.ok) {
    return relationsResult.value;
  }

  return buildValidatedDefinitionResult(
    base,
    toolbarModeMapResult.value,
    policiesResult.value,
    relationsResult.value
  );
};
