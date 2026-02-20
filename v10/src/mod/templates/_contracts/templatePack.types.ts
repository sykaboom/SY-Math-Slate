import type { UISlotComponent, UISlotName } from "@core/extensions/registry";

export const TEMPLATE_PACK_MANIFEST_VERSION = 1 as const;

export type TemplateToolbarMode = "draw" | "playback" | "canvas";
export type TemplateViewportProfile = "desktop" | "tablet" | "mobile";
export type TemplateSurface = "primary" | "more" | "hidden";

export type TemplateActionSurfaceRule = {
  mode: TemplateToolbarMode;
  viewport: TemplateViewportProfile;
  actionId: string;
  surface: TemplateSurface;
};

export type TemplateLayoutSlot = {
  slot: UISlotName;
  moduleOrder: string[];
  hidden: boolean;
};

export type TemplateThemeDraft = {
  presetId?: string;
  globalTokens?: Record<string, string>;
  moduleScopedTokens?: Record<string, Record<string, string>>;
};

export type TemplatePackSlotComponentEntry = {
  id: string;
  slot: UISlotName;
  component: UISlotComponent;
};

export type TemplatePackManifest = {
  manifestVersion: typeof TEMPLATE_PACK_MANIFEST_VERSION;
  packId: string;
  title: string;
  description: string;
  kind: "base" | "custom";
  actionSurfaceRules: readonly TemplateActionSurfaceRule[];
  layout: readonly TemplateLayoutSlot[];
  slotComponents?: readonly TemplatePackSlotComponentEntry[];
  theme?: TemplateThemeDraft;
  defaultEnabled?: boolean;
};
