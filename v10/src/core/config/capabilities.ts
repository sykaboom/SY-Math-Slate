export type CapabilityKey =
  | "playback.autoplay"
  | "playback.timing"
  | "overview.mode"
  | "data.math"
  | "data.highlight"
  | "export.pro";

export type CapabilityProfileName = "basic" | "advanced" | "pro";

export type CapabilityProfile = {
  name: CapabilityProfileName;
  description: string;
  enabledCapabilities: CapabilityKey[];
};

const profiles: Record<CapabilityProfileName, CapabilityProfile> = {
  basic: {
    name: "basic",
    description: "Easy defaults for instructors",
    enabledCapabilities: [],
  },
  advanced: {
    name: "advanced",
    description: "Power controls with timing and overview tools",
    enabledCapabilities: [
      "playback.autoplay",
      "playback.timing",
      "overview.mode",
      "data.math",
      "data.highlight",
    ],
  },
  pro: {
    name: "pro",
    description: "Full access with export placeholders",
    enabledCapabilities: [
      "playback.autoplay",
      "playback.timing",
      "overview.mode",
      "data.math",
      "data.highlight",
      "export.pro",
    ],
  },
};

export const getCapabilities = (profile: CapabilityProfileName) => {
  const resolved = profiles[profile] ?? profiles.basic;
  return new Set(resolved.enabledCapabilities);
};

