import type {
  RuntimeModResourceLayerOverrides,
  RuntimeModResourceOverrides,
} from "../../types";

export const resolveMergeLayerName = (
  layer: string
): layer is keyof RuntimeModResourceOverrides => layer === "mod" || layer === "user";

export const sanitizeRuntimeLayerOverrides = (
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
