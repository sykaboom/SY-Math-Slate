"use client";

import { useSyncExternalStore } from "react";

import {
  getUISlotRegistryVersion,
  listUISlotComponents,
  subscribeUISlotRegistry,
  type UISlotName,
} from "@core/extensions/registry";

type ExtensionSlotProps = {
  name?: UISlotName;
  slot?: UISlotName;
  className?: string;
};

export function ExtensionSlot(props: ExtensionSlotProps) {
  const slotName = props.name ?? props.slot;
  const className = props.className;

  useSyncExternalStore(
    subscribeUISlotRegistry,
    getUISlotRegistryVersion,
    getUISlotRegistryVersion
  );
  const components = slotName ? listUISlotComponents(slotName) : [];

  if (!slotName) return null;
  if (components.length === 0) return null;

  const rendered = components.map((SlotComponent, index) => (
    <SlotComponent key={`${slotName}-${index}`} />
  ));

  if (!className) return <>{rendered}</>;
  return <div className={className}>{rendered}</div>;
}
