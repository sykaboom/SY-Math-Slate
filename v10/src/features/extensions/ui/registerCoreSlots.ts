import {
  registerUISlotComponent,
  type UISlotName,
} from "@core/extensions/registry";
import { PendingApprovalPanel } from "@features/toolbar/PendingApprovalPanel";

const SLOT_REGISTRY_UPDATED_EVENT = "sy-math-slate:extension-slots-updated";
const TOOLBAR_BOTTOM_SLOT: UISlotName = "toolbar-bottom";

let hasRegisteredCoreSlots = false;

const emitSlotUpdate = (): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SLOT_REGISTRY_UPDATED_EVENT));
};

export const registerCoreSlots = (): void => {
  if (hasRegisteredCoreSlots) return;

  registerUISlotComponent(TOOLBAR_BOTTOM_SLOT, PendingApprovalPanel);

  hasRegisteredCoreSlots = true;
  emitSlotUpdate();
};
