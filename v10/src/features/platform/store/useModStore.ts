import { create } from "zustand";

import type { ModId } from "@core/runtime/modding/api";
import {
  listRuntimeModPackages,
  selectActiveModPackage,
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
  setActivePackageContext: (packId: ModPackageId | null) => void;
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
  setActivePackageContext: (packId) =>
    set((state) => {
      const registeredPackages = listRuntimeModPackages();
      const resolvedPackage = selectActiveModPackage(registeredPackages, packId);
      const nextActivePackageId = resolvedPackage?.packId ?? null;
      const nextActiveModId = (() => {
        if (!resolvedPackage) return state.activeModId;
        if (resolvedPackage.modIds.includes(state.activeModId)) {
          return state.activeModId;
        }
        return resolvedPackage.activation.defaultModId ?? DEFAULT_ACTIVE_MOD_ID;
      })();

      if (
        state.activePackageId === nextActivePackageId &&
        state.activeModId === nextActiveModId
      ) {
        return state;
      }

      return {
        activePackageId: nextActivePackageId,
        activeModId: nextActiveModId,
      };
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
