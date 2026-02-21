import { create } from "zustand";

import {
  type CapabilityKey,
  type CapabilityProfileName,
  getCapabilities,
} from "@core/foundation/policies/capabilities";

interface CapabilityStoreState {
  capabilityProfile: CapabilityProfileName;
  setCapabilityProfile: (profile: CapabilityProfileName) => void;
  isCapabilityEnabled: (key: CapabilityKey) => boolean;
}

export const useCapabilityStore = create<CapabilityStoreState>((set, get) => ({
  capabilityProfile: "advanced",
  setCapabilityProfile: (profile) => set(() => ({ capabilityProfile: profile })),
  isCapabilityEnabled: (key) =>
    getCapabilities(get().capabilityProfile).has(key),
}));
