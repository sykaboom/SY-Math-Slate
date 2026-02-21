import { create } from "zustand";

export type LocalRole = "host" | "student";

interface LocalStoreState {
  role: LocalRole;
  trustedRoleClaim: LocalRole | null;
  setRole: (role: LocalRole) => void;
  setTrustedRoleClaim: (role: LocalRole | null) => void;
  clearTrustedRoleClaim: () => void;
}

export const useLocalStore = create<LocalStoreState>((set) => ({
  role: "host",
  trustedRoleClaim: null,
  setRole: (role) =>
    set(() => ({
      role,
    })),
  setTrustedRoleClaim: (role) =>
    set(() => ({
      trustedRoleClaim: role,
    })),
  clearTrustedRoleClaim: () =>
    set(() => ({
      trustedRoleClaim: null,
    })),
}));
