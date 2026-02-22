import {
  type ModPackageValidationFailure,
  validateModPackageDefinition,
} from "./guards";
import {
  listModPackagesDeterministically,
  selectModPackageById,
  selectPrimaryModPackage,
} from "./selectors";
import {
  MOD_PACKAGE_TOOLBAR_MODES,
  type ModPackageDefinition,
  type ModPackageId,
  type ToolbarBaseActionCatalogEntry,
  type ToolbarBaseActionSurfaceRule,
  type ToolbarBaseModeDefinition,
} from "./types";
import type { TemplatePackAdapterManifest } from "./templatePackAdapter.types";

export type TemplatePackAdapterValidationFailure = {
  ok: false;
  code: "invalid-adapted-package";
  path: string;
  message: string;
  cause: ModPackageValidationFailure["code"];
};

export type TemplatePackAdapterValidationSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type TemplatePackAdapterValidationResult =
  | TemplatePackAdapterValidationFailure
  | TemplatePackAdapterValidationSuccess;

const RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX = "template-pack.runtime";
const TOOLBAR_VIEWPORT_PROFILES = ["desktop", "tablet", "mobile"] as const;
const TOOLBAR_ACTION_SURFACES = ["primary", "more", "hidden"] as const;

export type TemplatePackToolbarDefinition = {
  modeDefinitions: readonly ToolbarBaseModeDefinition[];
  actionCatalog: readonly ToolbarBaseActionCatalogEntry[];
  actionSurfaceRules: readonly ToolbarBaseActionSurfaceRule[];
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const isToolbarMode = (
  value: unknown
): value is ToolbarBaseModeDefinition["id"] =>
  typeof value === "string" &&
  MOD_PACKAGE_TOOLBAR_MODES.includes(value as ToolbarBaseModeDefinition["id"]);

const isToolbarViewportProfile = (
  value: unknown
): value is ToolbarBaseActionSurfaceRule["viewport"] =>
  typeof value === "string" &&
  TOOLBAR_VIEWPORT_PROFILES.includes(
    value as ToolbarBaseActionSurfaceRule["viewport"]
  );

const isToolbarActionSurface = (
  value: unknown
): value is ToolbarBaseActionSurfaceRule["surface"] =>
  typeof value === "string" &&
  TOOLBAR_ACTION_SURFACES.includes(value as ToolbarBaseActionSurfaceRule["surface"]);

const parseToolbarModeDefinitions = (
  value: unknown
): readonly ToolbarBaseModeDefinition[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;
  const parsed: ToolbarBaseModeDefinition[] = [];
  const seenModeIds = new Set<string>();
  for (const entry of value) {
    if (!isPlainRecord(entry)) return null;
    if (!isToolbarMode(entry.id)) return null;
    if (seenModeIds.has(entry.id)) return null;
    const label = normalizeNonEmptyString(entry.label);
    const fallbackModId = normalizeNonEmptyString(entry.fallbackModId);
    if (!label || !fallbackModId) return null;
    seenModeIds.add(entry.id);
    parsed.push({
      id: entry.id,
      label,
      fallbackModId,
    });
  }
  return Object.freeze(parsed);
};

const parseToolbarActionCatalog = (
  value: unknown,
  modeIds: ReadonlySet<string>
): readonly ToolbarBaseActionCatalogEntry[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;
  const parsed: ToolbarBaseActionCatalogEntry[] = [];
  const seenActionIds = new Set<string>();
  for (const entry of value) {
    if (!isPlainRecord(entry)) return null;
    const id = normalizeNonEmptyString(entry.id);
    const label = normalizeNonEmptyString(entry.label);
    if (!id || !label || !Array.isArray(entry.modes) || entry.modes.length === 0) {
      return null;
    }
    if (seenActionIds.has(id)) return null;
    const modes: ToolbarBaseModeDefinition["id"][] = [];
    const seenModes = new Set<string>();
    for (const mode of entry.modes) {
      if (!isToolbarMode(mode)) return null;
      if (!modeIds.has(mode)) return null;
      if (seenModes.has(mode)) continue;
      seenModes.add(mode);
      modes.push(mode);
    }
    if (modes.length === 0) return null;
    seenActionIds.add(id);
    parsed.push({
      id,
      label,
      modes: Object.freeze([...modes]),
    });
  }
  return Object.freeze(parsed);
};

const parseToolbarActionSurfaceRules = (
  value: unknown,
  modeIds: ReadonlySet<string>
): readonly ToolbarBaseActionSurfaceRule[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;
  const parsed: ToolbarBaseActionSurfaceRule[] = [];
  for (const entry of value) {
    if (!isPlainRecord(entry)) return null;
    if (!isToolbarMode(entry.mode) || !modeIds.has(entry.mode)) return null;
    if (!isToolbarViewportProfile(entry.viewport)) return null;
    const actionId = normalizeNonEmptyString(entry.actionId);
    if (!actionId || !isToolbarActionSurface(entry.surface)) return null;
    parsed.push({
      mode: entry.mode,
      viewport: entry.viewport,
      actionId,
      surface: entry.surface,
    });
  }
  return Object.freeze(parsed);
};

export const buildTemplatePackRuntimeModId = (packId: string): string =>
  `${RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX}.${packId}`;

export const adaptTemplatePackManifestToModPackageDefinition = (
  manifest: TemplatePackAdapterManifest
): ModPackageDefinition => {
  const runtimeModId = buildTemplatePackRuntimeModId(manifest.packId);
  const toolbarDefinition = selectTemplatePackToolbarDefinition(manifest);
  const toolbarModeMapEntries = toolbarDefinition
    ? toolbarDefinition.modeDefinitions.map((definition) => [
        definition.id,
        definition.fallbackModId,
      ] as const)
    : [];
  const activationToolbarModeMap =
    toolbarModeMapEntries.length > 0
      ? Object.fromEntries(toolbarModeMapEntries)
      : undefined;
  const modIds =
    toolbarModeMapEntries.length > 0
      ? Array.from(
          new Set([runtimeModId, ...toolbarModeMapEntries.map(([, modId]) => modId)])
        )
      : [runtimeModId];
  return {
    packId: manifest.packId,
    version: `template-pack-manifest-v${manifest.manifestVersion}`,
    label: manifest.title,
    modIds,
    activation: {
      ...(activationToolbarModeMap
        ? { toolbarModeMap: activationToolbarModeMap }
        : {}),
      defaultModId: runtimeModId,
    },
    defaultEnabled: manifest.defaultEnabled,
  };
};

export const selectTemplatePackToolbarDefinition = (
  manifest: TemplatePackAdapterManifest
): TemplatePackToolbarDefinition | null => {
  const toolbarValue = manifest.toolbar;
  if (!isPlainRecord(toolbarValue)) return null;

  const modeDefinitions = parseToolbarModeDefinitions(toolbarValue.modeDefinitions);
  if (!modeDefinitions) return null;
  const modeIds = new Set(modeDefinitions.map((definition) => definition.id));

  const actionCatalog = parseToolbarActionCatalog(
    toolbarValue.actionCatalog,
    modeIds
  );
  if (!actionCatalog) return null;

  const actionSurfaceRules = parseToolbarActionSurfaceRules(
    toolbarValue.actionSurfaceRules,
    modeIds
  );
  if (!actionSurfaceRules) return null;

  return Object.freeze({
    modeDefinitions,
    actionCatalog,
    actionSurfaceRules,
  });
};

export const validateTemplatePackAdapterManifest = (
  manifest: TemplatePackAdapterManifest
): TemplatePackAdapterValidationResult => {
  const definition = adaptTemplatePackManifestToModPackageDefinition(manifest);
  const validation = validateModPackageDefinition(definition);
  if (!validation.ok) {
    return {
      ok: false,
      code: "invalid-adapted-package",
      path: validation.path,
      message: validation.message,
      cause: validation.code,
    };
  }
  return {
    ok: true,
    value: validation.value,
  };
};

export const listTemplatePackManifestsFromModPackages = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>
): TemplatePackAdapterManifest[] => {
  const orderedDefinitions = listModPackagesDeterministically(definitions);
  const manifests: TemplatePackAdapterManifest[] = [];
  for (const definition of orderedDefinitions) {
    const manifest = manifestsByPackId.get(definition.packId);
    if (!manifest) continue;
    manifests.push(manifest);
  }
  return manifests;
};

export const listTemplatePackManifestsFromModPackagesTyped = <
  TManifest extends TemplatePackAdapterManifest
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest[] => {
  const orderedDefinitions = listModPackagesDeterministically(definitions);
  const manifests: TManifest[] = [];
  for (const definition of orderedDefinitions) {
    const manifest = manifestsByPackId.get(definition.packId);
    if (!manifest) continue;
    manifests.push(manifest);
  }
  return manifests;
};

export const selectTemplatePackManifestByModPackageId = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>,
  packId: ModPackageId | null | undefined
): TemplatePackAdapterManifest | null => {
  const definition = selectModPackageById(definitions, packId);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectTemplatePackManifestByModPackageIdTyped = <
  TManifest extends TemplatePackAdapterManifest
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>,
  packId: ModPackageId | null | undefined
): TManifest | null => {
  const definition = selectModPackageById(definitions, packId);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectPrimaryTemplatePackManifestFromModPackages = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>
): TemplatePackAdapterManifest | null => {
  const definition = selectPrimaryModPackage(definitions);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectPrimaryTemplatePackManifestFromModPackagesTyped = <
  TManifest extends TemplatePackAdapterManifest
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest | null => {
  const definition = selectPrimaryModPackage(definitions);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};
