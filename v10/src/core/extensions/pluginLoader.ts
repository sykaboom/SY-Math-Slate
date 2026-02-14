import { getAppCommandById } from "@core/engine/commandBus";
import { isKnownUISlotName, type UISlotName } from "./registry";

const MANIFEST_VERSION = 1 as const;
const MAX_JSON_DEPTH = 8;
const MAX_JSON_NODES = 512;
const MAX_JSON_BYTES = 16_384;

const DANGEROUS_HTML_FIELD_NAMES = new Set([
  "html",
  "innerHTML",
  "__html",
  "dangerouslySetInnerHTML",
]);

const ALLOWED_MANIFEST_KEYS = new Set(["manifestVersion", "pluginId", "ui"]);
const ALLOWED_UI_ENTRY_KEYS = new Set(["id", "slot", "type", "props", "action"]);
const ALLOWED_UI_PROP_KEYS = new Set(["label", "icon", "disabled"]);
const ALLOWED_ACTION_KEYS = new Set(["commandId", "payload", "context"]);

export type DeclarativeUIType = "button" | "panel";

export type DeclarativeUIProps = {
  label?: string;
  icon?: string;
  disabled?: boolean;
};

export type DeclarativeCommandEnvelope = {
  commandId: string;
  payload?: JsonValue;
  context?: JsonValue;
};

export type DeclarativeUIEntry = {
  id: string;
  slot: UISlotName;
  type: DeclarativeUIType;
  props?: DeclarativeUIProps;
  action?: DeclarativeCommandEnvelope;
};

export type DeclarativePluginManifestV1 = {
  manifestVersion: typeof MANIFEST_VERSION;
  pluginId: string;
  ui: DeclarativeUIEntry[];
};

export type PluginManifestV1 = DeclarativePluginManifestV1;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type PluginManifestValidationCode =
  | "invalid-manifest-root"
  | "invalid-manifest-key"
  | "invalid-manifest-version"
  | "invalid-plugin-id"
  | "invalid-ui-array"
  | "invalid-ui-entry"
  | "invalid-ui-entry-key"
  | "invalid-ui-id"
  | "invalid-ui-slot"
  | "invalid-ui-type"
  | "invalid-ui-props"
  | "invalid-ui-props-key"
  | "invalid-ui-props-value"
  | "invalid-ui-action"
  | "invalid-ui-action-key"
  | "invalid-command-id"
  | "unknown-command-id"
  | "invalid-json-key"
  | "invalid-json-value"
  | "invalid-json-number"
  | "invalid-json-object"
  | "invalid-json-cycle"
  | "json-depth-exceeded"
  | "json-node-limit-exceeded"
  | "json-size-exceeded";

export type PluginManifestValidationError = {
  ok: false;
  code: PluginManifestValidationCode;
  path: string;
  message: string;
};

export type PluginManifestRegisterSuccess = {
  ok: true;
  value: DeclarativePluginManifestV1;
  replaced: boolean;
};

export type PluginManifestRegisterResult =
  | PluginManifestRegisterSuccess
  | PluginManifestValidationError;

export type DeclarativeSlotContribution = DeclarativeUIEntry & {
  pluginId: string;
  contributionId: string;
};

const manifestRegistry = new Map<string, DeclarativePluginManifestV1>();
const manifestRegistryListeners = new Set<() => void>();
let manifestRegistryVersion = 0;

type JsonValidationState = {
  depth: number;
  nodes: number;
  seen: WeakSet<object>;
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const toDeterministicSortedKeys = (input: Record<string, unknown>): string[] =>
  Object.keys(input).sort();

const fail = (
  code: PluginManifestValidationCode,
  path: string,
  message: string
): PluginManifestValidationError => ({ ok: false, code, path, message });

const notifyManifestRegistryUpdated = (): void => {
  manifestRegistryVersion += 1;
  manifestRegistryListeners.forEach((listener) => listener());
};

const validateAllowedKeys = (
  candidate: Record<string, unknown>,
  allowlist: ReadonlySet<string>,
  path: string,
  code: PluginManifestValidationCode
): PluginManifestValidationError | null => {
  const sortedKeys = toDeterministicSortedKeys(candidate);
  for (const key of sortedKeys) {
    if (!allowlist.has(key)) {
      return fail(code, `${path}.${key}`, `field '${key}' is not allowed.`);
    }
  }
  return null;
};

const validateJsonValue = (
  value: unknown,
  path: string,
  state: JsonValidationState
): PluginManifestValidationError | null => {
  if (state.depth > MAX_JSON_DEPTH) {
    return fail(
      "json-depth-exceeded",
      path,
      `maximum JSON depth (${MAX_JSON_DEPTH}) exceeded.`
    );
  }

  if (value === null) return null;

  const valueType = typeof value;
  if (valueType === "string" || valueType === "boolean") return null;

  if (valueType === "number") {
    if (!Number.isFinite(value)) {
      return fail("invalid-json-number", path, "number must be finite.");
    }
    return null;
  }

  if (valueType !== "object") {
    return fail("invalid-json-value", path, "value must be JSON-serializable.");
  }

  const obj = value as object;
  if (state.seen.has(obj)) {
    return fail("invalid-json-cycle", path, "cyclic structures are not allowed.");
  }

  state.nodes += 1;
  if (state.nodes > MAX_JSON_NODES) {
    return fail(
      "json-node-limit-exceeded",
      path,
      `maximum node count (${MAX_JSON_NODES}) exceeded.`
    );
  }

  state.seen.add(obj);

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const nestedState: JsonValidationState = {
        depth: state.depth + 1,
        nodes: state.nodes,
        seen: state.seen,
      };
      const nested = validateJsonValue(value[index], `${path}[${index}]`, nestedState);
      state.nodes = nestedState.nodes;
      if (nested) {
        state.seen.delete(obj);
        return nested;
      }
    }
    state.seen.delete(obj);
    return null;
  }

  if (!isPlainRecord(value)) {
    state.seen.delete(obj);
    return fail("invalid-json-object", path, "object must be a plain JSON object.");
  }

  const sortedKeys = toDeterministicSortedKeys(value);
  for (const key of sortedKeys) {
    if (DANGEROUS_HTML_FIELD_NAMES.has(key)) {
      state.seen.delete(obj);
      return fail(
        "invalid-json-key",
        `${path}.${key}`,
        `field '${key}' is not allowed in payloads.`
      );
    }
    const nestedState: JsonValidationState = {
      depth: state.depth + 1,
      nodes: state.nodes,
      seen: state.seen,
    };
    const nested = validateJsonValue(value[key], `${path}.${key}`, nestedState);
    state.nodes = nestedState.nodes;
    if (nested) {
      state.seen.delete(obj);
      return nested;
    }
  }

  state.seen.delete(obj);
  return null;
};

const validateJsonEnvelope = (
  value: unknown,
  path: string
): PluginManifestValidationError | null => {
  if (value === undefined) return null;
  const nested = validateJsonValue(value, path, {
    depth: 0,
    nodes: 0,
    seen: new WeakSet<object>(),
  });
  if (nested) return nested;

  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      return fail("invalid-json-value", path, "value must be JSON-serializable.");
    }
    if (serialized.length > MAX_JSON_BYTES) {
      return fail(
        "json-size-exceeded",
        path,
        `maximum JSON size (${MAX_JSON_BYTES} bytes) exceeded.`
      );
    }
  } catch {
    return fail("invalid-json-value", path, "value must be JSON-serializable.");
  }

  return null;
};

const parseManifest = (
  input: unknown
): PluginManifestValidationError | DeclarativePluginManifestV1 => {
  if (!isPlainRecord(input)) {
    return fail("invalid-manifest-root", "manifest", "manifest must be a plain object.");
  }

  const invalidRootKey = validateAllowedKeys(
    input,
    ALLOWED_MANIFEST_KEYS,
    "manifest",
    "invalid-manifest-key"
  );
  if (invalidRootKey) return invalidRootKey;

  if (input.manifestVersion !== MANIFEST_VERSION) {
    return fail(
      "invalid-manifest-version",
      "manifest.manifestVersion",
      `manifestVersion must be ${MANIFEST_VERSION}.`
    );
  }

  const pluginId = input.pluginId;
  if (typeof pluginId !== "string" || pluginId.trim() === "") {
    return fail(
      "invalid-plugin-id",
      "manifest.pluginId",
      "pluginId must be a non-empty string."
    );
  }

  if (!Array.isArray(input.ui)) {
    return fail("invalid-ui-array", "manifest.ui", "ui must be an array.");
  }

  const parsedEntries: DeclarativeUIEntry[] = [];

  for (let index = 0; index < input.ui.length; index += 1) {
    const entryPath = `manifest.ui[${index}]`;
    const candidate = input.ui[index];
    if (!isPlainRecord(candidate)) {
      return fail("invalid-ui-entry", entryPath, "ui entry must be a plain object.");
    }

    const invalidEntryKey = validateAllowedKeys(
      candidate,
      ALLOWED_UI_ENTRY_KEYS,
      entryPath,
      "invalid-ui-entry-key"
    );
    if (invalidEntryKey) return invalidEntryKey;

    const entryId = candidate.id;
    if (typeof entryId !== "string" || entryId.trim() === "") {
      return fail("invalid-ui-id", `${entryPath}.id`, "id must be a non-empty string.");
    }

    const entrySlot = candidate.slot;
    if (!isKnownUISlotName(entrySlot)) {
      return fail(
        "invalid-ui-slot",
        `${entryPath}.slot`,
        "slot must be a known UI slot name."
      );
    }

    const entryType = candidate.type;
    if (entryType !== "button" && entryType !== "panel") {
      return fail(
        "invalid-ui-type",
        `${entryPath}.type`,
        "type must be 'button' or 'panel'."
      );
    }

    let parsedProps: DeclarativeUIProps | undefined;
    if (candidate.props !== undefined) {
      if (!isPlainRecord(candidate.props)) {
        return fail(
          "invalid-ui-props",
          `${entryPath}.props`,
          "props must be a plain object."
        );
      }
      const invalidPropKey = validateAllowedKeys(
        candidate.props,
        ALLOWED_UI_PROP_KEYS,
        `${entryPath}.props`,
        "invalid-ui-props-key"
      );
      if (invalidPropKey) return invalidPropKey;

      const label = candidate.props.label;
      if (label !== undefined && typeof label !== "string") {
        return fail(
          "invalid-ui-props-value",
          `${entryPath}.props.label`,
          "label must be a string."
        );
      }

      const icon = candidate.props.icon;
      if (icon !== undefined && typeof icon !== "string") {
        return fail(
          "invalid-ui-props-value",
          `${entryPath}.props.icon`,
          "icon must be a string."
        );
      }

      const disabled = candidate.props.disabled;
      if (disabled !== undefined && typeof disabled !== "boolean") {
        return fail(
          "invalid-ui-props-value",
          `${entryPath}.props.disabled`,
          "disabled must be a boolean."
        );
      }

      parsedProps = {
        label,
        icon,
        disabled,
      };
    }

    let parsedAction: DeclarativeCommandEnvelope | undefined;
    if (candidate.action !== undefined) {
      if (!isPlainRecord(candidate.action)) {
        return fail(
          "invalid-ui-action",
          `${entryPath}.action`,
          "action must be a plain object."
        );
      }

      const invalidActionKey = validateAllowedKeys(
        candidate.action,
        ALLOWED_ACTION_KEYS,
        `${entryPath}.action`,
        "invalid-ui-action-key"
      );
      if (invalidActionKey) return invalidActionKey;

      const commandId = candidate.action.commandId;
      if (typeof commandId !== "string" || commandId.trim() === "") {
        return fail(
          "invalid-command-id",
          `${entryPath}.action.commandId`,
          "commandId must be a non-empty string."
        );
      }

      const payloadValidation = validateJsonEnvelope(
        candidate.action.payload,
        `${entryPath}.action.payload`
      );
      if (payloadValidation) return payloadValidation;

      const contextValidation = validateJsonEnvelope(
        candidate.action.context,
        `${entryPath}.action.context`
      );
      if (contextValidation) return contextValidation;

      parsedAction = {
        commandId,
        payload: candidate.action.payload as JsonValue | undefined,
        context: candidate.action.context as JsonValue | undefined,
      };
    }

    parsedEntries.push({
      id: entryId,
      slot: entrySlot,
      type: entryType,
      props: parsedProps,
      action: parsedAction,
    });
  }

  return {
    manifestVersion: MANIFEST_VERSION,
    pluginId,
    ui: parsedEntries,
  };
};

export const isDeclarativePluginManifestV1 = (
  input: unknown
): input is DeclarativePluginManifestV1 => {
  const parsed = parseManifest(input);
  return !("ok" in parsed);
};

export const isPluginManifestV1 = isDeclarativePluginManifestV1;

const validateCommandTargets = (
  manifest: DeclarativePluginManifestV1
): PluginManifestValidationError | null => {
  for (let index = 0; index < manifest.ui.length; index += 1) {
    const entry = manifest.ui[index];
    if (!entry.action) continue;
    if (!getAppCommandById(entry.action.commandId)) {
      return fail(
        "unknown-command-id",
        `manifest.ui[${index}].action.commandId`,
        `command '${entry.action.commandId}' is not registered.`
      );
    }
  }
  return null;
};

export const registerDeclarativePluginManifest = (
  input: unknown
): PluginManifestRegisterResult => {
  const parsed = parseManifest(input);
  if ("ok" in parsed) return parsed;

  const commandTargetError = validateCommandTargets(parsed);
  if (commandTargetError) return commandTargetError;

  const replaced = manifestRegistry.has(parsed.pluginId);
  manifestRegistry.set(parsed.pluginId, parsed);
  notifyManifestRegistryUpdated();
  return { ok: true, value: parsed, replaced };
};

export const listDeclarativePluginManifests = (): DeclarativePluginManifestV1[] =>
  [...manifestRegistry.values()].sort((left, right) =>
    left.pluginId.localeCompare(right.pluginId)
  );

export const listDeclarativeSlotContributions = (
  slotName: UISlotName
): DeclarativeSlotContribution[] => {
  const manifests = listDeclarativePluginManifests();
  const contributions: DeclarativeSlotContribution[] = [];
  for (const manifest of manifests) {
    for (const entry of manifest.ui) {
      if (entry.slot !== slotName) continue;
      contributions.push({
        ...entry,
        pluginId: manifest.pluginId,
        contributionId: `${manifest.pluginId}:${entry.id}`,
      });
    }
  }
  return contributions;
};

export const clearDeclarativePluginManifests = (pluginId?: string): void => {
  if (pluginId === undefined) {
    if (manifestRegistry.size === 0) return;
    manifestRegistry.clear();
    notifyManifestRegistryUpdated();
    return;
  }

  if (!manifestRegistry.has(pluginId)) return;
  manifestRegistry.delete(pluginId);
  notifyManifestRegistryUpdated();
};

export const subscribeDeclarativePluginManifests = (
  listener: () => void
): (() => void) => {
  manifestRegistryListeners.add(listener);
  return () => {
    manifestRegistryListeners.delete(listener);
  };
};

export const getDeclarativePluginManifestVersion = (): number =>
  manifestRegistryVersion;
