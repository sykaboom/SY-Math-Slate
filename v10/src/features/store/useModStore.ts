import { create } from "zustand";

import type { ModId } from "@core/mod/contracts";

export const DEFAULT_ACTIVE_MOD_ID: ModId = "draw";

export interface ModStoreState {
  activeModId: ModId;
  setActiveModId: (modId: ModId) => void;
  resetActiveModId: () => void;
}

export const useModStore = create<ModStoreState>((set) => ({
  activeModId: DEFAULT_ACTIVE_MOD_ID,
  setActiveModId: (modId) =>
    set((state) => {
      if (state.activeModId === modId) return state;
      return { activeModId: modId };
    }),
  resetActiveModId: () => set({ activeModId: DEFAULT_ACTIVE_MOD_ID }),
}));
