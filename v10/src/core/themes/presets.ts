import {
  DEFAULT_THEME_PRESET_ID,
  THEME_PRESET_IDS,
  normalizeThemeGlobalTokenMap,
  normalizeThemeModuleScopedTokenMap,
  resolveThemePresetId,
  type ThemeModuleScopedTokenMap,
  type ThemePresetId,
  type ThemeGlobalTokenMap,
} from "@core/config/themeTokens";

export type ThemePresetDefinition = {
  id: ThemePresetId;
  label: string;
  description: string;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
};

export const CUSTOM_THEME_PRESET_STORAGE_KEY = "sy_custom_presets";
export const CUSTOM_THEME_PRESET_UPDATED_EVENT = "sy-custom-presets-updated";

export type CustomThemePresetDefinition = {
  id: string;
  label: string;
  description: string;
  basePresetId: ThemePresetId;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
  createdAt: number;
  updatedAt: number;
};

export type SaveCustomThemePresetInput = {
  id?: string;
  label: string;
  description?: string;
  basePresetId?: ThemePresetId;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
};

const THEME_PRESETS: Record<ThemePresetId, ThemePresetDefinition> = {
  chalk: {
    id: "chalk",
    label: "Chalkboard",
    description: "Dark board with neon ink contrast.",
    globalTokens: {
      surface: "rgba(15, 23, 42, 0.92)",
      "surface-soft": "rgba(255, 255, 255, 0.06)",
      "surface-overlay": "rgba(2, 6, 23, 0.94)",
      text: "rgba(255, 255, 255, 0.95)",
      "text-muted": "rgba(203, 213, 225, 0.8)",
      "text-subtle": "rgba(148, 163, 184, 0.62)",
      border: "rgba(255, 255, 255, 0.16)",
      "border-strong": "rgba(255, 255, 255, 0.32)",
      accent: "rgba(56, 189, 248, 1)",
      "accent-soft": "rgba(56, 189, 248, 0.18)",
      "accent-strong": "rgba(56, 189, 248, 0.36)",
      "accent-text": "rgba(8, 15, 30, 0.98)",
      success: "rgba(16, 185, 129, 1)",
      "success-soft": "rgba(16, 185, 129, 0.18)",
      warning: "rgba(251, 191, 36, 1)",
      "warning-soft": "rgba(251, 191, 36, 0.18)",
      danger: "rgba(244, 63, 94, 1)",
      "danger-soft": "rgba(244, 63, 94, 0.18)",
    },
    moduleScopedTokens: {
      "core-toolbar": {
        surface: "rgba(15, 23, 42, 0.9)",
        text: "rgba(255, 255, 255, 0.92)",
        border: "rgba(255, 255, 255, 0.14)",
        accent: "rgba(255, 255, 0, 1)",
        chip: "rgba(255, 255, 255, 1)",
        "menu-bg": "rgba(0, 0, 0, 1)",
      },
      "mod-studio": {
        surface: "rgba(2, 6, 23, 0.9)",
        text: "rgba(226, 232, 240, 0.95)",
        border: "rgba(148, 163, 184, 0.32)",
      },
    },
  },
  parchment: {
    id: "parchment",
    label: "Parchment",
    description: "Warm paper surface with ink accents.",
    globalTokens: {
      surface: "rgba(245, 234, 208, 0.95)",
      "surface-soft": "rgba(255, 248, 230, 0.82)",
      "surface-overlay": "rgba(231, 217, 183, 0.96)",
      text: "rgba(60, 42, 20, 0.94)",
      "text-muted": "rgba(92, 65, 34, 0.78)",
      "text-subtle": "rgba(116, 84, 46, 0.62)",
      border: "rgba(120, 88, 50, 0.24)",
      "border-strong": "rgba(120, 88, 50, 0.42)",
      accent: "rgba(182, 110, 48, 1)",
      "accent-soft": "rgba(182, 110, 48, 0.2)",
      "accent-strong": "rgba(182, 110, 48, 0.36)",
      "accent-text": "rgba(248, 241, 222, 0.98)",
      success: "rgba(34, 139, 88, 1)",
      "success-soft": "rgba(34, 139, 88, 0.2)",
      warning: "rgba(199, 122, 30, 1)",
      "warning-soft": "rgba(199, 122, 30, 0.2)",
      danger: "rgba(175, 66, 66, 1)",
      "danger-soft": "rgba(175, 66, 66, 0.2)",
    },
    moduleScopedTokens: {
      "core-toolbar": {
        surface: "rgba(236, 223, 188, 0.9)",
        text: "rgba(58, 42, 24, 0.92)",
        border: "rgba(120, 88, 50, 0.24)",
        accent: "rgba(176, 106, 45, 1)",
        chip: "rgba(148, 163, 184, 1)",
        "menu-bg": "rgba(255, 255, 255, 1)",
      },
      "mod-studio": {
        surface: "rgba(240, 229, 199, 0.9)",
        text: "rgba(64, 46, 24, 0.95)",
        border: "rgba(120, 88, 50, 0.28)",
      },
    },
  },
  notebook: {
    id: "notebook",
    label: "Notebook",
    description: "Neutral paper with blue-lined accents.",
    globalTokens: {
      surface: "rgba(248, 250, 255, 0.95)",
      "surface-soft": "rgba(255, 255, 255, 0.86)",
      "surface-overlay": "rgba(236, 242, 255, 0.96)",
      text: "rgba(20, 35, 70, 0.94)",
      "text-muted": "rgba(49, 74, 124, 0.78)",
      "text-subtle": "rgba(91, 119, 170, 0.64)",
      border: "rgba(120, 148, 201, 0.24)",
      "border-strong": "rgba(120, 148, 201, 0.4)",
      accent: "rgba(37, 99, 235, 1)",
      "accent-soft": "rgba(37, 99, 235, 0.18)",
      "accent-strong": "rgba(37, 99, 235, 0.34)",
      "accent-text": "rgba(241, 246, 255, 0.98)",
      success: "rgba(5, 150, 105, 1)",
      "success-soft": "rgba(5, 150, 105, 0.2)",
      warning: "rgba(217, 119, 6, 1)",
      "warning-soft": "rgba(217, 119, 6, 0.2)",
      danger: "rgba(220, 38, 38, 1)",
      "danger-soft": "rgba(220, 38, 38, 0.2)",
    },
    moduleScopedTokens: {
      "core-toolbar": {
        surface: "rgba(233, 241, 255, 0.9)",
        text: "rgba(26, 52, 110, 0.92)",
        border: "rgba(120, 148, 201, 0.26)",
        accent: "rgba(30, 64, 175, 1)",
        chip: "rgba(120, 148, 201, 1)",
        "menu-bg": "rgba(20, 35, 70, 1)",
      },
      "mod-studio": {
        surface: "rgba(228, 237, 254, 0.92)",
        text: "rgba(25, 48, 97, 0.95)",
        border: "rgba(120, 148, 201, 0.3)",
      },
    },
  },
};

const cloneTokenMap = (
  tokens: Record<string, string>
): Record<string, string> => ({ ...tokens });

const cloneModuleScopedTokens = (
  moduleScopedTokens: ThemeModuleScopedTokenMap
): ThemeModuleScopedTokenMap => {
  const next: ThemeModuleScopedTokenMap = {};
  Object.entries(moduleScopedTokens).forEach(([moduleId, tokens]) => {
    next[moduleId] = cloneTokenMap(tokens);
  });
  return next;
};

const clonePreset = (preset: ThemePresetDefinition): ThemePresetDefinition => ({
  ...preset,
  globalTokens: cloneTokenMap(preset.globalTokens),
  moduleScopedTokens: cloneModuleScopedTokens(preset.moduleScopedTokens),
});

const cloneCustomPreset = (
  preset: CustomThemePresetDefinition
): CustomThemePresetDefinition => ({
  ...preset,
  globalTokens: cloneTokenMap(preset.globalTokens),
  moduleScopedTokens: cloneModuleScopedTokens(preset.moduleScopedTokens),
});

const RESERVED_PRESET_IDS = new Set<string>(THEME_PRESET_IDS);
const FALLBACK_CUSTOM_LABEL = "Custom preset";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const toCustomPresetId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;
};

const normalizePresetLabel = (value: unknown): string => {
  if (typeof value !== "string") return FALLBACK_CUSTOM_LABEL;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_CUSTOM_LABEL;
};

const normalizePresetDescription = (
  value: unknown,
  basePresetId: ThemePresetId
): string => {
  if (typeof value !== "string") return `Custom preset based on ${basePresetId}.`;
  const trimmed = value.trim();
  if (trimmed.length > 0) return trimmed;
  return `Custom preset based on ${basePresetId}.`;
};

const normalizeTimestamp = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeCustomPreset = (
  value: unknown,
  fallbackIndex: number
): CustomThemePresetDefinition | null => {
  if (!isRecord(value)) return null;

  const basePresetId = resolveThemePresetId(value.basePresetId, DEFAULT_THEME_PRESET_ID);
  const now = Date.now();
  const idCandidate =
    typeof value.id === "string" && value.id.trim().length > 0
      ? value.id.trim()
      : `custom-${fallbackIndex + 1}`;
  if (RESERVED_PRESET_IDS.has(idCandidate)) return null;

  return {
    id: idCandidate,
    label: normalizePresetLabel(value.label),
    description: normalizePresetDescription(value.description, basePresetId),
    basePresetId,
    globalTokens: normalizeThemeGlobalTokenMap(value.globalTokens),
    moduleScopedTokens: normalizeThemeModuleScopedTokenMap(value.moduleScopedTokens),
    createdAt: normalizeTimestamp(value.createdAt, now),
    updatedAt: normalizeTimestamp(value.updatedAt, now),
  };
};

const readCustomPresetsFromStorage = (
  storage: Storage | null = getStorage()
): CustomThemePresetDefinition[] => {
  if (!storage) return [];

  const raw = storage.getItem(CUSTOM_THEME_PRESET_STORAGE_KEY);
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seenIds = new Set<string>();
  const presets: CustomThemePresetDefinition[] = [];
  parsed.forEach((entry, index) => {
    const normalized = normalizeCustomPreset(entry, index);
    if (!normalized) return;
    if (seenIds.has(normalized.id)) return;
    seenIds.add(normalized.id);
    presets.push(normalized);
  });
  return presets;
};

const writeCustomPresetsToStorage = (
  presets: CustomThemePresetDefinition[],
  storage: Storage | null = getStorage()
): boolean => {
  if (!storage) return false;
  try {
    storage.setItem(CUSTOM_THEME_PRESET_STORAGE_KEY, JSON.stringify(presets));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CUSTOM_THEME_PRESET_UPDATED_EVENT));
    }
    return true;
  } catch {
    return false;
  }
};

export const listThemePresets = (): ThemePresetDefinition[] =>
  Object.values(THEME_PRESETS).map(clonePreset);

export const getThemePreset = (
  presetId: unknown = DEFAULT_THEME_PRESET_ID
): ThemePresetDefinition => {
  const resolvedPreset = resolveThemePresetId(presetId, DEFAULT_THEME_PRESET_ID);
  return clonePreset(THEME_PRESETS[resolvedPreset]);
};

export const listCustomThemePresets = (): CustomThemePresetDefinition[] =>
  readCustomPresetsFromStorage().map(cloneCustomPreset);

export const getCustomThemePreset = (
  presetId: string
): CustomThemePresetDefinition | null => {
  const normalizedId = presetId.trim();
  if (!normalizedId || RESERVED_PRESET_IDS.has(normalizedId)) return null;
  const preset = readCustomPresetsFromStorage().find((entry) => entry.id === normalizedId);
  return preset ? cloneCustomPreset(preset) : null;
};

export const saveCustomThemePreset = (
  input: SaveCustomThemePresetInput
): CustomThemePresetDefinition | null => {
  const storage = getStorage();
  if (!storage) return null;

  const existing = readCustomPresetsFromStorage(storage);
  const now = Date.now();
  const requestedId = input.id?.trim() ?? "";
  const canUseRequestedId =
    requestedId.length > 0 && !RESERVED_PRESET_IDS.has(requestedId);
  const nextId = canUseRequestedId ? requestedId : toCustomPresetId();
  const existingPreset = existing.find((entry) => entry.id === nextId);
  const basePresetId = resolveThemePresetId(input.basePresetId, DEFAULT_THEME_PRESET_ID);
  const nextPreset: CustomThemePresetDefinition = {
    id: nextId,
    label: normalizePresetLabel(input.label),
    description: normalizePresetDescription(input.description, basePresetId),
    basePresetId,
    globalTokens: normalizeThemeGlobalTokenMap(input.globalTokens),
    moduleScopedTokens: normalizeThemeModuleScopedTokenMap(input.moduleScopedTokens),
    createdAt: existingPreset?.createdAt ?? now,
    updatedAt: now,
  };

  const existingIndex = existing.findIndex((entry) => entry.id === nextId);
  const nextPresets =
    existingIndex >= 0
      ? existing.map((entry, index) => (index === existingIndex ? nextPreset : entry))
      : [...existing, nextPreset];
  const written = writeCustomPresetsToStorage(nextPresets, storage);
  if (!written) return null;

  return cloneCustomPreset(nextPreset);
};

export const deleteCustomThemePreset = (presetId: string): boolean => {
  const normalizedId = presetId.trim();
  if (!normalizedId || RESERVED_PRESET_IDS.has(normalizedId)) return false;

  const storage = getStorage();
  if (!storage) return false;

  const existing = readCustomPresetsFromStorage(storage);
  const nextPresets = existing.filter((entry) => entry.id !== normalizedId);
  if (nextPresets.length === existing.length) return false;
  return writeCustomPresetsToStorage(nextPresets, storage);
};
