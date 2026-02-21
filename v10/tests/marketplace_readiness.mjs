import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const contractSource = read("v10/src/core/foundation/schemas/extensionMarketplace.ts");
const catalogSource = read("v10/src/core/runtime/plugin-runtime/marketplaceCatalog.ts");
const routeSource = read("v10/src/app/api/extensions/marketplace/route.ts");
const hookSource = read(
  "v10/src/features/platform/extensions/marketplace/useMarketplaceCatalog.ts"
);

assert(
  contractSource.includes("validateExtensionMarketplaceCatalog"),
  "marketplace contract must expose catalog validator."
);
assert(
  catalogSource.includes("getExtensionMarketplaceCatalog"),
  "marketplace catalog builder must expose getter."
);
assert(
  routeSource.includes("resolveMarketplaceCatalog"),
  "marketplace route must use marketplace catalog resolver."
);
assert(
  hookSource.includes("validateExtensionMarketplaceCatalog"),
  "marketplace hook must validate catalog on client."
);

console.log("[marketplace_readiness] PASS");
