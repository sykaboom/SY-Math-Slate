import type {
  ExtensionPermission,
  ExtensionTrigger,
} from "./manifest";

export type ScriptManifest = {
  id: string;
  name: string;
  version: string;
  triggers: ExtensionTrigger[];
  permissions: ExtensionPermission[];
  entry?: string;
  description?: string;
};

const scripts: ScriptManifest[] = [];

export const registerScript = (manifest: ScriptManifest) => {
  const existingIndex = scripts.findIndex((item) => item.id === manifest.id);
  if (existingIndex >= 0) {
    scripts[existingIndex] = manifest;
    return;
  }
  scripts.push(manifest);
};

export const listScripts = () => [...scripts];

export const getScriptsByTrigger = (trigger: ExtensionTrigger) =>
  scripts.filter((script) => script.triggers.includes(trigger));

export const clearScripts = () => {
  scripts.length = 0;
};
