import type { ModPackageDefinition } from "../../../../../types";
import { fail } from "../../../../utils";
import {
  parseCommands,
  parseInputBehavior,
  parsePolicyPatch,
  parseShortcuts,
} from "../sections";

type ResourcePolicyParseResult =
  | { ok: true; value: ModPackageDefinition["resourcePolicy"] }
  | { ok: false; value: ReturnType<typeof fail> };

export const parseResourcePolicySections = (
  value: Record<string, unknown>,
  modIdSet: Set<string>
): ResourcePolicyParseResult => {
  let resourcePolicy: ModPackageDefinition["resourcePolicy"] = undefined;

  const policyPatch = parsePolicyPatch(resourcePolicy, value["policyPatch"]);
  if (!policyPatch.ok) return policyPatch;
  resourcePolicy = policyPatch.value;

  const commands = parseCommands(resourcePolicy, value["commands"]);
  if (!commands.ok) return commands;
  resourcePolicy = commands.value;

  const shortcuts = parseShortcuts(resourcePolicy, value["shortcuts"]);
  if (!shortcuts.ok) return shortcuts;
  resourcePolicy = shortcuts.value;

  const inputBehavior = parseInputBehavior(
    resourcePolicy,
    value["inputBehavior"],
    modIdSet
  );
  if (!inputBehavior.ok) return inputBehavior;
  resourcePolicy = inputBehavior.value;

  return { ok: true, value: resourcePolicy };
};
