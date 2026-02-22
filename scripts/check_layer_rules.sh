#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node <<'NODE'
const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, "v10", "src");

const SOURCE_LAYERS = new Set(["core", "ui", "features", "app", "mod"]);
const ALLOWED_IMPORTS = {
  core: new Set(["core"]),
  ui: new Set(["ui", "core"]),
  // Compat allowlist mode: features/app may consume mod catalog bridge paths.
  features: new Set(["features", "ui", "core", "mod"]),
  app: new Set(["app", "features", "ui", "mod"]),
  mod: new Set(["mod", "core", "features", "ui"]),
};

const FILE_EXTENSIONS = new Set([".ts", ".tsx", ".mts"]);

const walkFiles = (dir, out = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === ".git" ||
        entry.name === "dist"
      ) {
        continue;
      }
      walkFiles(fullPath, out);
      continue;
    }
    const ext = path.extname(entry.name);
    if (FILE_EXTENSIONS.has(ext)) {
      out.push(fullPath);
    }
  }
  return out;
};

const normalizePosix = (value) => value.split(path.sep).join("/");

const layerFromRelative = (relativePath) => {
  const normalized = normalizePosix(relativePath);
  const first = normalized.split("/")[0];
  if (SOURCE_LAYERS.has(first)) return first;
  return null;
};

const layerFromFile = (filePath) => {
  const relative = path.relative(srcRoot, filePath);
  if (relative.startsWith("..")) return null;
  return layerFromRelative(relative);
};

const resolveAliasLayer = (spec) => {
  if (spec === "@core" || spec.startsWith("@core/")) return "core";
  if (spec === "@ui" || spec.startsWith("@ui/")) return "ui";
  if (spec === "@features" || spec.startsWith("@features/")) return "features";
  if (spec === "@mod" || spec.startsWith("@mod/")) return "mod";
  if (spec === "@" || spec === "@/") return null;
  if (spec.startsWith("@/")) {
    const rest = spec.slice(2);
    if (!rest) return null;
    return layerFromRelative(rest);
  }
  return null;
};

const resolveRelativeLayer = (spec, filePath) => {
  const resolved = path.resolve(path.dirname(filePath), spec);
  const relative = path.relative(srcRoot, resolved);
  if (relative.startsWith("..")) return null;
  return layerFromRelative(relative);
};

const parseImportSpec = (line) => {
  const importFrom = line.match(
    /^\s*import(?:\s+type)?[\s\S]*?\sfrom\s+["']([^"']+)["']/
  );
  if (importFrom) return importFrom[1];

  const importSideEffect = line.match(/^\s*import\s+["']([^"']+)["']/);
  if (importSideEffect) return importSideEffect[1];

  const exportFrom = line.match(/^\s*export[\s\S]*?\sfrom\s+["']([^"']+)["']/);
  if (exportFrom) return exportFrom[1];

  return null;
};

const parseDynamicImports = (line) => {
  const matches = [];
  const dynamicRegex = /import\(\s*["']([^"']+)["']\s*\)/g;
  let result = dynamicRegex.exec(line);
  while (result) {
    matches.push(result[1]);
    result = dynamicRegex.exec(line);
  }
  return matches;
};

if (!fs.existsSync(srcRoot)) {
  console.log("[check_layer_rules] v10/src not found. skipping.");
  process.exit(0);
}

const files = walkFiles(srcRoot);
const violations = [];

for (const filePath of files) {
  const sourceLayer = layerFromFile(filePath);
  if (!sourceLayer) continue;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNo = index + 1;

    const specs = [];
    const directSpec = parseImportSpec(line);
    if (directSpec) specs.push(directSpec);
    specs.push(...parseDynamicImports(line));

    for (const spec of specs) {
      if (spec.includes("/src/lib/") || spec.startsWith("@/lib")) {
        violations.push({
          code: "no-src-lib",
          filePath,
          lineNo,
          sourceLayer,
          spec,
          detail: "src/lib is deprecated and must not be imported.",
        });
        continue;
      }

      let targetLayer = resolveAliasLayer(spec);
      if (!targetLayer && spec.startsWith(".")) {
        targetLayer = resolveRelativeLayer(spec, filePath);
      }

      if (!targetLayer) {
        if (spec.startsWith("@/")) {
          violations.push({
            code: "unknown-alias-target",
            filePath,
            lineNo,
            sourceLayer,
            spec,
            detail: "alias target is outside known layers (core/ui/features/app/mod).",
          });
        }
        continue;
      }

      const allowedTargets = ALLOWED_IMPORTS[sourceLayer];
      if (!allowedTargets.has(targetLayer)) {
        violations.push({
          code: "layer-violation",
          filePath,
          lineNo,
          sourceLayer,
          targetLayer,
          spec,
          detail: `layer '${sourceLayer}' cannot import layer '${targetLayer}'.`,
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("[check_layer_rules] PASS (no layer violations)");
  process.exit(0);
}

console.error(`[check_layer_rules] FAIL (${violations.length} violation(s))`);
for (const violation of violations) {
  const relative = normalizePosix(path.relative(repoRoot, violation.filePath));
  const detail = violation.detail;
  console.error(
    `- ${relative}:${violation.lineNo} [${violation.code}] import '${violation.spec}' (${detail})`
  );
}
process.exit(1);
NODE
