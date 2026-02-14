import {
  registerUISlotComponent,
  type UISlotName,
} from "@core/extensions/registry";
import { PendingApprovalPanel } from "@features/toolbar/PendingApprovalPanel";

const TOOLBAR_BOTTOM_SLOT: UISlotName = "toolbar-bottom";

let hasRegisteredCoreSlots = false;

export const registerCoreSlots = (): void => {
  if (hasRegisteredCoreSlots) return;

  registerUISlotComponent(TOOLBAR_BOTTOM_SLOT, PendingApprovalPanel);

  hasRegisteredCoreSlots = true;
};
