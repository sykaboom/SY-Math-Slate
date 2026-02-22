import type {
  ModPackageCommandRule,
  ModPackageDefinition,
  ModPackageId,
  ModPackageInputBehaviorRule,
  ModPackageJsonObject,
  ModPackageShortcutRule,
  ModPackageUIItemRule,
} from "../types";
import { getRuntimeModResourceLayerOverrides } from "../registry";
import { selectActiveModPackage } from "./packageSelection";

export const selectModPackageToolbarItemRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageUIItemRule[] => definition?.uiPolicy?.toolbarItems ?? [];

export const selectModPackagePanelItemRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageUIItemRule[] => definition?.uiPolicy?.panelItems ?? [];

export const selectModPackageResourcePolicyPatch = (
  definition: ModPackageDefinition | null | undefined
): ModPackageJsonObject | null => definition?.resourcePolicy?.policyPatch ?? null;

export const selectModPackageResourceCommandRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageCommandRule[] => definition?.resourcePolicy?.commands ?? [];

export const selectModPackageResourceShortcutRules = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageShortcutRule[] => definition?.resourcePolicy?.shortcuts ?? [];

export const selectModPackageResourceInputBehaviorRule = (
  definition: ModPackageDefinition | null | undefined
): ModPackageInputBehaviorRule | null =>
  definition?.resourcePolicy?.inputBehavior ?? null;

export const selectActiveModPackageToolbarItemRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageUIItemRule[] =>
  selectModPackageToolbarItemRules(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackagePanelItemRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageUIItemRule[] =>
  selectModPackagePanelItemRules(selectActiveModPackage(definitions, activePackageId));

export const selectActiveModPackageResourcePolicyPatch = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageJsonObject | null =>
  selectModPackageResourcePolicyPatch(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackageResourceCommandRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageCommandRule[] =>
  selectModPackageResourceCommandRules(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackageResourceShortcutRules = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageShortcutRule[] =>
  selectModPackageResourceShortcutRules(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectActiveModPackageResourceInputBehaviorRule = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageInputBehaviorRule | null =>
  selectModPackageResourceInputBehaviorRule(
    selectActiveModPackage(definitions, activePackageId)
  );

export const selectRuntimeModResourceOverridesForLayer = (
  layer: "mod" | "user"
) => getRuntimeModResourceLayerOverrides(layer);
