import type { ToolbarBaseProvider } from "../../types";

let runtimeToolbarBaseProviderSingleton: ToolbarBaseProvider | null = null;

export const registerRuntimeToolbarBaseProvider = (
  provider: ToolbarBaseProvider
): ToolbarBaseProvider => {
  runtimeToolbarBaseProviderSingleton = provider;
  return provider;
};

export const getRuntimeToolbarBaseProvider = (): ToolbarBaseProvider | null =>
  runtimeToolbarBaseProviderSingleton;

export const clearRuntimeToolbarBaseProvider = (): void => {
  runtimeToolbarBaseProviderSingleton = null;
};

export const resetRuntimeToolbarBaseProviderState = (): void => {
  runtimeToolbarBaseProviderSingleton = null;
};
