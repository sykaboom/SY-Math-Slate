import type { ModPackageValidationResult } from "../../types";
import { parseValidationBase } from "../baseFields";
import { validateDefinitionFromBase } from "./validate/core";

export const validateModPackageDefinition = (
  value: unknown
): ModPackageValidationResult => {
  const baseResult = parseValidationBase(value);
  if (!baseResult.ok) {
    return baseResult.value;
  }
  return validateDefinitionFromBase(baseResult.value);
};
