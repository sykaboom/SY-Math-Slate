import {
  DEFAULT_THEME_PRESET_ID,
  type ThemeGlobalTokenMap,
  type ThemeModuleScopedTokenMap,
} from "@core/config/themeTokens";
import {
  THEME_GLOBAL_PREFIX,
  THEME_MODULE_PREFIX,
  createThemeVariableApplier,
  resolveThemeTokens,
  toGlobalThemeVariable,
  toModuleScopedThemeVariable,
} from "@core/theme/applyTheme";

export const resolveThemeDraftTokens = (
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap,
  presetId: unknown = DEFAULT_THEME_PRESET_ID
): {
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
  presetId: string;
} => {
  return resolveThemeTokens(globalTokens, moduleScopedTokens, presetId);
};

const draftPreviewApplier = createThemeVariableApplier();

export const applyThemeDraftPreview = (
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap,
  presetId: unknown = DEFAULT_THEME_PRESET_ID
): void => {
  draftPreviewApplier(globalTokens, moduleScopedTokens, presetId);
};

export {
  THEME_GLOBAL_PREFIX,
  THEME_MODULE_PREFIX,
  toGlobalThemeVariable,
  toModuleScopedThemeVariable,
};
