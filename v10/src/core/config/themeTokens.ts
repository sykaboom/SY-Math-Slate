export const THEME_PRESET_IDS = ["chalk", "parchment", "notebook"] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = "chalk";

export const THEME_GLOBAL_TOKEN_KEYS = [
  "surface",
  "surface-soft",
  "surface-overlay",
  "text",
  "text-muted",
  "text-subtle",
  "border",
  "border-strong",
  "accent",
  "accent-soft",
  "accent-strong",
  "accent-text",
  "success",
  "success-soft",
  "warning",
  "warning-soft",
  "danger",
  "danger-soft",
] as const;

export type ThemeGlobalTokenKey = (typeof THEME_GLOBAL_TOKEN_KEYS)[number];

export const THEME_MODULE_TOKEN_KEYS = [
  "surface",
  "surface-soft",
  "text",
  "text-muted",
  "border",
  "accent",
  "accent-soft",
  "success",
  "warning",
  "danger",
] as const;

export type ThemeModuleTokenKey = (typeof THEME_MODULE_TOKEN_KEYS)[number];

export type ThemeGlobalTokenMap = Partial<Record<ThemeGlobalTokenKey, string>> &
  Record<string, string>;
export type ThemeModuleTokenMap = Partial<Record<ThemeModuleTokenKey, string>> &
  Record<string, string>;
export type ThemeModuleScopedTokenMap = Record<string, ThemeModuleTokenMap>;

const TOKEN_KEY_FALLBACK = "token";

const sanitizeTokenPart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const sanitizeThemeTokenKey = (value: string): string => {
  const sanitized = sanitizeTokenPart(value);
  return sanitized.length > 0 ? sanitized : TOKEN_KEY_FALLBACK;
};

export const sanitizeThemeModuleId = (value: string): string => {
  const sanitized = sanitizeTokenPart(value);
  return sanitized.length > 0 ? sanitized : TOKEN_KEY_FALLBACK;
};

export const isThemePresetId = (value: unknown): value is ThemePresetId =>
  typeof value === "string" &&
  (THEME_PRESET_IDS as readonly string[]).includes(value);

export const resolveThemePresetId = (
  value: unknown,
  fallback: ThemePresetId = DEFAULT_THEME_PRESET_ID
): ThemePresetId => {
  if (!isThemePresetId(value)) return fallback;
  return value;
};

const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((entry) => typeof entry === "string");
};

const normalizeStringRecord = (value: unknown): Record<string, string> => {
  if (!isStringRecord(value)) return {};
  const result: Record<string, string> = {};
  Object.entries(value).forEach(([key, rawValue]) => {
    const tokenKey = sanitizeThemeTokenKey(key);
    const tokenValue = rawValue.trim();
    if (tokenValue.length > 0) {
      result[tokenKey] = tokenValue;
    }
  });
  return result;
};

export const normalizeThemeGlobalTokenMap = (
  value: unknown
): ThemeGlobalTokenMap => normalizeStringRecord(value);

export const normalizeThemeModuleScopedTokenMap = (
  value: unknown
): ThemeModuleScopedTokenMap => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  const result: ThemeModuleScopedTokenMap = {};
  Object.entries(value).forEach(([moduleId, rawTokens]) => {
    const normalizedModuleId = sanitizeThemeModuleId(moduleId);
    const normalizedTokens = normalizeStringRecord(rawTokens);
    if (Object.keys(normalizedTokens).length > 0) {
      result[normalizedModuleId] = normalizedTokens;
    }
  });
  return result;
};
