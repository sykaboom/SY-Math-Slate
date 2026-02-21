import {
  validateExtensionMarketplaceCatalog,
  type ExtensionMarketplaceCatalog,
  type ExtensionMarketplaceValidationResult,
} from "@core/foundation/schemas/extensionMarketplace";

const BASE_ENTRIES = [
  {
    id: "core.quick-toggle.pen",
    name: "Quick Pen Toggle",
    description:
      "Adds quick toolbar button for pen mode switching in teaching sessions.",
    version: "1.0.0",
    publisher: "sy-math-slate-core",
    manifestVersion: 1,
    slot: "toolbar-bottom",
    commandId: "setTool",
    tags: ["core", "toolbar", "ink"],
    visibility: "public",
    trustLevel: "verified",
    minAppVersion: "10.0.0",
    updatedAt: 1739664000000,
  },
  {
    id: "core.pending-approval.panel",
    name: "Pending Approval Queue",
    description:
      "Host-side queue panel for reviewing command and tool approval requests.",
    version: "1.0.0",
    publisher: "sy-math-slate-core",
    manifestVersion: 1,
    slot: "left-panel",
    commandId: "approveQueuedCommand",
    tags: ["core", "approval", "safety"],
    visibility: "public",
    trustLevel: "verified",
    minAppVersion: "10.0.0",
    updatedAt: 1739664000000,
  },
] as const;

const cloneCatalog = (catalog: ExtensionMarketplaceCatalog): ExtensionMarketplaceCatalog => ({
  generatedAt: catalog.generatedAt,
  entries: catalog.entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    version: entry.version,
    publisher: entry.publisher,
    manifestVersion: 1,
    slot: entry.slot,
    commandId: entry.commandId,
    tags: [...entry.tags],
    visibility: entry.visibility,
    trustLevel: entry.trustLevel,
    minAppVersion: entry.minAppVersion,
    updatedAt: entry.updatedAt,
  })),
});

export const buildExtensionMarketplaceCatalog = (): ExtensionMarketplaceCatalog => ({
  generatedAt: Date.now(),
  entries: [...BASE_ENTRIES]
    .map((entry) => ({
      ...entry,
      tags: [...entry.tags],
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
});

export const getExtensionMarketplaceCatalog = (): ExtensionMarketplaceValidationResult<ExtensionMarketplaceCatalog> => {
  const validation = validateExtensionMarketplaceCatalog(
    buildExtensionMarketplaceCatalog()
  );
  if (!validation.ok) return validation;
  return {
    ok: true,
    value: cloneCatalog(validation.value),
  };
};
