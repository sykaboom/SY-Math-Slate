import type { ModPackageDefinition, ModPackageId } from "../../../types";
import type { ModPackageRegistryRegisterResult } from "../types";

export const registerDefinition = (
  definitions: Map<ModPackageId, ModPackageDefinition>,
  value: unknown,
  validateDefinition: (value: unknown) => ModPackageRegistryRegisterResult
): ModPackageRegistryRegisterResult => {
  const validation = validateDefinition(value);
  if (!validation.ok) {
    return validation;
  }

  const definition = validation.value;
  const { packId } = definition;
  if (definitions.has(packId)) {
    return {
      ok: false,
      code: "duplicate-pack-id",
      path: "manifest.packId",
      message: `duplicate mod package id '${packId}'.`,
      packId,
    };
  }

  definitions.set(packId, definition);
  return { ok: true, value: definition };
};
