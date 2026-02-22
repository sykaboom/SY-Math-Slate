import type { ModId } from "@core/runtime/modding/api";

import type {
  ResolvedToolbarPlanMode,
  ResolvedToolbarViewportProfile,
} from "./modeAndViewport";

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
