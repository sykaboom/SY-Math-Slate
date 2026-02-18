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

type ToolbarRgbAliasVariable =
  | {
      variableName: string;
      tokenSource: "module";
      moduleId: string;
      tokenKey: string;
    }
  | {
      variableName: string;
      tokenSource: "global";
      tokenKey: string;
    };

const TOOLBAR_RGB_ALIAS_VARIABLES: readonly ToolbarRgbAliasVariable[] = [
  {
    variableName: "--toolbar-surface-rgb",
    tokenSource: "module",
    moduleId: "core-toolbar",
    tokenKey: "surface",
  },
  {
    variableName: "--toolbar-text-rgb",
    tokenSource: "module",
    moduleId: "core-toolbar",
    tokenKey: "text",
  },
  {
    variableName: "--toolbar-border-rgb",
    tokenSource: "module",
    moduleId: "core-toolbar",
    tokenKey: "border",
  },
  {
    variableName: "--toolbar-active-bg-rgb",
    tokenSource: "module",
    moduleId: "core-toolbar",
    tokenKey: "accent",
  },
  {
    variableName: "--toolbar-chip-rgb",
    tokenSource: "module",
    moduleId: "core-toolbar",
    tokenKey: "chip",
  },
  {
    variableName: "--toolbar-menu-bg-rgb",
    tokenSource: "module",
    moduleId: "core-toolbar",
    tokenKey: "menu-bg",
  },
  {
    variableName: "--toolbar-muted-rgb",
    tokenSource: "global",
    tokenKey: "text-muted",
  },
  {
    variableName: "--toolbar-active-text-rgb",
    tokenSource: "global",
    tokenKey: "accent-text",
  },
  {
    variableName: "--toolbar-danger-rgb",
    tokenSource: "global",
    tokenKey: "danger",
  },
];

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

const applyToolbarAliasRgbVariables = (
  root: HTMLElement,
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap
): void => {
  TOOLBAR_RGB_ALIAS_VARIABLES.forEach((definition) => {
    const tokenValue =
      definition.tokenSource === "global"
        ? globalTokens[definition.tokenKey]
        : moduleScopedTokens[definition.moduleId]?.[definition.tokenKey];
    if (typeof tokenValue !== "string") {
      root.style.removeProperty(definition.variableName);
      return;
    }
    const tuple = parseRgbTuple(tokenValue);
    if (tuple === null) {
      root.style.removeProperty(definition.variableName);
      return;
    }
    root.style.setProperty(definition.variableName, tuple);
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
    applyToolbarAliasRgbVariables(
      root,
      resolved.globalTokens,
      resolved.moduleScopedTokens
    );

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
