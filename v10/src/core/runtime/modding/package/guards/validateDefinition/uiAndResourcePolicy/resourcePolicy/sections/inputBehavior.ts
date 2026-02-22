import type { ModPackageDefinition } from "../../../../../types";
import { parseInputBehaviorRule } from "../../../../resourcePolicy";
import {
  mergeResourcePolicy,
  passThroughPolicy,
  type ResourcePolicyParseResult,
} from "./common";

export const parseInputBehavior = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown,
  modIdSet: Set<string>
): ResourcePolicyParseResult => {
  if (value === undefined) return passThroughPolicy(policy);
  const inputBehaviorResult = parseInputBehaviorRule(value, modIdSet);
  if (!inputBehaviorResult.ok) {
    return { ok: false, value: inputBehaviorResult.value };
  }
  return {
    ok: true,
    value: mergeResourcePolicy(policy, { inputBehavior: inputBehaviorResult.value }),
  };
};
