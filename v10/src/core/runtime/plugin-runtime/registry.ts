import type { ComponentType } from "react";
import type {
  ExtensionManifest,
  ExtensionType,
} from "./manifest";
import type {
  ToolRegistryEntry,
  ToolRegistryValidationError,
  ToolRegistryValidationSuccess,
} from "@core/foundation/schemas";
import { validateToolRegistryEntry } from "@core/foundation/schemas";

const registry: ExtensionManifest[] = [];
const toolRegistry: ToolRegistryEntry[] = [];
const uiSlotRegistry = new Map<UISlotName, UISlotComponent[]>();
const uiSlotRegistryListeners = new Set<() => void>();
let uiSlotRegistryVersion = 0;

export const KNOWN_UI_SLOT_NAMES = [
  "chrome-top-toolbar",
  "left-panel",
  "toolbar-inline",
  "toolbar-bottom",
] as const;

export type ToolRegistryUpsertSuccess = ToolRegistryValidationSuccess & {
  replaced: boolean;
};

export type ToolRegistryUpsertResult =
  | ToolRegistryUpsertSuccess
  | ToolRegistryValidationError;

export type UISlotName = (typeof KNOWN_UI_SLOT_NAMES)[number];
export type UISlotComponent = ComponentType;

export const listKnownUISlotNames = (): UISlotName[] => [...KNOWN_UI_SLOT_NAMES];

export const isKnownUISlotName = (slotName: unknown): slotName is UISlotName =>
  typeof slotName === "string" &&
  (KNOWN_UI_SLOT_NAMES as readonly string[]).includes(slotName);

const notifyUISlotRegistryUpdated = (): void => {
  uiSlotRegistryVersion += 1;
  uiSlotRegistryListeners.forEach((listener) => listener());
};

export const registerExtension = (manifest: ExtensionManifest) => {
  const existingIndex = registry.findIndex((item) => item.id === manifest.id);
  if (existingIndex >= 0) {
    registry[existingIndex] = manifest;
    return;
  }
  registry.push(manifest);
};

export const listExtensions = () => [...registry];

export const getExtensionsByType = (type: ExtensionType) =>
  registry.filter((item) => item.type === type);

export const getExtensionById = (id: string) =>
  registry.find((item) => item.id === id) ?? null;

export const clearExtensions = () => {
  registry.length = 0;
};

export const registerToolRegistryEntry = (
  entry: unknown
): ToolRegistryUpsertResult => {
  const validated = validateToolRegistryEntry(entry);
  if (!validated.ok) return validated;

  const existingIndex = toolRegistry.findIndex(
    (item) => item.toolId === validated.value.toolId
  );

  if (existingIndex >= 0) {
    toolRegistry[existingIndex] = validated.value;
    return { ...validated, replaced: true };
  }

  toolRegistry.push(validated.value);
  return { ...validated, replaced: false };
};

export const listToolRegistryEntries = (): ToolRegistryEntry[] => [...toolRegistry];

export const getToolRegistryEntryById = (toolId: string): ToolRegistryEntry | null =>
  toolRegistry.find((item) => item.toolId === toolId) ?? null;

export const isToolRegistered = (toolId: string): boolean =>
  getToolRegistryEntryById(toolId) !== null;

export const clearToolRegistryEntries = () => {
  toolRegistry.length = 0;
};

export const registerUISlotComponent = (
  slotName: UISlotName,
  component: UISlotComponent
): void => {
  const components = uiSlotRegistry.get(slotName);
  if (!components) {
    uiSlotRegistry.set(slotName, [component]);
    notifyUISlotRegistryUpdated();
    return;
  }

  if (!components.includes(component)) {
    components.push(component);
    notifyUISlotRegistryUpdated();
  }
};

export const listUISlotComponents = (
  slotName: UISlotName
): UISlotComponent[] => [...(uiSlotRegistry.get(slotName) ?? [])];

export const subscribeUISlotRegistry = (
  listener: () => void
): (() => void) => {
  uiSlotRegistryListeners.add(listener);
  return () => {
    uiSlotRegistryListeners.delete(listener);
  };
};

export const getUISlotRegistryVersion = (): number => uiSlotRegistryVersion;

export const clearUISlotComponents = (slotName?: UISlotName): void => {
  if (slotName === undefined) {
    if (uiSlotRegistry.size === 0) return;
    uiSlotRegistry.clear();
    notifyUISlotRegistryUpdated();
    return;
  }

  if (!uiSlotRegistry.has(slotName)) return;
  uiSlotRegistry.delete(slotName);
  notifyUISlotRegistryUpdated();
};
