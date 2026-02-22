import type {
  RuntimeModResourceLayerOverrides,
  RuntimeModResourceOverrides,
} from "../../types";
import { resolveMergeLayerName, sanitizeRuntimeLayerOverrides } from "./layer";

let runtimeModResourceOverridesSingleton: RuntimeModResourceOverrides = {};

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
