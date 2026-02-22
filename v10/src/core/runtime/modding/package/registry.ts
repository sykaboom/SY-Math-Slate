import type { ModPackageValidationFailure } from "./guards";
import { validateModPackageDefinition } from "./guards";
import type {
  ModPackageDefinition,
  ModPackageId,
  RuntimeModResourceLayerOverrides,
  RuntimeModResourceOverrides,
  ToolbarBaseProvider,
} from "./types";

export type ModPackageRegistryRegisterSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type ModPackageRegistryRegisterFailure =
  | ModPackageValidationFailure
  | {
      ok: false;
      code: "duplicate-pack-id";
      path: "manifest.packId";
      message: string;
      packId: ModPackageId;
    };

export type ModPackageRegistryRegisterResult =
  | ModPackageRegistryRegisterSuccess
  | ModPackageRegistryRegisterFailure;

export type RuntimeModPackageRegistrationEntry = {
  packId: ModPackageId;
  result: ModPackageRegistryRegisterResult;
};

const comparePackIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const compareModPackageDefinitions = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => {
  const defaultEnabledDelta = Number(Boolean(right.defaultEnabled)) - Number(Boolean(left.defaultEnabled));
  if (defaultEnabledDelta !== 0) {
    return defaultEnabledDelta;
  }
  return comparePackIds(left.packId, right.packId);
};

const selectPrimaryModPackage = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition | null => {
  const ordered = [...definitions].sort(compareModPackageDefinitions);
  return ordered[0] ?? null;
};

export class ModPackageRegistry {
  private readonly definitions = new Map<ModPackageId, ModPackageDefinition>();

  register(value: unknown): ModPackageRegistryRegisterResult {
    const validation = validateModPackageDefinition(value);
    if (!validation.ok) {
      return validation;
    }

    const definition = validation.value;
    const { packId } = definition;
    if (this.definitions.has(packId)) {
      return {
        ok: false,
        code: "duplicate-pack-id",
        path: "manifest.packId",
        message: `duplicate mod package id '${packId}'.`,
        packId,
      };
    }

    this.definitions.set(packId, definition);
    return {
      ok: true,
      value: definition,
    };
  }

  get(packId: ModPackageId): ModPackageDefinition | null {
    return this.definitions.get(packId) ?? null;
  }

  resolve(packId: ModPackageId): ModPackageDefinition | null {
    return this.get(packId);
  }

  has(packId: ModPackageId): boolean {
    return this.definitions.has(packId);
  }

  list(): ModPackageDefinition[] {
    return [...this.definitions.values()].sort(compareModPackageDefinitions);
  }

  getPrimary(): ModPackageDefinition | null {
    return selectPrimaryModPackage(this.list());
  }

  size(): number {
    return this.definitions.size;
  }

  clear(): void {
    this.definitions.clear();
  }
}

const compareByPackId = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => comparePackIds(left.packId, right.packId);

let runtimeModPackageRegistrySingleton: ModPackageRegistry | null = null;
let runtimeToolbarBaseProviderSingleton: ToolbarBaseProvider | null = null;
let runtimeModResourceOverridesSingleton: RuntimeModResourceOverrides = {};

const ensureRuntimeModPackageRegistry = (): ModPackageRegistry => {
  if (!runtimeModPackageRegistrySingleton) {
    runtimeModPackageRegistrySingleton = new ModPackageRegistry();
  }
  return runtimeModPackageRegistrySingleton;
};

export const getRuntimeModPackageRegistry = (): ModPackageRegistry =>
  ensureRuntimeModPackageRegistry();

export const registerRuntimeModPackage = (
  value: unknown
): ModPackageRegistryRegisterResult =>
  ensureRuntimeModPackageRegistry().register(value);

export const registerRuntimeModPackages = (
  definitions: readonly ModPackageDefinition[]
): RuntimeModPackageRegistrationEntry[] => {
  const registry = ensureRuntimeModPackageRegistry();
  const orderedDefinitions = [...definitions].sort(compareByPackId);
  return orderedDefinitions.map((definition) => ({
    packId: definition.packId,
    result: registry.register(definition),
  }));
};

export const listRuntimeModPackages = (): ModPackageDefinition[] =>
  ensureRuntimeModPackageRegistry().list();

export const getRuntimeModPackageById = (
  packId: ModPackageId
): ModPackageDefinition | null => ensureRuntimeModPackageRegistry().get(packId);

export const getPrimaryRuntimeModPackage = (): ModPackageDefinition | null =>
  ensureRuntimeModPackageRegistry().getPrimary();

export const clearRuntimeModPackageRegistry = (): void => {
  ensureRuntimeModPackageRegistry().clear();
};

export const resetRuntimeModPackageRegistry = (): void => {
  runtimeModPackageRegistrySingleton = null;
  runtimeToolbarBaseProviderSingleton = null;
  runtimeModResourceOverridesSingleton = {};
};

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
