import { create } from "zustand";

import { getRolePolicyDocument } from "@core/config/rolePolicy";
import { listKnownUISlotNames, type UISlotName } from "@core/extensions/registry";
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

const cloneThemeDraft = (theme: ThemeDraft): ThemeDraft => {
  const moduleScopedTokens: Record<string, Record<string, string>> = {};
  Object.entries(theme.moduleScopedTokens).forEach(([moduleId, tokens]) => {
    moduleScopedTokens[moduleId] = { ...tokens };
  });
  return {
    globalTokens: { ...theme.globalTokens },
    moduleScopedTokens,
  };
};

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
  globalTokens: {},
  moduleScopedTokens: {},
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
      draft: cloneDraftBundle(next),
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
  setThemeToken: (tokenKey, tokenValue) =>
    set((state) => ({
      draft: {
        ...state.draft,
        theme: {
          ...state.draft.theme,
          globalTokens: {
            ...state.draft.theme.globalTokens,
            [tokenKey]: tokenValue,
          },
        },
      },
    })),
  setModuleThemeToken: (moduleId, tokenKey, tokenValue) =>
    set((state) => ({
      draft: {
        ...state.draft,
        theme: {
          ...state.draft.theme,
          moduleScopedTokens: {
            ...state.draft.theme.moduleScopedTokens,
            [moduleId]: {
              ...(state.draft.theme.moduleScopedTokens[moduleId] ?? {}),
              [tokenKey]: tokenValue,
            },
          },
        },
      },
    })),
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
