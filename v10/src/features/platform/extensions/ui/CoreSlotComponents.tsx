"use client";

import { DataInputPanel } from "@features/chrome/layout/DataInputPanel";
import { Prompter } from "@features/chrome/layout/Prompter";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";
import { FloatingToolbar } from "@features/chrome/toolbar/FloatingToolbar";

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
