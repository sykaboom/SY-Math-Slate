"use client";

import { DataInputPanel } from "@features/layout/DataInputPanel";
import { Prompter } from "@features/layout/Prompter";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { FloatingToolbar } from "@features/toolbar/FloatingToolbar";

export function CoreDataInputPanelSlot() {
  return <DataInputPanel />;
}

export function CorePrompterSlot() {
  const { fullscreenInkMode } = useUIStore();
  if (fullscreenInkMode !== "off") return null;
  return <Prompter />;
}

export function CoreFloatingToolbarSlot() {
  return <FloatingToolbar />;
}
