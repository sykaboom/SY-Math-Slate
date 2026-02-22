import type { ModPackageDefinition } from "../../../../../types";
import { toStringArray } from "../../../../utils";
import { mergeUiPolicy, type UiPolicyParseResult } from "./common";

export const parseAllowToolbarContributionGroups = (
  policy: ModPackageDefinition["uiPolicy"],
  value: unknown
): UiPolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const groupsResult = toStringArray(
    value,
    "invalid-ui-policy",
    "manifest.uiPolicy.allowToolbarContributionGroups",
    "allowToolbarContributionGroups must be an array of non-empty strings."
  );
  if (!groupsResult.ok) {
    return { ok: false, value: groupsResult.value };
  }
  return {
    ok: true,
    value: mergeUiPolicy(policy, {
      allowToolbarContributionGroups: groupsResult.value,
    }),
  };
};

export const parseAllowPanelSlots = (
  policy: ModPackageDefinition["uiPolicy"],
  value: unknown
): UiPolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const slotsResult = toStringArray(
    value,
    "invalid-ui-policy",
    "manifest.uiPolicy.allowPanelSlots",
    "allowPanelSlots must be an array of non-empty strings."
  );
  if (!slotsResult.ok) {
    return { ok: false, value: slotsResult.value };
  }
  return {
    ok: true,
    value: mergeUiPolicy(policy, {
      allowPanelSlots: slotsResult.value,
    }),
  };
};
