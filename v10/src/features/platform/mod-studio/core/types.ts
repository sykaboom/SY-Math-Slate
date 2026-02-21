import type { RolePolicyDocument } from "@core/foundation/policies/rolePolicyGuards";
import type {
  ThemeGlobalTokenMap,
  ThemeModuleScopedTokenMap,
  ThemePresetId,
} from "@core/ui/theming/tokens/themeTokens";
import type { UISlotName } from "@core/runtime/plugin-runtime/registry";

export const MOD_STUDIO_TABS = [
  "policy",
  "layout",
  "modules",
  "theme",
  "publish",
  "io",
] as const;

export type ModStudioTab = (typeof MOD_STUDIO_TABS)[number];

export type LayoutSlotDraft = {
  slot: UISlotName;
  moduleOrder: string[];
  hidden: boolean;
};

export type LayoutDraft = {
  slots: LayoutSlotDraft[];
};

export type ModuleActionDraft = {
  commandId: string;
  payload: Record<string, unknown>;
};

export type ModuleDraft = {
  id: string;
  label: string;
  slot: UISlotName;
  enabled: boolean;
  order: number;
  icon?: string;
  action: ModuleActionDraft;
};

export type ThemeDraft = {
  presetId: ThemePresetId;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
};

export type TemplateDraft = {
  packId: string;
  title: string;
  description: string;
  defaultEnabled: boolean;
};

export type StudioDraftBundle = {
  policy: RolePolicyDocument;
  layout: LayoutDraft;
  modules: ModuleDraft[];
  theme: ThemeDraft;
  template: TemplateDraft;
};

export type StudioSnapshot = {
  id: string;
  createdAt: number;
  reason: string;
  bundle: StudioDraftBundle;
};

export type StudioPublishResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
