import type { ModPackageDefinition } from "../../../../../types";
import { fail } from "../../../../utils";
import {
  parseAllowPanelSlots,
  parseAllowToolbarContributionGroups,
  parsePanelItems,
  parseToolbarItems,
} from "../sections";

type UiPolicyParseResult =
  | { ok: true; value: ModPackageDefinition["uiPolicy"] }
  | { ok: false; value: ReturnType<typeof fail> };

export const parseUiPolicySections = (value: Record<string, unknown>): UiPolicyParseResult => {
  let uiPolicy: ModPackageDefinition["uiPolicy"] = undefined;

  const groups = parseAllowToolbarContributionGroups(
    uiPolicy,
    value["allowToolbarContributionGroups"]
  );
  if (!groups.ok) return groups;
  uiPolicy = groups.value;

  const slots = parseAllowPanelSlots(uiPolicy, value["allowPanelSlots"]);
  if (!slots.ok) return slots;
  uiPolicy = slots.value;

  const toolbarItems = parseToolbarItems(uiPolicy, value["toolbarItems"]);
  if (!toolbarItems.ok) return toolbarItems;
  uiPolicy = toolbarItems.value;

  const panelItems = parsePanelItems(uiPolicy, value["panelItems"]);
  if (!panelItems.ok) return panelItems;
  uiPolicy = panelItems.value;

  return { ok: true, value: uiPolicy };
};
