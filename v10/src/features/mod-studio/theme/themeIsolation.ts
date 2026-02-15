import {
  DEFAULT_THEME_PRESET_ID,
  resolveThemePresetId,
  sanitizeThemeModuleId,
  sanitizeThemeTokenKey,
  type ThemeGlobalTokenMap,
  type ThemeModuleScopedTokenMap,
} from "@core/config/themeTokens";
import { getThemePreset } from "@core/themes/presets";

export const THEME_GLOBAL_PREFIX = "--theme-";
export const THEME_MODULE_PREFIX = "--mod-";

let lastAppliedGlobalVariables = new Set<string>();
let lastAppliedModuleVariables = new Set<string>();

export const toGlobalThemeVariable = (tokenKey: string): string =>
  `${THEME_GLOBAL_PREFIX}${sanitizeThemeTokenKey(tokenKey)}`;

export const toModuleScopedThemeVariable = (
  moduleId: string,
  tokenKey: string
): string =>
  `${THEME_MODULE_PREFIX}${sanitizeThemeModuleId(moduleId)}-${sanitizeThemeTokenKey(tokenKey)}`;

const mergeModuleScopedTokens = (
  base: ThemeModuleScopedTokenMap,
  overrides: ThemeModuleScopedTokenMap
): ThemeModuleScopedTokenMap => {
  const merged: ThemeModuleScopedTokenMap = {};
  Object.entries(base).forEach(([moduleId, tokens]) => {
    merged[moduleId] = { ...tokens };
  });
  Object.entries(overrides).forEach(([moduleId, tokens]) => {
    merged[moduleId] = {
      ...(merged[moduleId] ?? {}),
      ...tokens,
    };
  });
  return merged;
};

export const resolveThemeDraftTokens = (
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap,
  presetId: unknown = DEFAULT_THEME_PRESET_ID
): {
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
  presetId: string;
} => {
  const preset = getThemePreset(resolveThemePresetId(presetId));
  return {
    presetId: preset.id,
    globalTokens: {
      ...preset.globalTokens,
      ...globalTokens,
    },
    moduleScopedTokens: mergeModuleScopedTokens(
      preset.moduleScopedTokens,
      moduleScopedTokens
    ),
  };
};

export const applyThemeDraftPreview = (
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap,
  presetId: unknown = DEFAULT_THEME_PRESET_ID
): void => {
  if (typeof document === "undefined") return;
  const resolved = resolveThemeDraftTokens(globalTokens, moduleScopedTokens, presetId);
  const root = document.documentElement;
  const nextGlobalVariables = new Set<string>();
  const nextModuleVariables = new Set<string>();

  Object.entries(resolved.globalTokens).forEach(([tokenKey, tokenValue]) => {
    const variableName = toGlobalThemeVariable(tokenKey);
    root.style.setProperty(variableName, tokenValue);
    nextGlobalVariables.add(variableName);
  });
  Object.entries(resolved.moduleScopedTokens).forEach(([moduleId, tokens]) => {
    Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
      const variableName = toModuleScopedThemeVariable(moduleId, tokenKey);
      root.style.setProperty(
        variableName,
        tokenValue
      );
      nextModuleVariables.add(variableName);
    });
  });

  lastAppliedGlobalVariables.forEach((variableName) => {
    if (!nextGlobalVariables.has(variableName)) {
      root.style.removeProperty(variableName);
    }
  });
  lastAppliedModuleVariables.forEach((variableName) => {
    if (!nextModuleVariables.has(variableName)) {
      root.style.removeProperty(variableName);
    }
  });

  lastAppliedGlobalVariables = nextGlobalVariables;
  lastAppliedModuleVariables = nextModuleVariables;
};
