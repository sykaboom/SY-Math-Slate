import type { ModPackageDefinition } from "../../../../../types";
import { parseCommandRules } from "../../../../resourcePolicy";
import {
  mergeResourcePolicy,
  passThroughPolicy,
  type ResourcePolicyParseResult,
} from "./common";

export const parseCommands = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown
): ResourcePolicyParseResult => {
  if (value === undefined) return passThroughPolicy(policy);
  const commandsResult = parseCommandRules(value);
  if (!commandsResult.ok) {
    return { ok: false, value: commandsResult.value };
  }
  return { ok: true, value: mergeResourcePolicy(policy, { commands: commandsResult.value }) };
};
