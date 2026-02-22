import type { ModPackageJsonObject } from "../json";
import type { ModResourceLayer } from "../loadOrder";
import type {
  ModPackageCommandRule,
  ModPackageInputBehaviorRule,
  ModPackageShortcutRule,
} from "../resourcePolicy";
import type { ModPackageUIItemRule } from "../uiPolicy";
import type {
  ToolbarBaseActionCatalogEntry,
  ToolbarBaseActionSurfaceRule,
  ToolbarBaseModeDefinition,
} from "./baseCatalog";
import type { ResolvedToolbarPlan, ResolvedToolbarPlanInput } from "./resolvedPlan";

export type RuntimeModResourceLayerOverrides = {
  policyPatch?: ModPackageJsonObject;
  toolbarItems?: readonly ModPackageUIItemRule[];
  panelItems?: readonly ModPackageUIItemRule[];
  commands?: readonly ModPackageCommandRule[];
  shortcuts?: readonly ModPackageShortcutRule[];
  inputBehavior?: ModPackageInputBehaviorRule;
  toolbarSurfaceRules?: readonly ToolbarBaseActionSurfaceRule[];
};

export type RuntimeModResourceOverrides = Partial<
  Record<Extract<ModResourceLayer, "mod" | "user">, RuntimeModResourceLayerOverrides>
>;

export type ToolbarBaseProvider = {
  modeDefinitions: readonly ToolbarBaseModeDefinition[];
  actionCatalog: readonly ToolbarBaseActionCatalogEntry[];
  actionSurfaceRules: readonly ToolbarBaseActionSurfaceRule[];
  resolvePlan: (input: ResolvedToolbarPlanInput) => ResolvedToolbarPlan;
};
