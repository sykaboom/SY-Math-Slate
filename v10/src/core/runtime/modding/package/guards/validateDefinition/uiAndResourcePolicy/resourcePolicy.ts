import type { ModPackageDefinition } from "../../../types";
import {
  parseCommandRules,
  parseInputBehaviorRule,
  parseShortcutRules,
} from "../../resourcePolicy";
import { fail, isJsonObject, isPlainRecord } from "../../utils";

export const parseResourcePolicy = (
  value: unknown,
  modIdSet: Set<string>
):
  | { ok: true; value: ModPackageDefinition["resourcePolicy"] }
  | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy",
        "resourcePolicy must be an object."
      ),
    };
  }

  let resourcePolicy: ModPackageDefinition["resourcePolicy"] = undefined;

  if (value.policyPatch !== undefined) {
    if (!isJsonObject(value.policyPatch)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.policyPatch",
          "policyPatch must be a JSON object."
        ),
      };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      policyPatch: value.policyPatch,
    };
  }

  if (value.commands !== undefined) {
    const commandsResult = parseCommandRules(value.commands);
    if (!commandsResult.ok) {
      return { ok: false, value: commandsResult.value };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      commands: commandsResult.value,
    };
  }

  if (value.shortcuts !== undefined) {
    const shortcutsResult = parseShortcutRules(value.shortcuts);
    if (!shortcutsResult.ok) {
      return { ok: false, value: shortcutsResult.value };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      shortcuts: shortcutsResult.value,
    };
  }

  if (value.inputBehavior !== undefined) {
    const inputBehaviorResult = parseInputBehaviorRule(value.inputBehavior, modIdSet);
    if (!inputBehaviorResult.ok) {
      return { ok: false, value: inputBehaviorResult.value };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      inputBehavior: inputBehaviorResult.value,
    };
  }

  return { ok: true, value: resourcePolicy };
};
