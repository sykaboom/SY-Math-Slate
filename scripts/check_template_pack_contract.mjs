#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const files = {
  types: path.join(
    repoRoot,
    "v10/src/mod/templates/_contracts/templatePack.types.ts"
  ),
  guards: path.join(
    repoRoot,
    "v10/src/mod/templates/_contracts/templatePack.guards.ts"
  ),
  index: path.join(repoRoot, "v10/src/mod/templates/index.ts"),
  registry: path.join(repoRoot, "v10/src/mod/runtime/templatePackRegistry.ts"),
  manifest: path.join(
    repoRoot,
    "v10/src/mod/templates/base-education/manifest.ts"
  ),
};

const missing = Object.entries(files)
  .filter(([, filePath]) => !fs.existsSync(filePath))
  .map(([name, filePath]) => `${name}:${path.relative(repoRoot, filePath)}`);

if (missing.length > 0) {
  console.log(
    `[check_template_pack_contract] SKIP (missing files: ${missing.join(", ")})`
  );
  process.exit(0);
}

const checks = [
  {
    file: files.types,
    pattern: /export type TemplatePackManifest =/,
    error: "TemplatePackManifest type missing",
  },
  {
    file: files.guards,
    pattern: /validateTemplatePackManifest/,
    error: "validateTemplatePackManifest missing",
  },
  {
    file: files.index,
    pattern: /listTemplatePacks/,
    error: "listTemplatePacks export missing",
  },
  {
    file: files.registry,
    pattern: /getPrimaryRuntimeTemplatePack/,
    error: "runtime primary pack getter missing",
  },
  {
    file: files.manifest,
    pattern: /packId:\s*"base-education"/,
    error: "base-education packId missing",
  },
  {
    file: files.manifest,
    pattern: /actionSurfaceRules:/,
    error: "base manifest actionSurfaceRules missing",
  },
];

const failures = [];
for (const check of checks) {
  const source = fs.readFileSync(check.file, "utf8");
  if (!check.pattern.test(source)) {
    failures.push({
      file: path.relative(repoRoot, check.file),
      message: check.error,
    });
  }
}

if (failures.length > 0) {
  console.error(
    `[check_template_pack_contract] FAIL (${failures.length} issue(s))`
  );
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.message}`);
  }
  process.exit(1);
}

console.log("[check_template_pack_contract] PASS");

