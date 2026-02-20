import {
  isTemplatePackManifest,
  validateTemplatePackManifest,
  type TemplatePackValidationResult,
} from "../templates/_contracts/templatePack.guards";
import type { TemplatePackManifest } from "../templates/_contracts/templatePack.types";
import { listDefaultEnabledTemplatePacks } from "../templates";

const runtimeTemplatePackRegistry = new Map<string, TemplatePackManifest>();

let hasBootstrappedDefaultPacks = false;

const bootstrapDefaultTemplatePacks = (): void => {
  if (hasBootstrappedDefaultPacks) return;
  for (const pack of listDefaultEnabledTemplatePacks()) {
    runtimeTemplatePackRegistry.set(pack.packId, pack);
  }
  hasBootstrappedDefaultPacks = true;
};

export const registerRuntimeTemplatePack = (
  value: unknown
): TemplatePackValidationResult & { replaced?: boolean } => {
  const validation = validateTemplatePackManifest(value);
  if (!validation.ok) return validation;
  const replaced = runtimeTemplatePackRegistry.has(validation.value.packId);
  runtimeTemplatePackRegistry.set(validation.value.packId, validation.value);
  return { ...validation, replaced };
};

export const listRuntimeTemplatePacks = (): readonly TemplatePackManifest[] => {
  bootstrapDefaultTemplatePacks();
  return [...runtimeTemplatePackRegistry.values()];
};

export const getRuntimeTemplatePackById = (
  packId: string
): TemplatePackManifest | null => {
  bootstrapDefaultTemplatePacks();
  return runtimeTemplatePackRegistry.get(packId) ?? null;
};

export const getPrimaryRuntimeTemplatePack = (): TemplatePackManifest | null => {
  const packs = listRuntimeTemplatePacks();
  if (packs.length === 0) return null;
  const firstDefaultPack = packs.find((pack) => pack.defaultEnabled !== false);
  return firstDefaultPack ?? packs[0] ?? null;
};

export const clearRuntimeTemplatePackRegistry = (): void => {
  runtimeTemplatePackRegistry.clear();
  hasBootstrappedDefaultPacks = false;
};

export const isRuntimeTemplatePackManifest = (
  value: unknown
): value is TemplatePackManifest => isTemplatePackManifest(value);

