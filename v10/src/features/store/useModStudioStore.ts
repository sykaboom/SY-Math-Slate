import { create } from "zustand";

import { getRolePolicyDocument } from "@core/config/rolePolicy";
import {
  DEFAULT_THEME_PRESET_ID,
  normalizeThemeGlobalTokenMap,
  normalizeThemeModuleScopedTokenMap,
  resolveThemePresetId,
  sanitizeThemeModuleId,
  sanitizeThemeTokenKey,
  type ThemePresetId,
} from "@core/config/themeTokens";
import { listKnownUISlotNames, type UISlotName } from "@core/extensions/registry";
import { getThemePreset } from "@core/themes/presets";
import {
  MOD_STUDIO_TABS,
  type LayoutDraft,
  type LayoutSlotDraft,
  type ModStudioTab,
  type ModuleDraft,
  type StudioDraftBundle,
  type StudioPublishResult,
  type StudioSnapshot,
  type ThemeDraft,
} from "@features/mod-studio/core/types";

const cloneLayoutSlotDraft = (slot: LayoutSlotDraft): LayoutSlotDraft => ({
  slot: slot.slot,
  moduleOrder: [...slot.moduleOrder],
  hidden: Boolean(slot.hidden),
});

const cloneLayoutDraft = (layout: LayoutDraft): LayoutDraft => ({
  slots: layout.slots.map(cloneLayoutSlotDraft),
});

const cloneModuleDraft = (module: ModuleDraft): ModuleDraft => ({
  id: module.id,
  label: module.label,
  slot: module.slot,
  enabled: Boolean(module.enabled),
  order: Number.isFinite(module.order) ? module.order : 0,
  icon: module.icon,
  action: {
    commandId: module.action.commandId,
    payload: { ...module.action.payload },
  },
});

const cloneThemeTokenMap = (tokens: Record<string, string>): Record<string, string> => ({
  ...tokens,
});

const cloneThemeDraft = (theme: ThemeDraft): ThemeDraft => {
  const moduleScopedTokens: ThemeDraft["moduleScopedTokens"] = {};
  Object.entries(theme.moduleScopedTokens).forEach(([moduleId, tokens]) => {
    moduleScopedTokens[moduleId] = cloneThemeTokenMap(tokens);
  });
  return {
    presetId: resolveThemePresetId(theme.presetId, DEFAULT_THEME_PRESET_ID),
    globalTokens: cloneThemeTokenMap(theme.globalTokens),
    moduleScopedTokens,
  };
};

const normalizeThemeDraft = (theme: Partial<ThemeDraft> | ThemeDraft): ThemeDraft => ({
  presetId: resolveThemePresetId(theme.presetId, DEFAULT_THEME_PRESET_ID),
  globalTokens: normalizeThemeGlobalTokenMap(theme.globalTokens),
  moduleScopedTokens: normalizeThemeModuleScopedTokenMap(theme.moduleScopedTokens),
});

const cloneDraftBundle = (bundle: StudioDraftBundle): StudioDraftBundle => ({
  policy: JSON.parse(JSON.stringify(bundle.policy)),
  layout: cloneLayoutDraft(bundle.layout),
  modules: bundle.modules.map(cloneModuleDraft),
  theme: cloneThemeDraft(bundle.theme),
});

const createDefaultLayoutDraft = (): LayoutDraft => ({
  slots: listKnownUISlotNames().map((slotName) => ({
    slot: slotName,
    moduleOrder: [],
    hidden: false,
  })),
});

const createDefaultThemeDraft = (): ThemeDraft => ({
  ...(() => {
    const preset = getThemePreset(DEFAULT_THEME_PRESET_ID);
    return {
      presetId: preset.id,
      globalTokens: cloneThemeTokenMap(preset.globalTokens),
      moduleScopedTokens: (() => {
        const moduleScoped: ThemeDraft["moduleScopedTokens"] = {};
        Object.entries(preset.moduleScopedTokens).forEach(([moduleId, tokens]) => {
          moduleScoped[moduleId] = cloneThemeTokenMap(tokens);
        });
        return moduleScoped;
      })(),
    };
  })(),
});

const createDefaultDraftBundle = (): StudioDraftBundle => ({
  policy: JSON.parse(JSON.stringify(getRolePolicyDocument())),
  layout: createDefaultLayoutDraft(),
  modules: [],
  theme: createDefaultThemeDraft(),
});

const normalizeTab = (tab: ModStudioTab): ModStudioTab => {
  if ((MOD_STUDIO_TABS as readonly string[]).includes(tab)) return tab;
  return "policy";
};

const createSnapshotId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `studio-snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type ModStudioState = {
  isOpen: boolean;
  activeTab: ModStudioTab;
  draft: StudioDraftBundle;
  snapshots: StudioSnapshot[];
  lastPublishResult: StudioPublishResult | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setActiveTab: (tab: ModStudioTab) => void;
  resetDraft: () => void;
  setDraftBundle: (next: StudioDraftBundle) => void;
  updatePolicyDraft: (policy: StudioDraftBundle["policy"]) => void;
  updateLayoutSlot: (
    slot: UISlotName,
    updates: Partial<Pick<LayoutSlotDraft, "moduleOrder" | "hidden">>
  ) => void;
  upsertModuleDraft: (module: ModuleDraft) => void;
  removeModuleDraft: (moduleId: string) => void;
  setThemePreset: (presetId: ThemePresetId) => void;
  setThemeToken: (tokenKey: string, tokenValue: string) => void;
  setModuleThemeToken: (
    moduleId: string,
    tokenKey: string,
    tokenValue: string
  ) => void;
  setLastPublishResult: (result: StudioPublishResult | null) => void;
  addSnapshot: (reason: string, bundle?: StudioDraftBundle) => StudioSnapshot;
  rollbackSnapshot: (snapshotId: string) => boolean;
};

export const useModStudioStore = create<ModStudioState>((set, get) => ({
  isOpen: false,
  activeTab: "policy",
  draft: createDefaultDraftBundle(),
  snapshots: [],
  lastPublishResult: null,
  open: () => set(() => ({ isOpen: true })),
  close: () => set(() => ({ isOpen: false })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveTab: (tab) => set(() => ({ activeTab: normalizeTab(tab) })),
  resetDraft: () =>
    set(() => ({
      draft: createDefaultDraftBundle(),
    })),
  setDraftBundle: (next) =>
    set(() => ({
      draft: {
        ...cloneDraftBundle(next),
        theme: normalizeThemeDraft(next.theme),
      },
    })),
  updatePolicyDraft: (policy) =>
    set((state) => ({
      draft: {
        ...state.draft,
        policy: JSON.parse(JSON.stringify(policy)),
      },
    })),
  updateLayoutSlot: (slot, updates) =>
    set((state) => ({
      draft: {
        ...state.draft,
        layout: {
          slots: state.draft.layout.slots.map((entry) => {
            if (entry.slot !== slot) return entry;
            return {
              ...entry,
              hidden:
                typeof updates.hidden === "boolean" ? updates.hidden : entry.hidden,
              moduleOrder: updates.moduleOrder
                ? [...updates.moduleOrder]
                : [...entry.moduleOrder],
            };
          }),
        },
      },
    })),
  upsertModuleDraft: (module) =>
    set((state) => {
      const cloned = cloneModuleDraft(module);
      const current = state.draft.modules;
      const existingIndex = current.findIndex((entry) => entry.id === cloned.id);
      if (existingIndex < 0) {
        return {
          draft: {
            ...state.draft,
            modules: [...current, cloned],
          },
        };
      }
      const next = [...current];
      next[existingIndex] = cloned;
      return {
        draft: {
          ...state.draft,
          modules: next,
        },
      };
    }),
  removeModuleDraft: (moduleId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        modules: state.draft.modules.filter((entry) => entry.id !== moduleId),
      },
    })),
  setThemePreset: (presetId) =>
    set((state) => {
      const preset = getThemePreset(presetId);
      return {
        draft: {
          ...state.draft,
          theme: {
            presetId: preset.id,
            globalTokens: cloneThemeTokenMap(preset.globalTokens),
            moduleScopedTokens: normalizeThemeModuleScopedTokenMap(
              preset.moduleScopedTokens
            ),
          },
        },
      };
    }),
  setThemeToken: (tokenKey, tokenValue) =>
    set((state) => {
      const normalizedKey = sanitizeThemeTokenKey(tokenKey);
      const normalizedValue = tokenValue.trim();
      if (!normalizedValue) {
        if (!(normalizedKey in state.draft.theme.globalTokens)) {
          return state;
        }
        const nextGlobalTokens = { ...state.draft.theme.globalTokens };
        delete nextGlobalTokens[normalizedKey];
        return {
          draft: {
            ...state.draft,
            theme: {
              ...state.draft.theme,
              globalTokens: nextGlobalTokens,
            },
          },
        };
      }
      return {
        draft: {
          ...state.draft,
          theme: {
            ...state.draft.theme,
            globalTokens: {
              ...state.draft.theme.globalTokens,
              [normalizedKey]: normalizedValue,
            },
          },
        },
      };
    }),
  setModuleThemeToken: (moduleId, tokenKey, tokenValue) =>
    set((state) => {
      const normalizedModuleId = sanitizeThemeModuleId(moduleId);
      const normalizedKey = sanitizeThemeTokenKey(tokenKey);
      const normalizedValue = tokenValue.trim();
      if (!normalizedValue) {
        const existingModuleTokens =
          state.draft.theme.moduleScopedTokens[normalizedModuleId];
        if (!existingModuleTokens || !(normalizedKey in existingModuleTokens)) {
          return state;
        }
        const nextModuleTokens = { ...existingModuleTokens };
        delete nextModuleTokens[normalizedKey];

        const nextModuleScopedTokens = {
          ...state.draft.theme.moduleScopedTokens,
        };
        if (Object.keys(nextModuleTokens).length === 0) {
          delete nextModuleScopedTokens[normalizedModuleId];
        } else {
          nextModuleScopedTokens[normalizedModuleId] = nextModuleTokens;
        }

        return {
          draft: {
            ...state.draft,
            theme: {
              ...state.draft.theme,
              moduleScopedTokens: nextModuleScopedTokens,
            },
          },
        };
      }

      return {
        draft: {
          ...state.draft,
          theme: {
            ...state.draft.theme,
            moduleScopedTokens: {
              ...state.draft.theme.moduleScopedTokens,
              [normalizedModuleId]: {
                ...(state.draft.theme.moduleScopedTokens[normalizedModuleId] ?? {}),
                [normalizedKey]: normalizedValue,
              },
            },
          },
        },
      };
    }),
  setLastPublishResult: (result) => set(() => ({ lastPublishResult: result })),
  addSnapshot: (reason, bundle) => {
    const snapshot: StudioSnapshot = {
      id: createSnapshotId(),
      createdAt: Date.now(),
      reason,
      bundle: cloneDraftBundle(bundle ?? get().draft),
    };
    set((state) => ({
      snapshots: [snapshot, ...state.snapshots],
    }));
    return snapshot;
  },
  rollbackSnapshot: (snapshotId) => {
    const snapshot = get().snapshots.find((entry) => entry.id === snapshotId);
    if (!snapshot) return false;
    set((state) => ({
      draft: cloneDraftBundle(snapshot.bundle),
      lastPublishResult: {
        ok: true,
        message: `snapshot restored: ${snapshot.reason}`,
      },
      activeTab: state.activeTab,
    }));
    return true;
  },
}));
