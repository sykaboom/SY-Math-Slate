import { create } from "zustand";

import {
  DEFAULT_THEME_PRESET_ID,
  normalizeThemeGlobalTokenMap,
  normalizeThemeModuleScopedTokenMap,
  resolveThemePresetId,
  sanitizeThemeModuleId,
  sanitizeThemeTokenKey,
  type ThemeGlobalTokenMap,
  type ThemeModuleScopedTokenMap,
  type ThemePresetId,
} from "@core/config/themeTokens";
import { applyTheme } from "@core/theme/applyTheme";
import {
  DEFAULT_THEME_PREFERENCES,
  cloneThemePreferences,
  mergeThemePreferences,
  normalizeThemePreferences,
  type ThemePreferences,
} from "@core/theme/preferences.schema";

export const THEME_STORAGE_KEY = "sy-theme-v1";

type ThemeStorePersistedState = {
  activePresetId: ThemePresetId;
  globalTokenOverrides: ThemeGlobalTokenMap;
  moduleScopedOverrides: ThemeModuleScopedTokenMap;
  preferences: ThemePreferences;
};

type ThemeStoreState = ThemeStorePersistedState & {
  setPreset: (presetId: ThemePresetId) => void;
  setTokenOverride: (tokenKey: string, tokenValue: string) => void;
  setModuleTokenOverride: (
    moduleId: string,
    tokenKey: string,
    tokenValue: string
  ) => void;
  setPreferences: (partial: Partial<ThemePreferences>) => void;
  resetToPreset: (presetId: ThemePresetId) => void;
  applyActiveTheme: () => void;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneModuleScopedOverrides = (
  moduleScopedOverrides: ThemeModuleScopedTokenMap
): ThemeModuleScopedTokenMap => {
  const cloned: ThemeModuleScopedTokenMap = {};
  Object.entries(moduleScopedOverrides).forEach(([moduleId, tokens]) => {
    cloned[moduleId] = { ...tokens };
  });
  return cloned;
};

const clonePersistedState = (
  state: ThemeStorePersistedState
): ThemeStorePersistedState => ({
  activePresetId: state.activePresetId,
  globalTokenOverrides: { ...state.globalTokenOverrides },
  moduleScopedOverrides: cloneModuleScopedOverrides(state.moduleScopedOverrides),
  preferences: cloneThemePreferences(state.preferences),
});

const createDefaultPersistedState = (): ThemeStorePersistedState => ({
  activePresetId: DEFAULT_THEME_PRESET_ID,
  globalTokenOverrides: {},
  moduleScopedOverrides: {},
  preferences: cloneThemePreferences(DEFAULT_THEME_PREFERENCES),
});

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readPersistedThemeState = (): ThemeStorePersistedState => {
  const defaults = createDefaultPersistedState();
  const storage = getStorage();
  if (!storage) return defaults;

  const raw = storage.getItem(THEME_STORAGE_KEY);
  if (!raw) return defaults;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaults;
  }

  if (!isRecord(parsed)) return defaults;

  return {
    activePresetId: resolveThemePresetId(parsed.activePresetId, defaults.activePresetId),
    globalTokenOverrides: normalizeThemeGlobalTokenMap(parsed.globalTokenOverrides),
    moduleScopedOverrides: normalizeThemeModuleScopedTokenMap(parsed.moduleScopedOverrides),
    preferences: normalizeThemePreferences(parsed.preferences, defaults.preferences),
  };
};

const writePersistedThemeState = (state: ThemeStorePersistedState): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Intentionally swallow localStorage failures.
  }
};

const selectPersistedState = (
  state: ThemeStoreState
): ThemeStorePersistedState => ({
  activePresetId: state.activePresetId,
  globalTokenOverrides: state.globalTokenOverrides,
  moduleScopedOverrides: state.moduleScopedOverrides,
  preferences: state.preferences,
});

const syncThemeState = (state: ThemeStoreState): void => {
  const persisted = clonePersistedState(selectPersistedState(state));
  writePersistedThemeState(persisted);
  applyTheme(
    persisted.globalTokenOverrides,
    persisted.moduleScopedOverrides,
    persisted.activePresetId
  );
};

const removeModuleToken = (
  source: ThemeModuleScopedTokenMap,
  moduleId: string,
  tokenKey: string
): ThemeModuleScopedTokenMap => {
  const currentTokens = source[moduleId];
  if (!currentTokens || !(tokenKey in currentTokens)) return source;

  const nextModuleScopedOverrides = { ...source };
  const nextModuleTokens = { ...currentTokens };
  delete nextModuleTokens[tokenKey];
  if (Object.keys(nextModuleTokens).length === 0) {
    delete nextModuleScopedOverrides[moduleId];
  } else {
    nextModuleScopedOverrides[moduleId] = nextModuleTokens;
  }
  return nextModuleScopedOverrides;
};

const initialThemeState = readPersistedThemeState();

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  ...initialThemeState,
  setPreset: (presetId) => {
    set((state) => ({
      activePresetId: resolveThemePresetId(presetId, state.activePresetId),
    }));
    syncThemeState(get());
  },
  setTokenOverride: (tokenKey, tokenValue) => {
    const normalizedKey = sanitizeThemeTokenKey(tokenKey);
    const normalizedValue = tokenValue.trim();

    set((state) => {
      if (normalizedValue.length === 0) {
        if (!(normalizedKey in state.globalTokenOverrides)) return state;
        const nextGlobalTokenOverrides = { ...state.globalTokenOverrides };
        delete nextGlobalTokenOverrides[normalizedKey];
        return {
          globalTokenOverrides: nextGlobalTokenOverrides,
        };
      }

      return {
        globalTokenOverrides: {
          ...state.globalTokenOverrides,
          [normalizedKey]: normalizedValue,
        },
      };
    });

    syncThemeState(get());
  },
  setModuleTokenOverride: (moduleId, tokenKey, tokenValue) => {
    const normalizedModuleId = sanitizeThemeModuleId(moduleId);
    const normalizedKey = sanitizeThemeTokenKey(tokenKey);
    const normalizedValue = tokenValue.trim();

    set((state) => {
      if (normalizedValue.length === 0) {
        return {
          moduleScopedOverrides: removeModuleToken(
            state.moduleScopedOverrides,
            normalizedModuleId,
            normalizedKey
          ),
        };
      }

      return {
        moduleScopedOverrides: {
          ...state.moduleScopedOverrides,
          [normalizedModuleId]: {
            ...(state.moduleScopedOverrides[normalizedModuleId] ?? {}),
            [normalizedKey]: normalizedValue,
          },
        },
      };
    });

    syncThemeState(get());
  },
  setPreferences: (partial) => {
    set((state) => ({
      preferences: mergeThemePreferences(state.preferences, partial),
    }));
    syncThemeState(get());
  },
  resetToPreset: (presetId) => {
    set((state) => ({
      activePresetId: resolveThemePresetId(presetId, state.activePresetId),
      globalTokenOverrides: {},
      moduleScopedOverrides: {},
    }));
    syncThemeState(get());
  },
  applyActiveTheme: () => {
    const state = get();
    applyTheme(
      state.globalTokenOverrides,
      state.moduleScopedOverrides,
      state.activePresetId
    );
  },
}));
