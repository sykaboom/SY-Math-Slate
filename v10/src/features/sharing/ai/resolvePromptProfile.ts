import type { PromptProfile } from "@core/types/aiApproval";

export type PromptProfileLayer = keyof PromptProfile;

export type PromptProfileLayerEntry = {
  layer: PromptProfileLayer;
  text: string;
};

const PROMPT_PROFILE_LAYER_ORDER: PromptProfileLayer[] = [
  "global",
  "template",
  "session",
  "teacher_override",
];

const normalizeOptionalPromptText = (value: string | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mergePromptProfileLayer = (
  currentValue: string | undefined,
  incomingValue: string | undefined
): string | undefined => normalizeOptionalPromptText(incomingValue) ?? currentValue;

export const mergePromptProfiles = (
  ...profiles: Array<PromptProfile | null | undefined>
): PromptProfile => {
  const merged: PromptProfile = {};

  for (const profile of profiles) {
    if (!profile) continue;
    merged.global = mergePromptProfileLayer(merged.global, profile.global);
    merged.template = mergePromptProfileLayer(merged.template, profile.template);
    merged.session = mergePromptProfileLayer(merged.session, profile.session);
    merged.teacher_override = mergePromptProfileLayer(
      merged.teacher_override,
      profile.teacher_override
    );
  }

  return merged;
};

export const resolvePromptProfileLayers = (
  ...profiles: Array<PromptProfile | null | undefined>
): PromptProfileLayerEntry[] => {
  const merged = mergePromptProfiles(...profiles);
  const entries: PromptProfileLayerEntry[] = [];

  for (const layer of PROMPT_PROFILE_LAYER_ORDER) {
    const text = normalizeOptionalPromptText(merged[layer]);
    if (!text) continue;
    entries.push({ layer, text });
  }

  return entries;
};

export const resolvePromptProfile = (
  ...profiles: Array<PromptProfile | null | undefined>
): string => {
  const layers = resolvePromptProfileLayers(...profiles);
  if (layers.length === 0) return "";
  return layers.map((entry) => entry.text).join("\n\n");
};
