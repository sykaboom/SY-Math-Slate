import { resetRuntimeModResourceOverridesState } from "./resourceOverrides";
export {
  clearRuntimeModPackageRegistry,
  getPrimaryRuntimeModPackage,
  getRuntimeModPackageById,
  getRuntimeModPackageRegistry,
  listRuntimeModPackages,
  registerRuntimeModPackage,
  registerRuntimeModPackages,
} from "./runtimeRegistryState/registrySingleton";
export {
  clearRuntimeToolbarBaseProvider,
  getRuntimeToolbarBaseProvider,
  registerRuntimeToolbarBaseProvider,
} from "./runtimeRegistryState/toolbarProvider";
import {
  resetRuntimeModPackageRegistryState,
} from "./runtimeRegistryState/registrySingleton";
import { resetRuntimeToolbarBaseProviderState } from "./runtimeRegistryState/toolbarProvider";

export const resetRuntimeModPackageRegistry = (): void => {
  resetRuntimeModPackageRegistryState();
  resetRuntimeToolbarBaseProviderState();
  resetRuntimeModResourceOverridesState();
};
