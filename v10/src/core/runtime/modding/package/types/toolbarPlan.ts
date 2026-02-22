import type { ModId } from "@core/runtime/modding/api";

import type { ModPackageJsonObject } from "./json";
import type { ModResourceLayer } from "./loadOrder";
import type {
  ModPackageCommandRule,
  ModPackageInputBehaviorRule,
  ModPackageShortcutRule,
} from "./resourcePolicy";
import type { ModPackageToolbarMode } from "./modes";
import type { ModPackageUIItemRule } from "./uiPolicy";

export type ResolvedToolbarPlanMode = ModPackageToolbarMode;

export type ResolvedToolbarViewportProfile = "desktop" | "tablet" | "mobile";

export type ResolvedToolbarPlanDrawActions = {
  hand: boolean;
  pen: boolean;
  eraser: boolean;
  laser: boolean;
  text: boolean;
  image: boolean;
  clipboard: boolean;
  undoRedo: boolean;
  breakActions: boolean;
};

export type ResolvedToolbarPlanPlaybackActions = {
  step: boolean;
  undoRedo: boolean;
  sound: boolean;
  extras: boolean;
};

export type ResolvedToolbarPlanCanvasActions = {
  fullscreen: boolean;
  sound: boolean;
};

export type ResolvedToolbarPlanMorePanelSections = {
  step: boolean;
  history: boolean;
};

export type ResolvedToolbarPlan = {
  mode: ResolvedToolbarPlanMode;
  viewport: ResolvedToolbarViewportProfile;
  cutoverEnabled: boolean;
  draw: ResolvedToolbarPlanDrawActions;
  playback: ResolvedToolbarPlanPlaybackActions;
  canvas: ResolvedToolbarPlanCanvasActions;
  morePanel: ResolvedToolbarPlanMorePanelSections;
};

export type ResolvedToolbarPlanInput = {
  mode: ResolvedToolbarPlanMode;
  viewport: ResolvedToolbarViewportProfile;
  cutoverEnabled: boolean;
};

export type ToolbarBaseModeDefinition = {
  id: ResolvedToolbarPlanMode;
  label: string;
  fallbackModId: ModId;
};

export type ToolbarBaseActionCatalogEntry = {
  id: string;
  label: string;
  modes: readonly ResolvedToolbarPlanMode[];
};

export type ToolbarBaseActionSurface = "primary" | "more" | "hidden";

export type ToolbarBaseActionSurfaceRule = {
  mode: ResolvedToolbarPlanMode;
  viewport: ResolvedToolbarViewportProfile;
  actionId: string;
  surface: ToolbarBaseActionSurface;
};

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
