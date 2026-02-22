import type { ModPackageDefinition } from "../../../../types";
import {
  parseCommandRules,
  parseInputBehaviorRule,
  parseShortcutRules,
} from "../../../resourcePolicy";
import { fail, isJsonObject } from "../../../utils";

type ResourcePolicyParseResult =
  | { ok: true; value: ModPackageDefinition["resourcePolicy"] }
  | { ok: false; value: ReturnType<typeof fail> };

const mergeResourcePolicy = (
  current: ModPackageDefinition["resourcePolicy"],
  patch: NonNullable<ModPackageDefinition["resourcePolicy"]>
): ModPackageDefinition["resourcePolicy"] => ({
  ...(current ?? {}),
  ...patch,
});

export const parsePolicyPatch = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown
): ResourcePolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
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

export const parseCommands = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown
): ResourcePolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const commandsResult = parseCommandRules(value);
  if (!commandsResult.ok) {
    return { ok: false, value: commandsResult.value };
  }
  return { ok: true, value: mergeResourcePolicy(policy, { commands: commandsResult.value }) };
};

export const parseShortcuts = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown
): ResourcePolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const shortcutsResult = parseShortcutRules(value);
  if (!shortcutsResult.ok) {
    return { ok: false, value: shortcutsResult.value };
  }
  return { ok: true, value: mergeResourcePolicy(policy, { shortcuts: shortcutsResult.value }) };
};

export const parseInputBehavior = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown,
  modIdSet: Set<string>
): ResourcePolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const inputBehaviorResult = parseInputBehaviorRule(value, modIdSet);
  if (!inputBehaviorResult.ok) {
    return { ok: false, value: inputBehaviorResult.value };
  }
  return {
    ok: true,
    value: mergeResourcePolicy(policy, { inputBehavior: inputBehaviorResult.value }),
  };
};
