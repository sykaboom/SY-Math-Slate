export type CapabilityKey =
  | "playback.autoplay"
  | "playback.timing"
  | "overview.mode"
  | "data.math"
  | "data.highlight"
  | "export.advanced";

export type CapabilityProfileName = "basic" | "advanced";

export type CapabilityProfile = {
  name: CapabilityProfileName;
  description: string;
  enabledCapabilities: CapabilityKey[];
};

const profiles: Record<CapabilityProfileName, CapabilityProfile> = {
  basic: {
    name: "basic",
    description: "Easy defaults for instructors",
    enabledCapabilities: [
      "playback.autoplay",
      "playback.timing",
      "overview.mode",
      "data.math",
      "data.highlight",
    ],
  },
  advanced: {
    name: "advanced",
    description: "Power controls with export placeholders",
    enabledCapabilities: [
      "playback.autoplay",
      "playback.timing",
      "overview.mode",
      "data.math",
      "data.highlight",
      "export.advanced",
    ],
  },
};

export const getCapabilities = (profile: CapabilityProfileName) => {
  const resolved = profiles[profile] ?? profiles.basic;
  return new Set(resolved.enabledCapabilities);
};
