import { parseResourcePolicy, parseUiPolicy } from "../../uiAndResourcePolicy";
import type { ValidationBaseContext } from "../../baseFields/types";
import type { ModPackageDefinition } from "../../../../types";
import { fail } from "../../../utils";

export type ParsedValidationPolicies = {
  uiPolicy: ModPackageDefinition["uiPolicy"];
  resourcePolicy: ModPackageDefinition["resourcePolicy"];
};

export const parseValidationPolicies = (
  base: ValidationBaseContext
): { ok: true; value: ParsedValidationPolicies } | { ok: false; value: ReturnType<typeof fail> } => {
  const uiPolicyResult = parseUiPolicy(base.manifest.uiPolicy);
  if (!uiPolicyResult.ok) {
    return uiPolicyResult;
  }

  const resourcePolicyResult = parseResourcePolicy(
    base.manifest.resourcePolicy,
    base.modIdSet
  );
  if (!resourcePolicyResult.ok) {
    return resourcePolicyResult;
  }

  return {
    ok: true,
    value: {
      uiPolicy: uiPolicyResult.value,
      resourcePolicy: resourcePolicyResult.value,
    },
  };
};
