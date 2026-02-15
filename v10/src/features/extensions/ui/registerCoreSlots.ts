import {
  registerUISlotComponent,
  type UISlotName,
} from "@core/extensions/registry";
import { PendingApprovalPanel } from "@features/toolbar/PendingApprovalPanel";
import {
  CoreDataInputPanelSlot,
  CoreFloatingToolbarSlot,
  CorePrompterSlot,
} from "./CoreSlotComponents";

const LEFT_PANEL_SLOT: UISlotName = "left-panel";
const TOOLBAR_BOTTOM_SLOT: UISlotName = "toolbar-bottom";
const LAYOUT_SLOT_CUTOVER_ENABLED =
  process.env.NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER === "1";

let hasRegisteredCoreSlots = false;

export const registerCoreSlots = (): void => {
  if (hasRegisteredCoreSlots) return;

  registerUISlotComponent(TOOLBAR_BOTTOM_SLOT, PendingApprovalPanel);
  if (LAYOUT_SLOT_CUTOVER_ENABLED) {
    registerUISlotComponent(LEFT_PANEL_SLOT, CoreDataInputPanelSlot);
    registerUISlotComponent(TOOLBAR_BOTTOM_SLOT, CorePrompterSlot);
    registerUISlotComponent(TOOLBAR_BOTTOM_SLOT, CoreFloatingToolbarSlot);
  }

  hasRegisteredCoreSlots = true;
};
