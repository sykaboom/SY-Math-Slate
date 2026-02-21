import {
  CORE_PANEL_POLICY_IDS,
  type CorePanelPolicyId,
} from "./panel-policy";

export type CoreEngineSurfaceId =
  | "engine.toolbar.mode-selector-shell"
  | "engine.command.dispatch-shell"
  | "engine.policy.role-gate-bridge"
  | "engine.window-host.mount-bridge";

export const CORE_ENGINE_SURFACE_ALLOWLIST: readonly CoreEngineSurfaceId[] = [
  "engine.toolbar.mode-selector-shell",
  "engine.command.dispatch-shell",
  "engine.policy.role-gate-bridge",
  "engine.window-host.mount-bridge",
] as const;

export type RuntimeSurfaceClass = "core-engine" | "mod-managed";

export type RuntimeSurfaceId =
  | `panel:${CorePanelPolicyId}`
  | `template:${string}`
  | `engine:${CoreEngineSurfaceId}`;

const CORE_ENGINE_PANEL_IDS = new Set<CorePanelPolicyId>([
  CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR,
]);

export const classifyPanelSurface = (
  panelId: CorePanelPolicyId
): RuntimeSurfaceClass =>
  CORE_ENGINE_PANEL_IDS.has(panelId) ? "core-engine" : "mod-managed";

export const classifyTemplateSurface = (
  templateId: string
): RuntimeSurfaceClass =>
  templateId.startsWith("core.template.") ? "mod-managed" : "core-engine";

export const classifyRuntimeSurface = (
  surfaceId: RuntimeSurfaceId
): RuntimeSurfaceClass => {
  if (surfaceId.startsWith("panel:")) {
    return classifyPanelSurface(surfaceId.slice(6) as CorePanelPolicyId);
  }

  if (surfaceId.startsWith("template:")) {
    return classifyTemplateSurface(surfaceId.slice(9));
  }

  return "core-engine";
};

export const isFixedCoreEngineSurface = (
  surfaceId: CoreEngineSurfaceId
): boolean => CORE_ENGINE_SURFACE_ALLOWLIST.includes(surfaceId);
