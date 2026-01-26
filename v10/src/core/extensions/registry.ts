import type { ExtensionManifest, ExtensionType } from "./manifest";

const registry: ExtensionManifest[] = [];

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
