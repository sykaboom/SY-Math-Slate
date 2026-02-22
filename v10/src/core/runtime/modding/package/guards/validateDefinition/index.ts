import type { ModPackageDefinition } from "../../types";
import type { ModPackageValidationResult } from "../types";
import { parseActivationToolbarModeMap } from "./activation";
import {
  buildValidatedDefinition,
  parseConflicts,
  parseDefaultEnabled,
  parseDependencies,
} from "./dependenciesAndFinalize";
import { parseValidationBase } from "./baseFields";
import { parseResourcePolicy, parseUiPolicy } from "./uiAndResourcePolicy";

export const validateModPackageDefinition = (
  value: unknown
): ModPackageValidationResult => {
  const baseResult = parseValidationBase(value);
  if (!baseResult.ok) {
    return baseResult.value;
  }
  const base = baseResult.value;

  const toolbarModeMapResult = parseActivationToolbarModeMap(
    base.activation,
    base.modIdSet
  );
  if (!toolbarModeMapResult.ok) {
    return toolbarModeMapResult.value;
  }

  const uiPolicyResult = parseUiPolicy(base.manifest.uiPolicy);
  if (!uiPolicyResult.ok) {
    return uiPolicyResult.value;
  }

  const resourcePolicyResult = parseResourcePolicy(
    base.manifest.resourcePolicy,
    base.modIdSet
  );
  if (!resourcePolicyResult.ok) {
    return resourcePolicyResult.value;
  }

  let dependencies: typeof base.modIds | undefined = undefined;
  if (base.manifest.dependencies !== undefined) {
    const dependenciesResult = parseDependencies(base.manifest.dependencies);
    if (!dependenciesResult.ok) {
      return dependenciesResult.value;
    }
    dependencies = dependenciesResult.value;
  }

  let conflicts: typeof base.modIds | undefined = undefined;
  if (base.manifest.conflicts !== undefined) {
    const conflictsResult = parseConflicts(base.manifest.conflicts);
    if (!conflictsResult.ok) {
      return conflictsResult.value;
    }
    conflicts = conflictsResult.value;
  }

  const defaultEnabledResult = parseDefaultEnabled(base.manifest.defaultEnabled);
  if (!defaultEnabledResult.ok) {
    return defaultEnabledResult.value;
  }

  return {
    ok: true,
    value: buildValidatedDefinition({
      packId: base.packId,
      version: base.version,
      label: base.label,
      modIds: base.modIds,
      defaultModId: base.defaultModId,
      toolbarModeMap: toolbarModeMapResult.value,
      uiPolicy: uiPolicyResult.value,
      resourcePolicy: resourcePolicyResult.value,
      dependencies,
      conflicts,
      defaultEnabled: defaultEnabledResult.value,
    }),
  };
};

export const isModPackageDefinition = (
  value: unknown
): value is ModPackageDefinition => validateModPackageDefinition(value).ok;
