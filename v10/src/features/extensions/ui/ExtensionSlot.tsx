"use client";

import { useSyncExternalStore, type ComponentType } from "react";

import {
  listUISlotComponents,
  type UISlotName,
} from "@core/extensions/registry";

const SLOT_REGISTRY_UPDATED_EVENT = "sy-math-slate:extension-slots-updated";

type ExtensionSlotProps = {
  name?: UISlotName;
  slot?: UISlotName;
  className?: string;
};

const subscribe = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(SLOT_REGISTRY_UPDATED_EVENT, onStoreChange);
  return () => window.removeEventListener(SLOT_REGISTRY_UPDATED_EVENT, onStoreChange);
};

const getServerSnapshot = (): ComponentType[] => [];

export function ExtensionSlot(props: ExtensionSlotProps) {
  const slotName = props.name ?? props.slot;
  const className = props.className;

  const components = useSyncExternalStore(
    subscribe,
    () => (slotName ? listUISlotComponents(slotName) : []),
    getServerSnapshot
  );

  if (!slotName) return null;
  if (components.length === 0) return null;

  const rendered = components.map((SlotComponent, index) => (
    <SlotComponent key={`${slotName}-${index}`} />
  ));

  if (!className) return <>{rendered}</>;
  return <div className={className}>{rendered}</div>;
}
