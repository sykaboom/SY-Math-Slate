import {
  isKnownUISlotName,
  KNOWN_UI_SLOT_NAMES,
} from "@core/runtime/plugin-runtime/registry";
import {
  TEMPLATE_PACK_MANIFEST_VERSION,
  type TemplateActionSurfaceRule,
  type TemplatePackManifest,
} from "./templatePack.types";

export type TemplatePackValidationFailure = {
  ok: false;
  code:
    | "invalid-root"
    | "invalid-version"
    | "invalid-pack-id"
    | "invalid-title"
    | "invalid-kind"
    | "invalid-action-rules"
    | "invalid-layout"
    | "invalid-theme";
  path: string;
  message: string;
};

export type TemplatePackValidationSuccess = {
  ok: true;
  value: TemplatePackManifest;
};

export type TemplatePackValidationResult =
  | TemplatePackValidationFailure
  | TemplatePackValidationSuccess;

const fail = (
  code: TemplatePackValidationFailure["code"],
  path: string,
  message: string
): TemplatePackValidationFailure => ({ ok: false, code, path, message });

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidActionRule = (value: unknown): value is TemplateActionSurfaceRule => {
  if (!isPlainRecord(value)) return false;
  if (
    value.mode !== "draw" &&
    value.mode !== "playback" &&
    value.mode !== "canvas"
  ) {
    return false;
  }
  if (
    value.viewport !== "desktop" &&
    value.viewport !== "tablet" &&
    value.viewport !== "mobile"
  ) {
    return false;
  }
  if (typeof value.actionId !== "string" || value.actionId.trim() === "") {
    return false;
  }
  if (
    value.surface !== "primary" &&
    value.surface !== "more" &&
    value.surface !== "hidden"
  ) {
    return false;
  }
  return true;
};

const isValidToolbarMode = (value: unknown): value is "draw" | "playback" | "canvas" =>
  value === "draw" || value === "playback" || value === "canvas";

const isValidToolbarModeDefinition = (value: unknown): boolean => {
  if (!isPlainRecord(value)) return false;
  if (!isValidToolbarMode(value.id)) return false;
  if (typeof value.label !== "string" || value.label.trim() === "") return false;
  if (
    typeof value.fallbackModId !== "string" ||
    value.fallbackModId.trim() === ""
  ) {
    return false;
  }
  return true;
};

const isValidToolbarActionCatalogEntry = (value: unknown): boolean => {
  if (!isPlainRecord(value)) return false;
  if (typeof value.id !== "string" || value.id.trim() === "") return false;
  if (typeof value.label !== "string" || value.label.trim() === "") return false;
  if (!Array.isArray(value.modes) || value.modes.length === 0) return false;
  if (!value.modes.every(isValidToolbarMode)) return false;
  return true;
};

export const validateTemplatePackManifest = (
  value: unknown
): TemplatePackValidationResult => {
  if (!isPlainRecord(value)) {
    return fail("invalid-root", "manifest", "manifest must be a plain object.");
  }

  if (value.manifestVersion !== TEMPLATE_PACK_MANIFEST_VERSION) {
    return fail(
      "invalid-version",
      "manifest.manifestVersion",
      `manifestVersion must be ${TEMPLATE_PACK_MANIFEST_VERSION}.`
    );
  }

  if (typeof value.packId !== "string" || value.packId.trim() === "") {
    return fail("invalid-pack-id", "manifest.packId", "packId must be a string.");
  }

  if (typeof value.title !== "string" || value.title.trim() === "") {
    return fail("invalid-title", "manifest.title", "title must be a string.");
  }

  if (value.kind !== "base" && value.kind !== "custom") {
    return fail("invalid-kind", "manifest.kind", "kind must be 'base' or 'custom'.");
  }

  const toolbar = value.toolbar;
  if (!isPlainRecord(toolbar)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar",
      "toolbar must be an object."
    );
  }

  if (!Array.isArray(toolbar.modeDefinitions)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar.modeDefinitions",
      "toolbar.modeDefinitions must be an array."
    );
  }
  if (!toolbar.modeDefinitions.every(isValidToolbarModeDefinition)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar.modeDefinitions",
      "all toolbar.modeDefinitions entries must be valid."
    );
  }

  if (!Array.isArray(toolbar.actionCatalog)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar.actionCatalog",
      "toolbar.actionCatalog must be an array."
    );
  }
  if (!toolbar.actionCatalog.every(isValidToolbarActionCatalogEntry)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar.actionCatalog",
      "all toolbar.actionCatalog entries must be valid."
    );
  }

  if (!Array.isArray(toolbar.actionSurfaceRules)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar.actionSurfaceRules",
      "toolbar.actionSurfaceRules must be an array."
    );
  }
  if (!toolbar.actionSurfaceRules.every(isValidActionRule)) {
    return fail(
      "invalid-action-rules",
      "manifest.toolbar.actionSurfaceRules",
      "all toolbar.actionSurfaceRules entries must be valid."
    );
  }

  if (!Array.isArray(value.layout)) {
    return fail("invalid-layout", "manifest.layout", "layout must be an array.");
  }
  const validLayout = value.layout.every((slot) => {
    if (!isPlainRecord(slot)) return false;
    if (!isKnownUISlotName(slot.slot)) return false;
    if (!Array.isArray(slot.moduleOrder)) return false;
    if (!slot.moduleOrder.every((moduleId) => typeof moduleId === "string")) {
      return false;
    }
    if (typeof slot.hidden !== "boolean") return false;

    // Defensive: keep path deterministic for debugging.
    if (!KNOWN_UI_SLOT_NAMES.includes(slot.slot)) {
      return false;
    }
    return true;
  });
  if (!validLayout) {
    return fail(
      "invalid-layout",
      "manifest.layout",
      "layout entries must use known slots and include moduleOrder/hidden."
    );
  }

  if (value.slotComponents !== undefined) {
    if (!Array.isArray(value.slotComponents)) {
      return fail(
        "invalid-layout",
        "manifest.slotComponents",
        "slotComponents must be an array."
      );
    }
    const validSlotComponents = value.slotComponents.every((entry) => {
      if (!isPlainRecord(entry)) return false;
      if (typeof entry.id !== "string" || entry.id.trim() === "") return false;
      if (!isKnownUISlotName(entry.slot)) return false;
      if (typeof entry.component !== "function") return false;
      return true;
    });
    if (!validSlotComponents) {
      return fail(
        "invalid-layout",
        "manifest.slotComponents",
        "slotComponents entries must include id/slot/component function."
      );
    }
  }

  if (value.theme !== undefined) {
    if (!isPlainRecord(value.theme)) {
      return fail("invalid-theme", "manifest.theme", "theme must be an object.");
    }
    if (
      value.theme.globalTokens !== undefined &&
      !isPlainRecord(value.theme.globalTokens)
    ) {
      return fail(
        "invalid-theme",
        "manifest.theme.globalTokens",
        "theme.globalTokens must be a record."
      );
    }
    if (
      value.theme.moduleScopedTokens !== undefined &&
      !isPlainRecord(value.theme.moduleScopedTokens)
    ) {
      return fail(
        "invalid-theme",
        "manifest.theme.moduleScopedTokens",
        "theme.moduleScopedTokens must be a record."
      );
    }
  }

  return { ok: true, value: value as TemplatePackManifest };
};

export const isTemplatePackManifest = (
  value: unknown
): value is TemplatePackManifest => validateTemplatePackManifest(value).ok;
