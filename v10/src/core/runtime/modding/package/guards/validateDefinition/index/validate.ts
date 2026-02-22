import type { ModPackageValidationResult } from "../../types";
import { parseActivationToolbarModeMap } from "../activation";
import { parseValidationBase } from "../baseFields";
import { buildValidatedDefinitionResult } from "./validate/finalize";
import { parseValidationPolicies } from "./validate/policies";
import { parseValidationRelations } from "./validate/relations";

export const validateModPackageDefinition = (
  value: unknown
): ModPackageValidationResult => {
  const baseResult = parseValidationBase(value);
  if (!baseResult.ok) {
    return baseResult.value;
  }
  const base = baseResult.value;

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
