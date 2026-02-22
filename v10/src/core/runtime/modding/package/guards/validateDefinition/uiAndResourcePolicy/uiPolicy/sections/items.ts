import type { ModPackageDefinition } from "../../../../../types";
import { parseUIItemRules } from "../../../../uiPolicy";
import { mergeUiPolicy, type UiPolicyParseResult } from "./common";

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
