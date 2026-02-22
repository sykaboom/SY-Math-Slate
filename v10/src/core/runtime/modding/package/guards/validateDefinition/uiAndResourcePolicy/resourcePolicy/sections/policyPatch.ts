import type { ModPackageDefinition } from "../../../../../types";
import { fail, isJsonObject } from "../../../../utils";
import {
  mergeResourcePolicy,
  passThroughPolicy,
  type ResourcePolicyParseResult,
} from "./common";

export const parsePolicyPatch = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown
): ResourcePolicyParseResult => {
  if (value === undefined) return passThroughPolicy(policy);
  if (!isJsonObject(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.policyPatch",
        "policyPatch must be a JSON object."
      ),
    };
  }
  return { ok: true, value: mergeResourcePolicy(policy, { policyPatch: value }) };
};
