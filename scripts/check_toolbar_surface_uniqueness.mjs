#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const SELF_TEST_DUPLICATE_FLAG = "--self-test-duplicate";
const allowedArgs = new Set([SELF_TEST_DUPLICATE_FLAG]);
const cliArgs = process.argv.slice(2);
const unknownArgs = cliArgs.filter((arg) => !allowedArgs.has(arg));

if (unknownArgs.length > 0) {
  console.error(
    `[check_toolbar_surface_uniqueness] FAIL (unknown argument(s): ${unknownArgs.join(
      ", "
    )})`
  );
  process.exit(1);
}

const selfTestDuplicate = cliArgs.includes(SELF_TEST_DUPLICATE_FLAG);

const files = {
  policy: path.join(
    repoRoot,
    "v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts"
  ),
  selectors: path.join(
    repoRoot,
    "v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts"
  ),
  floatingToolbar: path.join(
    repoRoot,
    "v10/src/features/chrome/toolbar/FloatingToolbar.tsx"
  ),
  coreTemplates: path.join(
    repoRoot,
    "v10/src/features/platform/extensions/ui/coreTemplates.ts"
  ),
  coreDeclarativeManifest: path.join(
    repoRoot,
    "v10/src/features/platform/extensions/ui/registerCoreDeclarativeManifest.ts"
  ),
  registerCoreSlots: path.join(
    repoRoot,
    "v10/src/features/platform/extensions/ui/registerCoreSlots.ts"
  ),
  runtimeBootstrap: path.join(
    repoRoot,
    "v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx"
  ),
};

const missing = Object.entries(files)
  .filter(([, file]) => !fs.existsSync(file))
  .map(([name, file]) => `${name}:${path.relative(repoRoot, file)}`);
if (missing.length > 0) {
  console.log(
    `[check_toolbar_surface_uniqueness] SKIP (missing prerequisite files: ${missing.join(
      ", "
    )})`
  );
  process.exit(0);
}

const source = fs.readFileSync(files.policy, "utf8");

const pushRuleRegex =
  /pushRules\(\s*FALLBACK_RULES,\s*"([^"]+)",\s*\[([\s\S]*?)\],\s*"([^"]+)"\s*\);/g;

const viewports = ["desktop", "tablet", "mobile"];
const keyMap = new Map();
const violations = [];

let match = pushRuleRegex.exec(source);
while (match) {
  const mode = match[1];
  const actionBlock = match[2];
  const surface = match[3];

  const actionIds = [...actionBlock.matchAll(/"([^"]+)"/g)].map(
    (actionMatch) => actionMatch[1]
  );
  for (const actionId of actionIds) {
    for (const viewport of viewports) {
      const key = `${mode}:${viewport}:${actionId}`;
      const previous = keyMap.get(key);
      if (previous && previous !== surface) {
        violations.push({ key, previous, next: surface });
      } else {
        keyMap.set(key, surface);
      }
    }
  }

  match = pushRuleRegex.exec(source);
}

if (keyMap.size === 0) {
  console.log(
    "[check_toolbar_surface_uniqueness] SKIP (surface rule table not found)"
  );
  process.exit(0);
}

const floatingToolbarSource = fs.readFileSync(files.floatingToolbar, "utf8");
if (
  !floatingToolbarSource.includes("selectMorePanelActions") ||
  !floatingToolbarSource.includes("<DrawModeTools") ||
  !floatingToolbarSource.includes("<PlaybackModeTools") ||
  !floatingToolbarSource.includes("<CanvasModeTools")
) {
  console.error(
    "[check_toolbar_surface_uniqueness] FAIL (FloatingToolbar mode renderer path missing)"
  );
  process.exit(1);
}

const selectorsSource = fs.readFileSync(files.selectors, "utf8");
if (
  !selectorsSource.includes("selectDrawToolbarActions") ||
  !selectorsSource.includes("selectPlaybackToolbarActions") ||
  !selectorsSource.includes("selectCanvasToolbarActions")
) {
  console.error(
    "[check_toolbar_surface_uniqueness] FAIL (toolbar selector wiring incomplete)"
  );
  process.exit(1);
}

const coreTemplatesSource = fs.readFileSync(files.coreTemplates, "utf8");
const registerCoreSlotsSource = fs.readFileSync(files.registerCoreSlots, "utf8");
const coreDeclarativeManifestSource = fs.readFileSync(
  files.coreDeclarativeManifest,
  "utf8"
);
const runtimeBootstrapSource = fs.readFileSync(files.runtimeBootstrap, "utf8");

const hasCoreTemplateToolbarInlineProducer =
  (coreTemplatesSource.match(/slot:\s*"toolbar-inline"/g)?.length ?? 0) > 0 &&
  /templateId:\s*"core\.template\.toolbar\./.test(coreTemplatesSource) &&
  /listActiveCoreTemplateManifests\(\)/.test(registerCoreSlotsSource) &&
  /registerUISlotComponent\(\s*template\.slot\s*,\s*template\.component\s*\)/.test(
    registerCoreSlotsSource
  );

const hasCoreDeclarativeToolbarInlineProducer =
  (coreDeclarativeManifestSource.match(/slot:\s*"toolbar-inline"/g)?.length ?? 0) >
    0 &&
  /pluginId:\s*"core-toolbar-shadow"/.test(coreDeclarativeManifestSource) &&
  /registerCoreDeclarativeManifest\(\)/.test(runtimeBootstrapSource);

const producerConflicts = [];
if (hasCoreTemplateToolbarInlineProducer) {
  producerConflicts.push({
    slot: "toolbar-inline",
    a: "mode-renderer",
    b: "core-template-injection",
    reason: "core template producer active",
  });
}
if (hasCoreDeclarativeToolbarInlineProducer) {
  producerConflicts.push({
    slot: "toolbar-inline",
    a: "mode-renderer",
    b: "core-declarative-shadow-injection",
    reason: "core declarative manifest producer active",
  });
}

if (selfTestDuplicate) {
  producerConflicts.push({
    slot: "toolbar-inline",
    a: "mode-renderer",
    b: "self-test-duplicate-fixture",
    reason: SELF_TEST_DUPLICATE_FLAG,
  });
}

if (violations.length > 0 || producerConflicts.length > 0) {
  const issueCount = violations.length + producerConflicts.length;
  console.error(
    `[check_toolbar_surface_uniqueness] FAIL (${issueCount} issue(s))`
  );
  for (const violation of violations.slice(0, 20)) {
    console.error(
      `SURFACE_CONFLICT ${violation.key}: '${violation.previous}' vs '${violation.next}'`
    );
  }
  for (const conflict of producerConflicts.slice(0, 20)) {
    console.error(
      `DUPLICATE_PRODUCER_CONFLICT slot=${conflict.slot} producers=${conflict.a}|${conflict.b} reason=${conflict.reason}`
    );
  }
  process.exit(1);
}

console.log(
  `[check_toolbar_surface_uniqueness] PASS (${keyMap.size} mode/viewport/action assignments; producers=mode-renderer only)`
);
