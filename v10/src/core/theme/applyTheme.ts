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

const THEME_RGB_TOKEN_VARIABLES = [
  { variableName: "--theme-surface-rgb", tokenKey: "surface" },
  { variableName: "--theme-text-rgb", tokenKey: "text" },
  { variableName: "--theme-border-rgb", tokenKey: "border" },
  { variableName: "--theme-accent-rgb", tokenKey: "accent" },
] as const;

const RGBA_COLOR_PATTERN =
  /^rgba?\(\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)(?:\s*,\s*[0-9]+(?:\.[0-9]+)?\s*)?\)$/i;

const toRgbChannelValue = (rawValue: string): number | null => {
  const numeric = Number.parseFloat(rawValue);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(255, Math.round(numeric)));
};

const parseRgbTuple = (tokenValue: string): string | null => {
  const match = tokenValue.match(RGBA_COLOR_PATTERN);
  if (!match) return null;
  const red = toRgbChannelValue(match[1]);
  const green = toRgbChannelValue(match[2]);
  const blue = toRgbChannelValue(match[3]);
  if (red === null || green === null || blue === null) return null;
  return `${red}, ${green}, ${blue}`;
};

const applyResolvedThemeRgbVariables = (
  root: HTMLElement,
  globalTokens: ThemeGlobalTokenMap
): void => {
  THEME_RGB_TOKEN_VARIABLES.forEach(({ variableName, tokenKey }) => {
    const tokenValue = globalTokens[tokenKey];
    if (typeof tokenValue !== "string") {
      root.style.removeProperty(variableName);
      return;
    }
    const tuple = parseRgbTuple(tokenValue);
    if (tuple === null) {
      root.style.removeProperty(variableName);
      return;
    }
    root.style.setProperty(variableName, tuple);
  });
};

export const resolveThemeTokens = (
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

export type ThemeVariableApplier = (
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap,
  presetId?: unknown
) => void;

export const createThemeVariableApplier = (): ThemeVariableApplier => {
  let lastAppliedGlobalVariables = new Set<string>();
  let lastAppliedModuleVariables = new Set<string>();

  return (
    globalTokens: ThemeGlobalTokenMap,
    moduleScopedTokens: ThemeModuleScopedTokenMap,
    presetId: unknown = DEFAULT_THEME_PRESET_ID
  ): void => {
    if (typeof document === "undefined") return;

    const resolved = resolveThemeTokens(globalTokens, moduleScopedTokens, presetId);
    const root = document.documentElement;
    const nextGlobalVariables = new Set<string>();
    const nextModuleVariables = new Set<string>();

    Object.entries(resolved.globalTokens).forEach(([tokenKey, tokenValue]) => {
      const variableName = toGlobalThemeVariable(tokenKey);
      root.style.setProperty(variableName, tokenValue);
      nextGlobalVariables.add(variableName);
    });
    applyResolvedThemeRgbVariables(root, resolved.globalTokens);

    Object.entries(resolved.moduleScopedTokens).forEach(([moduleId, tokens]) => {
      Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
        const variableName = toModuleScopedThemeVariable(moduleId, tokenKey);
        root.style.setProperty(variableName, tokenValue);
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
};

export const applyTheme = createThemeVariableApplier();
