import { create } from "zustand";

import type { ModId } from "@core/runtime/modding/api";
import {
  listRuntimeModPackages,
  selectPrimaryModPackage,
  type ModPackageId,
} from "@core/runtime/modding/package";

export const DEFAULT_ACTIVE_MOD_ID: ModId = "draw";

export const resolveDefaultActivePackageId = (): ModPackageId | null => {
  const primaryPackage = selectPrimaryModPackage(listRuntimeModPackages());
  return primaryPackage?.packId ?? null;
};

export interface ModStoreState {
  activePackageId: ModPackageId | null;
  activeModId: ModId;
  setActivePackageId: (packId: ModPackageId | null) => void;
  resetActivePackageId: () => void;
  setActiveModId: (modId: ModId) => void;
  resetActiveModId: () => void;
}

export const useModStore = create<ModStoreState>((set) => ({
  activePackageId: resolveDefaultActivePackageId(),
  activeModId: DEFAULT_ACTIVE_MOD_ID,
  setActivePackageId: (packId) =>
    set((state) => {
      if (state.activePackageId === packId) return state;
      return { activePackageId: packId };
    }),
  resetActivePackageId: () =>
    set({ activePackageId: resolveDefaultActivePackageId() }),
  setActiveModId: (modId) =>
    set((state) => {
      if (state.activeModId === modId) return state;
      return { activeModId: modId };
    }),
  resetActiveModId: () => set({ activeModId: DEFAULT_ACTIVE_MOD_ID }),
}));
