import type {
  RuntimeModResourceLayerOverrides,
  RuntimeModResourceOverrides,
} from "../types";

let runtimeModResourceOverridesSingleton: RuntimeModResourceOverrides = {};

const resolveMergeLayerName = (
  layer: string
): layer is keyof RuntimeModResourceOverrides => layer === "mod" || layer === "user";

const sanitizeRuntimeLayerOverrides = (
  value: RuntimeModResourceLayerOverrides
): RuntimeModResourceLayerOverrides => {
  const sanitized: RuntimeModResourceLayerOverrides = {};
  if (value.policyPatch) sanitized.policyPatch = value.policyPatch;
  if (value.toolbarItems) sanitized.toolbarItems = [...value.toolbarItems];
  if (value.panelItems) sanitized.panelItems = [...value.panelItems];
  if (value.commands) sanitized.commands = [...value.commands];
  if (value.shortcuts) sanitized.shortcuts = [...value.shortcuts];
  if (value.inputBehavior) {
    sanitized.inputBehavior = {
      ...value.inputBehavior,
      ...(value.inputBehavior.chain
        ? { chain: [...value.inputBehavior.chain] }
        : {}),
    };
  }
  if (value.toolbarSurfaceRules) {
    sanitized.toolbarSurfaceRules = [...value.toolbarSurfaceRules];
  }
  return sanitized;
};

export const registerRuntimeModResourceOverrides = (
  value: RuntimeModResourceOverrides
): RuntimeModResourceOverrides => {
  const next: RuntimeModResourceOverrides = {};
  for (const [layer, overrides] of Object.entries(value)) {
    if (!resolveMergeLayerName(layer)) continue;
    if (!overrides) continue;
    next[layer] = sanitizeRuntimeLayerOverrides(overrides);
  }
  runtimeModResourceOverridesSingleton = next;
  return runtimeModResourceOverridesSingleton;
};

export const setRuntimeModResourceLayerOverrides = (
  layer: "mod" | "user",
  overrides: RuntimeModResourceLayerOverrides | null
): RuntimeModResourceLayerOverrides | null => {
  if (overrides === null) {
    delete runtimeModResourceOverridesSingleton[layer];
    return null;
  }
  const sanitized = sanitizeRuntimeLayerOverrides(overrides);
  runtimeModResourceOverridesSingleton = {
    ...runtimeModResourceOverridesSingleton,
    [layer]: sanitized,
  };
  return sanitized;
};

export const getRuntimeModResourceOverrides = (): RuntimeModResourceOverrides => ({
  ...runtimeModResourceOverridesSingleton,
});

export const getRuntimeModResourceLayerOverrides = (
  layer: "mod" | "user"
): RuntimeModResourceLayerOverrides | null =>
  runtimeModResourceOverridesSingleton[layer] ?? null;

export const clearRuntimeModResourceOverrides = (): void => {
  runtimeModResourceOverridesSingleton = {};
};

export const resetRuntimeModResourceOverridesState = (): void => {
  runtimeModResourceOverridesSingleton = {};
};
