export type ModPackageUIItemOperation = "add" | "override" | "remove";

export type ModPackageUIItemRule = {
  slotId: string;
  itemId: string;
  operation?: ModPackageUIItemOperation;
  commandId?: string;
  label?: string;
  icon?: string;
  title?: string;
  group?: string;
  when?: string;
  order?: number;
  defaultOpen?: boolean;
};

export type ModPackageUIPolicy = {
  allowToolbarContributionGroups?: readonly string[];
  allowPanelSlots?: readonly string[];
  toolbarItems?: readonly ModPackageUIItemRule[];
  panelItems?: readonly ModPackageUIItemRule[];
};
