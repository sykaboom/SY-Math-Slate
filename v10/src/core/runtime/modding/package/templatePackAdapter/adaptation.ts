import {
  type ModPackageValidationFailure,
  validateModPackageDefinition,
} from "../guards";
import type { ModPackageDefinition } from "../types";
import type { TemplatePackAdapterManifest } from "../templatePackAdapter.types";
import {
  selectTemplatePackToolbarDefinition,
  type TemplatePackToolbarDefinition,
} from "./toolbarDefinition";

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

export const buildTemplatePackRuntimeModId = (packId: string): string =>
  `${RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX}.${packId}`;

export const adaptTemplatePackManifestToModPackageDefinition = (
  manifest: TemplatePackAdapterManifest
): ModPackageDefinition => {
  const runtimeModId = buildTemplatePackRuntimeModId(manifest.packId);
  const toolbarDefinition = selectTemplatePackToolbarDefinition(manifest);
  const toolbarModeMapEntries = toolbarDefinition
    ? toolbarDefinition.modeDefinitions.map((definition) =>
        [definition.id, definition.fallbackModId] as const
      )
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
      ...(activationToolbarModeMap ? { toolbarModeMap: activationToolbarModeMap } : {}),
      defaultModId: runtimeModId,
    },
    defaultEnabled: manifest.defaultEnabled,
  };
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

export type { TemplatePackToolbarDefinition };
