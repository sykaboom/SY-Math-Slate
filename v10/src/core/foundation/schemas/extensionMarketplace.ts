export const MARKETPLACE_SLOT_NAMES = [
  "chrome-top-toolbar",
  "left-panel",
  "toolbar-inline",
  "toolbar-bottom",
] as const;

export type MarketplaceSlotName = (typeof MARKETPLACE_SLOT_NAMES)[number];
export type MarketplaceVisibility = "public" | "unlisted";
export type MarketplaceTrustLevel = "verified" | "community";

export type ExtensionMarketplaceEntry = {
  id: string;
  name: string;
  description: string;
  version: string;
  publisher: string;
  manifestVersion: 1;
  slot: MarketplaceSlotName;
  commandId: string;
  tags: string[];
  visibility: MarketplaceVisibility;
  trustLevel: MarketplaceTrustLevel;
  minAppVersion: string;
  updatedAt: number;
};

export type ExtensionMarketplaceCatalog = {
  generatedAt: number;
  entries: ExtensionMarketplaceEntry[];
};

export type ExtensionMarketplaceValidationError = {
  ok: false;
  code: string;
  path: string;
  message: string;
};

export type ExtensionMarketplaceValidationSuccess<T> = {
  ok: true;
  value: T;
};

export type ExtensionMarketplaceValidationResult<T> =
  | ExtensionMarketplaceValidationError
  | ExtensionMarketplaceValidationSuccess<T>;

const MAX_ID_LENGTH = 120;
const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 600;
const MAX_TAG_LENGTH = 48;
const MAX_TAG_COUNT = 12;

const fail = (
  code: string,
  path: string,
  message: string
): ExtensionMarketplaceValidationError => ({
  ok: false,
  code,
  path,
  message,
});

const ok = <T>(value: T): ExtensionMarketplaceValidationSuccess<T> => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateBoundedString = (
  value: unknown,
  path: string,
  maxLength: number
): ExtensionMarketplaceValidationResult<string> => {
  if (typeof value !== "string") {
    return fail("invalid-string", path, `${path} must be string.`);
  }
  const normalized = value.trim();
  if (normalized === "") {
    return fail("empty-string", path, `${path} must be non-empty string.`);
  }
  if (normalized.length > maxLength) {
    return fail("string-too-long", path, `${path} exceeds max length.`);
  }
  return ok(normalized);
};

const validateTimestamp = (
  value: unknown,
  path: string
): ExtensionMarketplaceValidationResult<number> => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fail("invalid-timestamp", path, `${path} must be non-negative number.`);
  }
  return ok(Math.floor(value));
};

const validateTags = (
  value: unknown,
  path: string
): ExtensionMarketplaceValidationResult<string[]> => {
  if (!Array.isArray(value)) {
    return fail("invalid-tags", path, `${path} must be string array.`);
  }
  if (value.length > MAX_TAG_COUNT) {
    return fail("too-many-tags", path, `${path} exceeds max tag count.`);
  }
  const normalized: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < value.length; i += 1) {
    const validated = validateBoundedString(
      value[i],
      `${path}[${i}]`,
      MAX_TAG_LENGTH
    );
    if (!validated.ok) return validated;
    const key = validated.value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(validated.value);
  }
  return ok(normalized);
};

export const validateExtensionMarketplaceEntry = (
  value: unknown,
  path = "entry"
): ExtensionMarketplaceValidationResult<ExtensionMarketplaceEntry> => {
  if (!isRecord(value)) {
    return fail("invalid-entry", path, "entry must be object.");
  }

  const id = validateBoundedString(value.id, `${path}.id`, MAX_ID_LENGTH);
  if (!id.ok) return id;
  const name = validateBoundedString(value.name, `${path}.name`, MAX_NAME_LENGTH);
  if (!name.ok) return name;
  const description = validateBoundedString(
    value.description,
    `${path}.description`,
    MAX_DESCRIPTION_LENGTH
  );
  if (!description.ok) return description;
  const version = validateBoundedString(value.version, `${path}.version`, 32);
  if (!version.ok) return version;
  const publisher = validateBoundedString(value.publisher, `${path}.publisher`, 64);
  if (!publisher.ok) return publisher;
  const commandId = validateBoundedString(value.commandId, `${path}.commandId`, 120);
  if (!commandId.ok) return commandId;
  const minAppVersion = validateBoundedString(
    value.minAppVersion,
    `${path}.minAppVersion`,
    32
  );
  if (!minAppVersion.ok) return minAppVersion;
  const tags = validateTags(value.tags, `${path}.tags`);
  if (!tags.ok) return tags;
  const updatedAt = validateTimestamp(value.updatedAt, `${path}.updatedAt`);
  if (!updatedAt.ok) return updatedAt;

  if (value.manifestVersion !== 1) {
    return fail(
      "invalid-manifest-version",
      `${path}.manifestVersion`,
      "manifestVersion must be 1."
    );
  }

  if (
    typeof value.slot !== "string" ||
    !(MARKETPLACE_SLOT_NAMES as readonly string[]).includes(value.slot)
  ) {
    return fail("invalid-slot", `${path}.slot`, "slot is not supported.");
  }

  if (value.visibility !== "public" && value.visibility !== "unlisted") {
    return fail(
      "invalid-visibility",
      `${path}.visibility`,
      "visibility must be public or unlisted."
    );
  }

  if (value.trustLevel !== "verified" && value.trustLevel !== "community") {
    return fail(
      "invalid-trust-level",
      `${path}.trustLevel`,
      "trustLevel must be verified or community."
    );
  }

  return ok({
    id: id.value,
    name: name.value,
    description: description.value,
    version: version.value,
    publisher: publisher.value,
    manifestVersion: 1,
    slot: value.slot as MarketplaceSlotName,
    commandId: commandId.value,
    tags: tags.value,
    visibility: value.visibility as MarketplaceVisibility,
    trustLevel: value.trustLevel as MarketplaceTrustLevel,
    minAppVersion: minAppVersion.value,
    updatedAt: updatedAt.value,
  });
};

export const validateExtensionMarketplaceCatalog = (
  value: unknown
): ExtensionMarketplaceValidationResult<ExtensionMarketplaceCatalog> => {
  if (!isRecord(value)) {
    return fail("invalid-catalog-root", "catalog", "catalog must be object.");
  }

  const generatedAt = validateTimestamp(value.generatedAt, "catalog.generatedAt");
  if (!generatedAt.ok) return generatedAt;

  if (!Array.isArray(value.entries)) {
    return fail("invalid-catalog-entries", "catalog.entries", "entries must be array.");
  }

  const entries: ExtensionMarketplaceEntry[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < value.entries.length; i += 1) {
    const entry = validateExtensionMarketplaceEntry(
      value.entries[i],
      `catalog.entries[${i}]`
    );
    if (!entry.ok) return entry;
    if (ids.has(entry.value.id)) {
      return fail(
        "duplicate-entry-id",
        `catalog.entries[${i}].id`,
        `duplicate id '${entry.value.id}'.`
      );
    }
    ids.add(entry.value.id);
    entries.push(entry.value);
  }

  return ok({
    generatedAt: generatedAt.value,
    entries,
  });
};
