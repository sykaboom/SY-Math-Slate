import { registerRuntimeModPackage as registerRuntimeModPackageFromRegistry } from "./registry/index";

export const registerRuntimeModPackage = registerRuntimeModPackageFromRegistry;
export * from "./registry/index";
