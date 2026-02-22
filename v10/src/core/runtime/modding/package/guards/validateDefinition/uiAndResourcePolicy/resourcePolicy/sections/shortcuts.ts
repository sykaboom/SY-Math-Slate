import type { ModPackageDefinition } from "../../../../../types";
import { parseShortcutRules } from "../../../../resourcePolicy";
import {
  mergeResourcePolicy,
  passThroughPolicy,
  type ResourcePolicyParseResult,
} from "./common";

export const parseShortcuts = (
  policy: ModPackageDefinition["resourcePolicy"],
  value: unknown
): ResourcePolicyParseResult => {
  if (value === undefined) return passThroughPolicy(policy);
  const shortcutsResult = parseShortcutRules(value);
  if (!shortcutsResult.ok) {
    return { ok: false, value: shortcutsResult.value };
  }
  return { ok: true, value: mergeResourcePolicy(policy, { shortcuts: shortcutsResult.value }) };
};
