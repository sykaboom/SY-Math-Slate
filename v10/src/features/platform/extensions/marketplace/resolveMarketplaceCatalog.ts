import type { ExtensionMarketplaceCatalog } from "@core/foundation/schemas/extensionMarketplace";
import { getExtensionMarketplaceCatalog } from "@core/runtime/plugin-runtime/marketplaceCatalog";

export type MarketplaceCatalogResolution =
  | {
      ok: true;
      catalog: ExtensionMarketplaceCatalog;
    }
  | {
      ok: false;
      code: string;
      message: string;
      path?: string;
    };

export const resolveMarketplaceCatalog = (): MarketplaceCatalogResolution => {
  const catalogResult = getExtensionMarketplaceCatalog();
  if (!catalogResult.ok) {
    return {
      ok: false,
      code: "marketplace-catalog-invalid",
      message: `${catalogResult.code}: ${catalogResult.message}`,
      path: catalogResult.path,
    };
  }

  return {
    ok: true,
    catalog: catalogResult.value,
  };
};
