import type {
  ModPackageCommandRule,
  ModPackageDefinition,
  ModPackageId,
  ModPackageInputBehaviorRule,
  ModPackageJsonObject,
  ModPackageShortcutRule,
  ModPackageUIItemRule,
} from "../../../../../../types";
import {
  selectModPackagePanelItemRulesImpl,
  selectModPackageResourceCommandRulesImpl,
  selectModPackageResourceInputBehaviorRuleImpl,
  selectModPackageResourcePolicyPatchImpl,
  selectModPackageResourceShortcutRulesImpl,
  selectModPackageToolbarItemRulesImpl,
} from "../../../../direct";
import { withActiveDefinition } from "../withActiveDefinition";

export const selectActiveModPackageToolbarItemRulesImpl = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageUIItemRule[] =>
  withActiveDefinition(definitions, activePackageId, selectModPackageToolbarItemRulesImpl);

export const selectActiveModPackagePanelItemRulesImpl = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageUIItemRule[] =>
  withActiveDefinition(definitions, activePackageId, selectModPackagePanelItemRulesImpl);

export const selectActiveModPackageResourcePolicyPatchImpl = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageJsonObject | null =>
  withActiveDefinition(definitions, activePackageId, selectModPackageResourcePolicyPatchImpl);

export const selectActiveModPackageResourceCommandRulesImpl = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageCommandRule[] =>
  withActiveDefinition(definitions, activePackageId, selectModPackageResourceCommandRulesImpl);

export const selectActiveModPackageResourceShortcutRulesImpl = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): readonly ModPackageShortcutRule[] =>
  withActiveDefinition(definitions, activePackageId, selectModPackageResourceShortcutRulesImpl);

export const selectActiveModPackageResourceInputBehaviorRuleImpl = (
  definitions: readonly ModPackageDefinition[],
  activePackageId: ModPackageId | null | undefined
): ModPackageInputBehaviorRule | null =>
  withActiveDefinition(
    definitions,
    activePackageId,
    selectModPackageResourceInputBehaviorRuleImpl
  );
