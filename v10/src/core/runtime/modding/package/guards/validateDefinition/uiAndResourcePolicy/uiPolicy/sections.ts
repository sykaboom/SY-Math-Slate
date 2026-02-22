import type { ModPackageDefinition } from "../../../../types";
import { parseUIItemRules } from "../../../uiPolicy";
import { fail, toStringArray } from "../../../utils";

type UiPolicyParseResult =
  | { ok: true; value: ModPackageDefinition["uiPolicy"] }
  | { ok: false; value: ReturnType<typeof fail> };

const mergeUiPolicy = (
  current: ModPackageDefinition["uiPolicy"],
  patch: NonNullable<ModPackageDefinition["uiPolicy"]>
): ModPackageDefinition["uiPolicy"] => ({
  ...(current ?? {}),
  ...patch,
});

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

export const parseToolbarItems = (
  policy: ModPackageDefinition["uiPolicy"],
  value: unknown
): UiPolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const toolbarItemsResult = parseUIItemRules(value, "manifest.uiPolicy.toolbarItems");
  if (!toolbarItemsResult.ok) {
    return { ok: false, value: toolbarItemsResult.value };
  }
  return {
    ok: true,
    value: mergeUiPolicy(policy, { toolbarItems: toolbarItemsResult.value }),
  };
};

export const parsePanelItems = (
  policy: ModPackageDefinition["uiPolicy"],
  value: unknown
): UiPolicyParseResult => {
  if (value === undefined) return { ok: true, value: policy };
  const panelItemsResult = parseUIItemRules(value, "manifest.uiPolicy.panelItems");
  if (!panelItemsResult.ok) {
    return { ok: false, value: panelItemsResult.value };
  }
  return {
    ok: true,
    value: mergeUiPolicy(policy, { panelItems: panelItemsResult.value }),
  };
};
