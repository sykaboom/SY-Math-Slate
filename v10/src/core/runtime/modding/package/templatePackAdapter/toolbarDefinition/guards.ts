import {
  MOD_PACKAGE_TOOLBAR_MODES,
  type ToolbarBaseActionSurfaceRule,
  type ToolbarBaseModeDefinition,
} from "../../types";

export const TOOLBAR_VIEWPORT_PROFILES = ["desktop", "tablet", "mobile"] as const;
export const TOOLBAR_ACTION_SURFACES = ["primary", "more", "hidden"] as const;

export const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const normalizeNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const isToolbarMode = (
  value: unknown
): value is ToolbarBaseModeDefinition["id"] =>
  typeof value === "string" &&
  MOD_PACKAGE_TOOLBAR_MODES.includes(value as ToolbarBaseModeDefinition["id"]);

export const isToolbarViewportProfile = (
  value: unknown
): value is ToolbarBaseActionSurfaceRule["viewport"] =>
  typeof value === "string" &&
  TOOLBAR_VIEWPORT_PROFILES.includes(
    value as ToolbarBaseActionSurfaceRule["viewport"]
  );

export const isToolbarActionSurface = (
  value: unknown
): value is ToolbarBaseActionSurfaceRule["surface"] =>
  typeof value === "string" &&
  TOOLBAR_ACTION_SURFACES.includes(value as ToolbarBaseActionSurfaceRule["surface"]);
