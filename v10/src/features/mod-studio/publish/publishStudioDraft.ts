import {
  getRolePolicyDocument,
  publishRolePolicyDocument,
  validateRolePolicyPublishCandidate,
  type RolePolicyPublishResult,
} from "@core/config/rolePolicy";
import {
  listDeclarativePluginManifests,
  registerDeclarativePluginManifest,
  validateDeclarativePluginManifest,
  type DeclarativePluginManifestV1,
  type JsonValue,
} from "@core/extensions/pluginLoader";
import {
  applyThemeDraftPreview,
  toGlobalThemeVariable,
  toModuleScopedThemeVariable,
} from "@features/mod-studio/theme/themeIsolation";
import type {
  LayoutDraft,
  ModuleDraft,
  StudioDraftBundle,
  StudioPublishResult,
  StudioSnapshot,
  ThemeDraft,
} from "@features/mod-studio/core/types";
import { getModuleDiagnostics } from "@features/mod-studio/modules/moduleDiagnostics";

const STUDIO_RUNTIME_PLUGIN_ID = "mod-studio-runtime";

const cloneBundle = (bundle: StudioDraftBundle): StudioDraftBundle =>
  JSON.parse(JSON.stringify(bundle));

const findRuntimeManifest = (): DeclarativePluginManifestV1 | null =>
  listDeclarativePluginManifests().find(
    (manifest) => manifest.pluginId === STUDIO_RUNTIME_PLUGIN_ID
  ) ?? null;

const toJsonValue = (value: unknown): JsonValue => {
  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return {};
  }
};

const buildManifestFromDraft = (
  modules: ModuleDraft[],
  layout: LayoutDraft
): DeclarativePluginManifestV1 => {
  const hiddenSlots = new Set(
    layout.slots.filter((slot) => slot.hidden).map((slot) => slot.slot)
  );
  const explicitOrder = new Map<string, number>();
  layout.slots.forEach((slot) => {
    slot.moduleOrder.forEach((moduleId, index) => {
      explicitOrder.set(`${slot.slot}:${moduleId}`, index);
    });
  });

  const sorted = modules
    .filter((module) => module.enabled && !hiddenSlots.has(module.slot))
    .slice()
    .sort((left, right) => {
      const leftOrder = explicitOrder.get(`${left.slot}:${left.id}`);
      const rightOrder = explicitOrder.get(`${right.slot}:${right.id}`);
      if (leftOrder !== undefined && rightOrder !== undefined) {
        return leftOrder - rightOrder;
      }
      if (leftOrder !== undefined) return -1;
      if (rightOrder !== undefined) return 1;
      return left.order - right.order;
    });

  return {
    manifestVersion: 1,
    pluginId: STUDIO_RUNTIME_PLUGIN_ID,
    ui: sorted.map((module) => ({
      id: module.id,
      slot: module.slot,
      type: "button",
      props: {
        label: module.label,
        icon: module.icon,
        disabled: !module.enabled,
      },
      action: {
        commandId: module.action.commandId,
        payload: toJsonValue(module.action.payload),
      },
    })),
  };
};

const applyThemeDraft = (themeDraft: ThemeDraft): void => {
  applyThemeDraftPreview(themeDraft.globalTokens, themeDraft.moduleScopedTokens);
};

export type StudioPublishPreflightResult =
  | { ok: true; manifest: DeclarativePluginManifestV1 }
  | { ok: false; message: string };

export const preflightStudioPublish = (
  bundle: StudioDraftBundle
): StudioPublishPreflightResult => {
  const moduleDiagnostics = getModuleDiagnostics(bundle.modules);
  const blocking = moduleDiagnostics.find((entry) => entry.level === "error");
  if (blocking) {
    return { ok: false, message: `[${blocking.code}] ${blocking.message}` };
  }

  const manifest = buildManifestFromDraft(bundle.modules, bundle.layout);
  const manifestValidation = validateDeclarativePluginManifest(manifest);
  if (!manifestValidation.ok) {
    return {
      ok: false,
      message: `${manifestValidation.code}: ${manifestValidation.message}`,
    };
  }

  const policyValidation: RolePolicyPublishResult =
    validateRolePolicyPublishCandidate(bundle.policy);
  if (!policyValidation.ok) {
    return { ok: false, message: policyValidation.error };
  }

  return { ok: true, manifest };
};

export const publishStudioDraftBundle = (
  bundle: StudioDraftBundle
): StudioPublishResult => {
  const preflight = preflightStudioPublish(bundle);
  if (!preflight.ok) return { ok: false, message: preflight.message };

  const publishPolicy = publishRolePolicyDocument(bundle.policy);
  if (!publishPolicy.ok) {
    return { ok: false, message: publishPolicy.error };
  }

  const registration = registerDeclarativePluginManifest(preflight.manifest);
  if (!registration.ok) {
    return {
      ok: false,
      message: `${registration.code}: ${registration.message}`,
    };
  }

  applyThemeDraft(bundle.theme);
  return {
    ok: true,
    message: registration.replaced
      ? "studio publish updated existing runtime manifest"
      : "studio publish created runtime manifest",
  };
};

export const createStudioSnapshot = (
  reason: string,
  draft: StudioDraftBundle
): StudioSnapshot => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `studio-snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  createdAt: Date.now(),
  reason,
  bundle: cloneBundle({
    policy: getRolePolicyDocument(),
    layout: draft.layout,
    modules: (() => {
      const runtimeManifest = findRuntimeManifest();
      if (!runtimeManifest) return draft.modules;
      return draft.modules.map((module) => ({
        ...module,
        enabled: runtimeManifest.ui.some((entry) => entry.id === module.id),
      }));
    })(),
    theme: draft.theme,
  }),
});

export const rollbackStudioSnapshot = (
  snapshot: StudioSnapshot
): StudioPublishResult => {
  return publishStudioDraftBundle(snapshot.bundle);
};

export const exportThemeVariables = (
  theme: ThemeDraft
): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(theme.globalTokens).forEach(([tokenKey, value]) => {
    result[toGlobalThemeVariable(tokenKey)] = value;
  });
  Object.entries(theme.moduleScopedTokens).forEach(([moduleId, tokens]) => {
    Object.entries(tokens).forEach(([tokenKey, value]) => {
      result[toModuleScopedThemeVariable(moduleId, tokenKey)] = value;
    });
  });
  return result;
};
