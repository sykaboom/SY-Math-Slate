import {
  THEME_GLOBAL_TOKEN_KEYS,
  normalizeThemeGlobalTokenMap,
  normalizeThemeModuleScopedTokenMap,
  type ThemeGlobalTokenMap,
  type ThemeModuleScopedTokenMap,
} from "@core/ui/theming/tokens/themeTokens";

export const THEME_JSON_SCHEMA_MARKER = "1" as const;

export type ThemeJsonDocument = {
  syMathSlateTheme: typeof THEME_JSON_SCHEMA_MARKER;
  label: string;
  description: string;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
};

type ThemeJsonValidationSuccess = {
  ok: true;
  value: ThemeJsonDocument;
};

type ThemeJsonValidationFailure = {
  ok: false;
  error: string;
};

export type ThemeJsonValidationResult =
  | ThemeJsonValidationSuccess
  | ThemeJsonValidationFailure;

export type SerializeThemeJsonInput = {
  label: string;
  description: string;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
};

export type SerializeThemeJsonResult =
  | {
      ok: true;
      value: ThemeJsonDocument;
      json: string;
    }
  | {
      ok: false;
      error: string;
    };

const FALLBACK_THEME_LABEL = "Imported Theme";
const FALLBACK_THEME_DESCRIPTION = "";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeLabel = (value: unknown): string => {
  if (typeof value !== "string") return FALLBACK_THEME_LABEL;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : FALLBACK_THEME_LABEL;
};

const normalizeDescription = (value: unknown): string => {
  if (typeof value !== "string") return FALLBACK_THEME_DESCRIPTION;
  return value.trim();
};

const normalizeRequiredGlobalTokens = (
  value: unknown
): ThemeGlobalTokenMap | null => {
  const normalized = normalizeThemeGlobalTokenMap(value);
  const requiredTokens: ThemeGlobalTokenMap = {};

  for (const tokenKey of THEME_GLOBAL_TOKEN_KEYS) {
    const tokenValue = normalized[tokenKey];
    if (typeof tokenValue !== "string") return null;
    const trimmedValue = tokenValue.trim();
    if (trimmedValue.length === 0) return null;
    requiredTokens[tokenKey] = trimmedValue;
  }

  return requiredTokens;
};

const normalizeThemeJsonDocument = (value: unknown): ThemeJsonDocument | null => {
  if (!isRecord(value)) return null;
  if (value.syMathSlateTheme !== THEME_JSON_SCHEMA_MARKER) return null;

  const globalTokens = normalizeRequiredGlobalTokens(value.globalTokens);
  if (!globalTokens) return null;

  return {
    syMathSlateTheme: THEME_JSON_SCHEMA_MARKER,
    label: normalizeLabel(value.label),
    description: normalizeDescription(value.description),
    globalTokens,
    moduleScopedTokens: normalizeThemeModuleScopedTokenMap(value.moduleScopedTokens),
  };
};

export const validateThemeJson = (value: unknown): ThemeJsonValidationResult => {
  const normalized = normalizeThemeJsonDocument(value);
  if (!normalized) {
    return {
      ok: false,
      error:
        'Invalid theme JSON. Expected schema marker `syMathSlateTheme: "1"` and all required global tokens.',
    };
  }
  return { ok: true, value: normalized };
};

export const parseThemeJsonText = (rawText: string): ThemeJsonValidationResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      error: "Invalid JSON file. Import was not applied.",
    };
  }

  return validateThemeJson(parsed);
};

export const serializeThemeJson = (
  input: SerializeThemeJsonInput
): SerializeThemeJsonResult => {
  const document: ThemeJsonDocument = {
    syMathSlateTheme: THEME_JSON_SCHEMA_MARKER,
    label: normalizeLabel(input.label),
    description: normalizeDescription(input.description),
    globalTokens: normalizeThemeGlobalTokenMap(input.globalTokens),
    moduleScopedTokens: normalizeThemeModuleScopedTokenMap(input.moduleScopedTokens),
  };

  const validated = validateThemeJson(document);
  if (!validated.ok) {
    return {
      ok: false,
      error: validated.error,
    };
  }

  return {
    ok: true,
    value: validated.value,
    json: JSON.stringify(validated.value, null, 2),
  };
};

const sanitizeFilenamePart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const toThemeJsonFilename = (label: string): string => {
  const normalized = sanitizeFilenamePart(label);
  const stem = normalized.length > 0 ? normalized : "custom-theme";
  return `sy-math-slate-theme-${stem}.json`;
};
