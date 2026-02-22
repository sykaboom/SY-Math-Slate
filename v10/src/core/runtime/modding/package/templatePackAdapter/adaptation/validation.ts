import { validateModPackageDefinition } from "../../guards";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";
import type { TemplatePackAdapterValidationResult } from "./types";
import { adaptTemplatePackManifestToModPackageDefinition } from "./definition";

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
