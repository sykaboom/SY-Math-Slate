export const STUDIO_CONFIG_VERSION = 1 as const;

export type StudioConfigPayloadV1 = {
  version: typeof STUDIO_CONFIG_VERSION;
  policy: unknown;
  layout: unknown;
  modules: unknown;
  theme: unknown;
};

export type StudioConfigMigrationResult =
  | { ok: true; value: StudioConfigPayloadV1; migratedFrom: number | null }
  | { ok: false; error: string };

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const migrateStudioConfigPayload = (
  input: unknown
): StudioConfigMigrationResult => {
  if (!isPlainRecord(input)) {
    return { ok: false, error: "studio payload must be a plain object." };
  }

  const rawVersion = input.version;
  const version = typeof rawVersion === "number" ? Math.floor(rawVersion) : 0;

  if (version === STUDIO_CONFIG_VERSION) {
    if (
      !("policy" in input) ||
      !("layout" in input) ||
      !("modules" in input) ||
      !("theme" in input)
    ) {
      return {
        ok: false,
        error: "studio payload v1 must include policy/layout/modules/theme.",
      };
    }
    return {
      ok: true,
      value: {
        version: STUDIO_CONFIG_VERSION,
        policy: input.policy,
        layout: input.layout,
        modules: input.modules,
        theme: input.theme,
      },
      migratedFrom: null,
    };
  }

  if (version === 0) {
    const policy = input.policyDoc ?? input.policy;
    const layout = input.layoutSlots ?? input.layout;
    const modules = input.moduleList ?? input.modules;
    const theme = input.themeTokens ?? input.theme;
    if (
      policy === undefined ||
      layout === undefined ||
      modules === undefined ||
      theme === undefined
    ) {
      return {
        ok: false,
        error:
          "legacy studio payload missing required keys (policyDoc/layoutSlots/moduleList/themeTokens).",
      };
    }
    return {
      ok: true,
      value: {
        version: STUDIO_CONFIG_VERSION,
        policy,
        layout,
        modules,
        theme,
      },
      migratedFrom: 0,
    };
  }

  return {
    ok: false,
    error: `unsupported studio payload version: ${version}.`,
  };
};
