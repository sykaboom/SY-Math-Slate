import type {
  TemplatePackAdapterActionSurfaceRule,
  TemplatePackAdapterLayoutSlot,
  TemplatePackAdapterManifest,
  TemplatePackAdapterSlotComponentEntry,
  TemplatePackAdapterSurface,
  TemplatePackAdapterThemeDraft,
  TemplatePackAdapterToolbarMode,
  TemplatePackAdapterViewportProfile,
} from "@core/runtime/modding/package";

export const TEMPLATE_PACK_MANIFEST_VERSION = 1 as const;

export type TemplateToolbarMode = TemplatePackAdapterToolbarMode;
export type TemplateViewportProfile = TemplatePackAdapterViewportProfile;
export type TemplateSurface = TemplatePackAdapterSurface;

export type TemplateActionSurfaceRule = TemplatePackAdapterActionSurfaceRule;

export type TemplateLayoutSlot = TemplatePackAdapterLayoutSlot;

export type TemplateThemeDraft = TemplatePackAdapterThemeDraft;

export type TemplatePackSlotComponentEntry =
  TemplatePackAdapterSlotComponentEntry;

export type TemplatePackManifest = Omit<
  TemplatePackAdapterManifest,
  "manifestVersion"
> & {
  manifestVersion: typeof TEMPLATE_PACK_MANIFEST_VERSION;
};
