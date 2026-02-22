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
  toolbarBaseDefinition: path.join(
    repoRoot,
    "v10/src/mod/packs/base-education/toolbarBaseDefinition.ts"
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
  console.error(
    `[check_toolbar_surface_uniqueness] FAIL (missing prerequisite files: ${missing.join(
      ", "
    )})`
  );
  process.exit(1);
}

const toolbarBaseSource = fs.readFileSync(files.toolbarBaseDefinition, "utf8");

const placementConstRegex =
  /const\s+([A-Z0-9_]+_PLACEMENTS)\s*=\s*\[([\s\S]*?)\]\s+as const/g;
const placementEntryRegex = /mode:\s*"([^"]+)"\s*,\s*surface:\s*"([^"]+)"/g;
const actionDefinitionRegex =
  /\{\s*id:\s*"([^"]+)"\s*,\s*label:\s*"[^"]+"\s*,\s*placements:\s*([A-Z0-9_]+)\s*\}/g;

const placementMap = new Map();
let placementMatch = placementConstRegex.exec(toolbarBaseSource);
while (placementMatch) {
  const constName = placementMatch[1];
  const block = placementMatch[2];
  const placements = [];
  let entryMatch = placementEntryRegex.exec(block);
  while (entryMatch) {
    placements.push({ mode: entryMatch[1], surface: entryMatch[2] });
    entryMatch = placementEntryRegex.exec(block);
  }
  placementMap.set(constName, placements);
  placementMatch = placementConstRegex.exec(toolbarBaseSource);
}

if (placementMap.size === 0) {
  console.error(
    "[check_toolbar_surface_uniqueness] FAIL (placement constants not found in toolbar base definition)"
  );
  process.exit(1);
}

const viewports = ["desktop", "tablet", "mobile"];
const keyMap = new Map();
const violations = [];
const actionIds = new Set();

let actionMatch = actionDefinitionRegex.exec(toolbarBaseSource);
while (actionMatch) {
  const actionId = actionMatch[1];
  const placementConstName = actionMatch[2];
  const placements = placementMap.get(placementConstName);

  if (!placements || placements.length === 0) {
    violations.push({
      key: `action:${actionId}`,
      previous: "missing-placement-const",
      next: placementConstName,
    });
    actionMatch = actionDefinitionRegex.exec(toolbarBaseSource);
    continue;
  }

  actionIds.add(actionId);
  for (const placement of placements) {
    for (const viewport of viewports) {
      const key = `${placement.mode}:${viewport}:${actionId}`;
      const previous = keyMap.get(key);
      if (previous && previous !== placement.surface) {
        violations.push({ key, previous, next: placement.surface });
      } else {
        keyMap.set(key, placement.surface);
      }
    }
  }

  actionMatch = actionDefinitionRegex.exec(toolbarBaseSource);
}

if (actionIds.size === 0) {
  console.error(
    "[check_toolbar_surface_uniqueness] FAIL (toolbar action definitions not found)"
  );
  process.exit(1);
}

const floatingToolbarSource = fs.readFileSync(files.floatingToolbar, "utf8");
if (
  !floatingToolbarSource.includes("<DrawModeTools") ||
  !floatingToolbarSource.includes("<PlaybackModeTools") ||
  !floatingToolbarSource.includes("<CanvasModeTools") ||
  !floatingToolbarSource.includes("<MorePanel")
) {
  console.error(
    "[check_toolbar_surface_uniqueness] FAIL (FloatingToolbar mode renderer path missing)"
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
  `[check_toolbar_surface_uniqueness] PASS (${keyMap.size} mode/viewport/action assignments; actions=${actionIds.size}; producers=mode-renderer only)`
);
