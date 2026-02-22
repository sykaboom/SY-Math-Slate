import type {
  ModResourceMergeDiagnostic,
  ResolvedToolbarPlan,
  ResolvedToolbarPlanCanvasActions,
  ResolvedToolbarPlanDrawActions,
  ResolvedToolbarPlanInput,
  ResolvedToolbarPlanMode,
  ResolvedToolbarPlanMorePanelSections,
  ResolvedToolbarPlanPlaybackActions,
  ToolbarBaseActionSurface,
  ToolbarBaseActionSurfaceRule,
} from "@core/runtime/modding/package";
import {
  mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder,
  resolveToolbarPlanFromActionSurfaceRules,
  selectToolbarBaseActionSurfaceRules,
} from "@core/runtime/modding/package";
import { getPrimaryRuntimeTemplatePack } from "@/mod/bridge/packRegistryBridge";
import { BASE_EDUCATION_TEMPLATE_PACK } from "@/mod/packs/base-education/manifest";
import type { ToolbarActionId } from "./toolbarActionCatalog";
import type { ToolbarViewportProfile } from "./toolbarViewportProfile";

export type ToolbarSurface = ToolbarBaseActionSurface;
type ToolbarMode = ResolvedToolbarPlanMode;
type ToolbarSurfaceRule = ToolbarBaseActionSurfaceRule;

export const TOOLBAR_BASE_ACTION_SURFACE_RULES: readonly ToolbarSurfaceRule[] =
  BASE_EDUCATION_TEMPLATE_PACK.actionSurfaceRules;

const resolveBaseToolbarSurfaceRules = (): readonly ToolbarSurfaceRule[] => {
  const providerRules = selectToolbarBaseActionSurfaceRules();
  return providerRules.length > 0
    ? providerRules
    : TOOLBAR_BASE_ACTION_SURFACE_RULES;
};

type ToolbarSurfaceMergeResult = {
  map: Map<string, ToolbarSurface>;
  diagnostics: ModResourceMergeDiagnostic[];
};

export const buildPolicyMerge = (): ToolbarSurfaceMergeResult => {
  const baseRules = resolveBaseToolbarSurfaceRules();
  const packageRules = getPrimaryRuntimeTemplatePack()?.actionSurfaceRules ?? [];
  const merged = mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder(
    baseRules,
    packageRules
  );
  return {
    map: merged.map,
    diagnostics: merged.diagnostics,
  };
};

const buildPolicyMap = (): Map<string, ToolbarSurface> => {
  const { map } = buildPolicyMerge();
  return map;
};

const resolveSurfaceFromMap = (
  map: Map<string, ToolbarSurface>,
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile,
  actionId: string
): ToolbarSurface => {
  return map.get(`${mode}:${viewport}:${actionId}`) ?? "hidden";
};

export const resolveToolbarActionSurface = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile,
  actionId: ToolbarActionId | string
): ToolbarSurface => {
  const map = buildPolicyMap();
  return resolveSurfaceFromMap(map, mode, viewport, actionId);
};

const resolveToolbarPlanFromCurrentRules = ({
  mode,
  viewport,
  cutoverEnabled,
}: ResolvedToolbarPlanInput): ResolvedToolbarPlan =>
  resolveToolbarPlanFromActionSurfaceRules(
    { mode, viewport, cutoverEnabled },
    resolveBaseToolbarSurfaceRules(),
    getPrimaryRuntimeTemplatePack()?.actionSurfaceRules ?? []
  );

export type DrawToolbarSurfacePolicy = ResolvedToolbarPlanDrawActions;

export const resolveDrawToolbarSurfacePolicy = (
  viewport: ToolbarViewportProfile,
  cutoverEnabled: boolean
): DrawToolbarSurfacePolicy =>
  resolveToolbarPlanFromCurrentRules({
    mode: "draw",
    viewport,
    cutoverEnabled,
  }).draw;

export type PlaybackToolbarSurfacePolicy = ResolvedToolbarPlanPlaybackActions;

export const resolvePlaybackToolbarSurfacePolicy = (
  viewport: ToolbarViewportProfile,
  cutoverEnabled: boolean
): PlaybackToolbarSurfacePolicy =>
  resolveToolbarPlanFromCurrentRules({
    mode: "playback",
    viewport,
    cutoverEnabled,
  }).playback;

export type CanvasToolbarSurfacePolicy = ResolvedToolbarPlanCanvasActions;

export const resolveCanvasToolbarSurfacePolicy = (
  viewport: ToolbarViewportProfile
): CanvasToolbarSurfacePolicy =>
  resolveToolbarPlanFromCurrentRules({
    mode: "canvas",
    viewport,
    cutoverEnabled: true,
  }).canvas;

export type MorePanelSurfacePolicy = ResolvedToolbarPlanMorePanelSections;

export const resolveMorePanelSurfacePolicy = (
  mode: ToolbarMode,
  viewport: ToolbarViewportProfile
): MorePanelSurfacePolicy =>
  resolveToolbarPlanFromCurrentRules({
    mode,
    viewport,
    cutoverEnabled: true,
  }).morePanel;

export const resolveToolbarPlanFromBaseSurfacePolicy = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan => resolveToolbarPlanFromCurrentRules(input);
