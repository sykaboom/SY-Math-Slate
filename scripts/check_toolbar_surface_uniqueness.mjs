#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const policyPath = path.join(
  repoRoot,
  "v10/src/features/toolbar/catalog/toolbarSurfacePolicy.ts"
);
const selectorsPath = path.join(
  repoRoot,
  "v10/src/features/toolbar/catalog/toolbarActionSelectors.ts"
);
const floatingToolbarPath = path.join(
  repoRoot,
  "v10/src/features/toolbar/FloatingToolbar.tsx"
);

const required = [policyPath, selectorsPath, floatingToolbarPath];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length > 0) {
  console.log(
    `[check_toolbar_surface_uniqueness] SKIP (missing prerequisite files: ${missing
      .map((file) => path.relative(repoRoot, file))
      .join(", ")})`
  );
  process.exit(0);
}

const source = fs.readFileSync(policyPath, "utf8");

const pushRuleRegex =
  /pushRules\(\s*FALLBACK_RULES,\s*"([^"]+)",\s*\[([\s\S]*?)\],\s*"([^"]+)"\s*\);/g;

const actionRegex = /"([^"]+)"/g;
const viewports = ["desktop", "tablet", "mobile"];
const keyMap = new Map();
const violations = [];

let match = pushRuleRegex.exec(source);
while (match) {
  const mode = match[1];
  const actionBlock = match[2];
  const surface = match[3];

  let actionMatch = actionRegex.exec(actionBlock);
  while (actionMatch) {
    const actionId = actionMatch[1];
    for (const viewport of viewports) {
      const key = `${mode}:${viewport}:${actionId}`;
      const previous = keyMap.get(key);
      if (previous && previous !== surface) {
        violations.push({ key, previous, next: surface });
      } else {
        keyMap.set(key, surface);
      }
    }
    actionMatch = actionRegex.exec(actionBlock);
  }

  match = pushRuleRegex.exec(source);
}

if (keyMap.size === 0) {
  console.log(
    "[check_toolbar_surface_uniqueness] SKIP (surface rule table not found)"
  );
  process.exit(0);
}

const floatingToolbarSource = fs.readFileSync(floatingToolbarPath, "utf8");
if (!floatingToolbarSource.includes("selectMorePanelActions")) {
  console.error(
    "[check_toolbar_surface_uniqueness] FAIL (FloatingToolbar does not consume selector policy)"
  );
  process.exit(1);
}

if (violations.length > 0) {
  console.error(
    `[check_toolbar_surface_uniqueness] FAIL (${violations.length} conflicting surface assignment(s))`
  );
  for (const violation of violations.slice(0, 20)) {
    console.error(
      `- ${violation.key}: '${violation.previous}' vs '${violation.next}'`
    );
  }
  process.exit(1);
}

console.log(
  `[check_toolbar_surface_uniqueness] PASS (${keyMap.size} mode/viewport/action assignments)`
);

