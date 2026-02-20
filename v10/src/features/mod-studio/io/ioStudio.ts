import { validateRolePolicyPublishCandidate } from "@core/config/rolePolicy";
import {
  DEFAULT_THEME_PRESET_ID,
  isThemePresetId,
  normalizeThemeGlobalTokenMap,
  normalizeThemeModuleScopedTokenMap,
} from "@core/config/themeTokens";
import { migrateStudioConfigPayload } from "@core/migrations/modStudioMigration";
import { listKnownUISlotNames } from "@core/extensions/registry";
import type { StudioDraftBundle } from "@features/mod-studio/core/types";
import { getModuleDiagnostics } from "@features/mod-studio/modules/moduleDiagnostics";

type ImportResult =
  | { ok: true; value: StudioDraftBundle; migratedFrom: number | null }
  | { ok: false; error: string };

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasValidLayoutSlots = (layout: unknown): boolean => {
  if (!isPlainRecord(layout) || !Array.isArray(layout.slots)) return false;
  const knownSlots = new Set<string>(listKnownUISlotNames());
  return layout.slots.every((slot) => {
    if (!isPlainRecord(slot)) return false;
    if (typeof slot.slot !== "string" || !knownSlots.has(slot.slot)) return false;
    if (!Array.isArray(slot.moduleOrder)) return false;
    if (!slot.moduleOrder.every((entry) => typeof entry === "string")) return false;
    return typeof slot.hidden === "boolean";
  });
};

const hasValidModules = (modules: unknown): boolean => {
  if (!Array.isArray(modules)) return false;
  const knownSlots = new Set<string>(listKnownUISlotNames());
  return modules.every((module) => {
    if (!isPlainRecord(module)) return false;
    if (typeof module.id !== "string" || module.id.trim() === "") return false;
    if (typeof module.label !== "string") return false;
    if (typeof module.slot !== "string" || !knownSlots.has(module.slot)) return false;
    if (typeof module.enabled !== "boolean") return false;
    if (typeof module.order !== "number" || !Number.isFinite(module.order)) return false;
    if (!isPlainRecord(module.action)) return false;
    if (typeof module.action.commandId !== "string") return false;
    if (!isPlainRecord(module.action.payload)) return false;
    return true;
  });
};

const hasValidTheme = (theme: unknown): boolean => {
  if (!isPlainRecord(theme)) return false;
  if (!isPlainRecord(theme.globalTokens)) return false;
  if (!isPlainRecord(theme.moduleScopedTokens)) return false;
  const globalTokens = normalizeThemeGlobalTokenMap(theme.globalTokens);
  const moduleScopedTokens = normalizeThemeModuleScopedTokenMap(
    theme.moduleScopedTokens
  );
  const hasValidPreset =
    theme.presetId === undefined ||
    theme.presetId === null ||
    isThemePresetId(theme.presetId);
  return (
    hasValidPreset &&
    Object.values(globalTokens).every((value) => typeof value === "string") &&
    Object.values(moduleScopedTokens).every((tokens) =>
      Object.values(tokens).every((value) => typeof value === "string")
    )
  );
};

type LegacyTemplatePayload = {
  packId: string;
  title: string;
  description: string;
  defaultEnabled: boolean;
};

const hasValidTemplate = (
  template: unknown
): template is LegacyTemplatePayload => {
  if (!isPlainRecord(template)) return false;
  if (typeof template.packId !== "string" || template.packId.trim() === "") {
    return false;
  }
  if (typeof template.title !== "string" || template.title.trim() === "") {
    return false;
  }
  if (typeof template.description !== "string") return false;
  if (typeof template.defaultEnabled !== "boolean") return false;
  return true;
};

const normalizeTemplate = (
  template: unknown
): StudioDraftBundle["template"] => {
  if (hasValidTemplate(template)) {
    return {
      packId: template.packId.trim(),
      title: template.title.trim(),
      description: template.description.trim(),
      defaultEnabled: template.defaultEnabled,
    };
  }
  return {
    packId: "base-education",
    title: "Base Education Template",
    description: "",
    defaultEnabled: true,
  };
};

export const exportStudioDraftBundle = (bundle: StudioDraftBundle): string =>
  JSON.stringify(
    {
      version: 1,
      policy: bundle.policy,
      layout: bundle.layout,
      modules: bundle.modules,
      theme: bundle.theme,
      template: bundle.template,
    },
    null,
    2
  );

export const importStudioDraftBundle = (payloadText: string): ImportResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadText);
  } catch {
    return { ok: false, error: "invalid JSON syntax." };
  }

  const migrated = migrateStudioConfigPayload(parsed);
  if (!migrated.ok) return { ok: false, error: migrated.error };

  const policyCheck = validateRolePolicyPublishCandidate(migrated.value.policy);
  if (!policyCheck.ok) return { ok: false, error: policyCheck.error };

  if (!hasValidLayoutSlots(migrated.value.layout)) {
    return { ok: false, error: "invalid layout payload." };
  }
  if (!hasValidModules(migrated.value.modules)) {
    return { ok: false, error: "invalid modules payload." };
  }
  if (!hasValidTheme(migrated.value.theme)) {
    return { ok: false, error: "invalid theme payload." };
  }

  const modules = migrated.value.modules as StudioDraftBundle["modules"];
  const moduleDiagnostics = getModuleDiagnostics(modules);
  const blocking = moduleDiagnostics.find((entry) => entry.level === "error");
  if (blocking) {
    return { ok: false, error: `[${blocking.code}] ${blocking.message}` };
  }

  return {
    ok: true,
    migratedFrom: migrated.migratedFrom,
    value: {
      policy: policyCheck.value,
      layout: migrated.value.layout as StudioDraftBundle["layout"],
      modules,
      theme: (() => {
        const rawTheme = migrated.value.theme as Record<string, unknown>;
        return {
          presetId: isThemePresetId(rawTheme.presetId)
            ? rawTheme.presetId
            : DEFAULT_THEME_PRESET_ID,
          globalTokens: normalizeThemeGlobalTokenMap(rawTheme.globalTokens),
          moduleScopedTokens: normalizeThemeModuleScopedTokenMap(
            rawTheme.moduleScopedTokens
          ),
        } as StudioDraftBundle["theme"];
      })(),
      template: normalizeTemplate(
        (parsed as Record<string, unknown>).template ??
          (migrated.value as Record<string, unknown>).template
      ),
    },
  };
};
