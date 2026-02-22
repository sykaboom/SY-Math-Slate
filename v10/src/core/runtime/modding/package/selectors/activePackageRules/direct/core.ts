import type {
  ModPackageCommandRule,
  ModPackageDefinition,
  ModPackageInputBehaviorRule,
  ModPackageJsonObject,
  ModPackageShortcutRule,
  ModPackageUIItemRule,
} from "../../../types";

export const selectModPackageToolbarItemRulesImpl = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageUIItemRule[] => definition?.uiPolicy?.toolbarItems ?? [];

export const selectModPackagePanelItemRulesImpl = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageUIItemRule[] => definition?.uiPolicy?.panelItems ?? [];

export const selectModPackageResourcePolicyPatchImpl = (
  definition: ModPackageDefinition | null | undefined
): ModPackageJsonObject | null => definition?.resourcePolicy?.policyPatch ?? null;

export const selectModPackageResourceCommandRulesImpl = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageCommandRule[] => definition?.resourcePolicy?.commands ?? [];

export const selectModPackageResourceShortcutRulesImpl = (
  definition: ModPackageDefinition | null | undefined
): readonly ModPackageShortcutRule[] => definition?.resourcePolicy?.shortcuts ?? [];

export const selectModPackageResourceInputBehaviorRuleImpl = (
  definition: ModPackageDefinition | null | undefined
): ModPackageInputBehaviorRule | null =>
  definition?.resourcePolicy?.inputBehavior ?? null;
