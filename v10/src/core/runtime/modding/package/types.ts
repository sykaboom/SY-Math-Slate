import type { ModId } from "@core/runtime/modding/api";

export const MOD_PACKAGE_TOOLBAR_MODES = [
  "draw",
  "playback",
  "canvas",
] as const;

export type ModPackageToolbarMode =
  (typeof MOD_PACKAGE_TOOLBAR_MODES)[number];

export type ModPackageId = string;

export const MOD_PACKAGE_ALIAS_FALLBACK_SOURCES = [
  "legacy.toolbar-mode-to-mod-id",
  "legacy.mod-id-to-toolbar-mode",
] as const;

export type ModPackageAliasFallbackSource =
  (typeof MOD_PACKAGE_ALIAS_FALLBACK_SOURCES)[number];

export type ModPackageResolutionSource =
  | "package-map"
  | "legacy-alias-fallback"
  | "none";

export type ModPackageActivationModIdResolution = {
  modId: ModId | null;
  source: ModPackageResolutionSource;
  aliasFallbackSource: ModPackageAliasFallbackSource | null;
};

export type ModPackageToolbarModeResolution = {
  toolbarMode: ModPackageToolbarMode | null;
  source: ModPackageResolutionSource;
  aliasFallbackSource: ModPackageAliasFallbackSource | null;
};

export const MOD_RESOURCE_LAYER_LOAD_ORDER = [
  "base",
  "package",
  "mod",
  "user",
] as const;

export type ModResourceLayer = (typeof MOD_RESOURCE_LAYER_LOAD_ORDER)[number];

export type ModPackageJsonPrimitive = string | number | boolean | null;
export type ModPackageJsonValue =
  | ModPackageJsonPrimitive
  | ModPackageJsonValue[]
  | ModPackageJsonObject;
export type ModPackageJsonObject = {
  [key: string]: ModPackageJsonValue;
};

export type ModPackageActivationPolicy = {
  toolbarModeMap?: Partial<Record<ModPackageToolbarMode, ModId>>;
  defaultModId: ModId;
};

export type ModPackageUIItemOperation = "add" | "override" | "remove";

export type ModPackageUIItemRule = {
  slotId: string;
  itemId: string;
  operation?: ModPackageUIItemOperation;
  commandId?: string;
  label?: string;
  icon?: string;
  title?: string;
  group?: string;
  when?: string;
  order?: number;
  defaultOpen?: boolean;
};

export type ModPackageUIPolicy = {
  allowToolbarContributionGroups?: readonly string[];
  allowPanelSlots?: readonly string[];
  toolbarItems?: readonly ModPackageUIItemRule[];
  panelItems?: readonly ModPackageUIItemRule[];
};

export type ModPackageCommandOperation = "upsert" | "remove";

export type ModPackageCommandRule = {
  commandId: string;
  operation?: ModPackageCommandOperation;
  overrideAllowed?: boolean;
};

export type ModPackageShortcutOperation = "upsert" | "remove";

export type ModPackageShortcutRule = {
  shortcut: string;
  commandId: string;
  when?: string;
  operation?: ModPackageShortcutOperation;
};

export type ModPackageInputBehaviorStrategy = "exclusive" | "handled-pass-chain";

export type ModPackageInputBehaviorRule = {
  strategy: ModPackageInputBehaviorStrategy;
  modId?: ModId;
  chain?: readonly ModId[];
};

export type ModPackageResourcePolicy = {
  policyPatch?: ModPackageJsonObject;
  commands?: readonly ModPackageCommandRule[];
  shortcuts?: readonly ModPackageShortcutRule[];
  inputBehavior?: ModPackageInputBehaviorRule;
};

export type ModPackageDefinition = {
  packId: ModPackageId;
  version: string;
  label: string;
  modIds: readonly ModId[];
  activation: ModPackageActivationPolicy;
  uiPolicy?: ModPackageUIPolicy;
  resourcePolicy?: ModPackageResourcePolicy;
  dependencies?: readonly ModPackageId[];
  conflicts?: readonly ModPackageId[];
  defaultEnabled?: boolean;
};

export type ModResourceMergeDiagnosticKind = "winner" | "loser" | "blocked";

export type ModResourceMergeDiagnosticResourceType =
  | "policy"
  | "ui-item"
  | "command"
  | "shortcut"
  | "input-behavior";

export type ModResourceMergeDiagnostic = {
  kind: ModResourceMergeDiagnosticKind;
  resourceType: ModResourceMergeDiagnosticResourceType;
  key: string;
  source: ModResourceLayer;
  againstSource?: ModResourceLayer;
  reason: string;
};

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
