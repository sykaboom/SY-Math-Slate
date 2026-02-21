import { create } from "zustand";

import {
  DEFAULT_THEME_PRESET_ID,
  normalizeThemeGlobalTokenMap,
  type ThemeGlobalTokenKey,
  type ThemeGlobalTokenMap,
  type ThemePresetId,
} from "@core/ui/theming/tokens/themeTokens";

type TokenDraftState = {
  basePresetId: ThemePresetId;
  baseGlobalTokens: ThemeGlobalTokenMap;
  draftGlobalTokens: ThemeGlobalTokenMap;
  initializeDraft: (
    presetId: ThemePresetId,
    globalTokens: ThemeGlobalTokenMap
  ) => void;
  replaceDraft: (globalTokens: ThemeGlobalTokenMap) => void;
  setTokenDraftValue: (tokenKey: ThemeGlobalTokenKey, tokenValue: string) => void;
  resetDraft: () => void;
};

const cloneGlobalTokens = (globalTokens: ThemeGlobalTokenMap): ThemeGlobalTokenMap =>
  normalizeThemeGlobalTokenMap(globalTokens);

export const useTokenDraftStore = create<TokenDraftState>((set) => ({
  basePresetId: DEFAULT_THEME_PRESET_ID,
  baseGlobalTokens: {},
  draftGlobalTokens: {},
  initializeDraft: (presetId, globalTokens) => {
    const normalized = cloneGlobalTokens(globalTokens);
    set(() => ({
      basePresetId: presetId,
      baseGlobalTokens: normalized,
      draftGlobalTokens: normalized,
    }));
  },
  replaceDraft: (globalTokens) => {
    const normalized = cloneGlobalTokens(globalTokens);
    set(() => ({
      draftGlobalTokens: normalized,
    }));
  },
  setTokenDraftValue: (tokenKey, tokenValue) => {
    const normalizedValue = tokenValue.trim();
    set((state) => {
      if (!normalizedValue) {
        if (!(tokenKey in state.draftGlobalTokens)) return state;
        const nextTokens = { ...state.draftGlobalTokens };
        delete nextTokens[tokenKey];
        return {
          draftGlobalTokens: nextTokens,
        };
      }
      return {
        draftGlobalTokens: {
          ...state.draftGlobalTokens,
          [tokenKey]: normalizedValue,
        },
      };
    });
  },
  resetDraft: () =>
    set((state) => ({
      draftGlobalTokens: cloneGlobalTokens(state.baseGlobalTokens),
    })),
}));
