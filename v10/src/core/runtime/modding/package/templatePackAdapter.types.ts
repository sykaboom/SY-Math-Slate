import type { UISlotComponent, UISlotName } from "@core/runtime/plugin-runtime/registry";
import type { ModPackageToolbarMode } from "./types";

export type TemplatePackAdapterToolbarMode = ModPackageToolbarMode;
export type TemplatePackAdapterViewportProfile =
  | "desktop"
  | "tablet"
  | "mobile";
export type TemplatePackAdapterSurface = "primary" | "more" | "hidden";

export type TemplatePackAdapterActionSurfaceRule = {
  mode: TemplatePackAdapterToolbarMode;
  viewport: TemplatePackAdapterViewportProfile;
  actionId: string;
  surface: TemplatePackAdapterSurface;
};

export type TemplatePackAdapterLayoutSlot = {
  slot: UISlotName;
  moduleOrder: string[];
  hidden: boolean;
};

export type TemplatePackAdapterThemeDraft = {
  presetId?: string;
  globalTokens?: Record<string, string>;
  moduleScopedTokens?: Record<string, Record<string, string>>;
};

export type TemplatePackAdapterSlotComponentEntry = {
  id: string;
  slot: UISlotName;
  component: UISlotComponent;
};

export type TemplatePackAdapterToolbarDefinition = {
  modeDefinitions: readonly {
    id: TemplatePackAdapterToolbarMode;
    label: string;
    fallbackModId: string;
  }[];
  actionCatalog: readonly {
    id: string;
    label: string;
    modes: readonly TemplatePackAdapterToolbarMode[];
  }[];
  actionSurfaceRules: readonly TemplatePackAdapterActionSurfaceRule[];
};

export type TemplatePackAdapterManifest = {
  manifestVersion: number;
  packId: string;
  title: string;
  description: string;
  kind: "base" | "custom";
  toolbar: TemplatePackAdapterToolbarDefinition;
  layout: readonly TemplatePackAdapterLayoutSlot[];
  slotComponents?: readonly TemplatePackAdapterSlotComponentEntry[];
  theme?: TemplatePackAdapterThemeDraft;
  defaultEnabled?: boolean;
};
