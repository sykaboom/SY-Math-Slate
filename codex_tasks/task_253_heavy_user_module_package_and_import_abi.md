# Task 253: Heavy User Module Package and Import ABI

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify heavy-user module package format and import ABI so advanced users can design modules directly and import them safely.
  - Define compatibility/versioning for module manifests and action bindings.
- What must NOT change:
  - Do not allow arbitrary executable payload injection.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`

Out of scope:
- Light-user intent parsing
- Runtime implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Import format must be JSON-first with strict validation.
  - No eval/new Function style execution paths.
- Compatibility:
  - Align with existing plugin manifest and command bus boundaries.

---

## Heavy Module Package ABI (Normative v1)

### Canonical package document (`HeavyModulePackageV1`)

```json
{
  "packageAbiVersion": 1,
  "moduleId": "teacher-geometry-tools",
  "moduleVersion": "1.0.0",
  "displayName": "Teacher Geometry Tools",
  "description": "Optional human-readable summary",
  "compatibility": {
    "pluginManifestVersion": 1,
    "commandBusContractVersion": 1,
    "minAppVersion": "10.0.0",
    "maxAppVersionExclusive": null
  },
  "pluginManifest": {
    "manifestVersion": 1,
    "pluginId": "teacher-geometry-tools",
    "ui": []
  },
  "commandBindings": [
    {
      "bindingId": "set-tool-pen",
      "uiEntryId": "pen-tool-button",
      "commandId": "setTool",
      "payload": {
        "tool": "pen"
      },
      "context": {
        "surface": "heavy-module"
      },
      "expectedMutationScope": "local"
    }
  ],
  "capabilitiesRequested": [],
  "extensions": {
    "x-vendor-note": "Optional JSON-safe extension metadata"
  }
}
```

### Field constraints

- `packageAbiVersion`:
  - Required integer literal `1`.
- `moduleId`:
  - Required non-empty string.
  - Pattern: `^[a-z0-9][a-z0-9-]{2,63}$`.
- `moduleVersion`:
  - Required SemVer string (`major.minor.patch`, optional pre-release/build tags).
- `displayName`:
  - Required non-empty string for UX labeling.
- `description`:
  - Optional string.
- `compatibility`:
  - Required object with:
    - `pluginManifestVersion`: required literal `1`.
    - `commandBusContractVersion`: required literal `1`.
    - `minAppVersion`: optional SemVer lower bound.
    - `maxAppVersionExclusive`: optional SemVer upper bound (exclusive) or `null`.
- `pluginManifest`:
  - Required object and source-of-truth UI declaration.
  - Must satisfy existing `validateDeclarativePluginManifest` rules from `v10/src/core/extensions/pluginLoader.ts`.
  - `pluginManifest.pluginId` must equal `moduleId`.
  - Slot/type boundaries remain unchanged:
    - `slot`: one of `chrome-top-toolbar | left-panel | toolbar-inline | toolbar-bottom`
    - `type`: `button | panel`
- `commandBindings`:
  - Required array.
  - One binding per `pluginManifest.ui[*].action` entry (1:1 coverage).
  - `bindingId` must be unique per package.
  - `uiEntryId` must reference an existing `pluginManifest.ui[*].id`.
  - `commandId` must match referenced UI action command and resolve to a registered app command.
  - `expectedMutationScope` optional, but if present must match command metadata (`doc | sync | local`).
  - `payload` and `context` must be JSON-safe.
- `capabilitiesRequested`:
  - Optional string array; semantic enforcement is defined by `task_254`.
- `extensions`:
  - Optional object for vendor metadata.
  - Keys must be prefixed with `x-`.
  - Values must be JSON-safe and non-executable.

### Command bus boundary invariants

- Imported modules cannot define executable handlers; actions are declarative data only.
- `requiresApproval`, role checks, audit tags, and queue policy are always owned by command bus metadata.
- Module payload cannot override command bus policy decisions; it only supplies validated payload/context inputs.

---

## Import Validation ABI (Deterministic)

### Result envelope

```ts
type ModuleImportResult =
  | {
      ok: true;
      code: "imported";
      moduleId: string;
      moduleVersion: string;
      replaced: boolean;
    }
  | {
      ok: false;
      code: ModuleImportErrorCode;
      path: string;
      message: string;
      detail?: Record<string, string | number | boolean | null>;
    };
```

### `ModuleImportErrorCode` set

- `invalid-package-root`
- `invalid-package-key`
- `invalid-package-abi-version`
- `invalid-module-id`
- `invalid-module-version`
- `invalid-display-name`
- `invalid-compatibility`
- `unsupported-plugin-manifest-version`
- `unsupported-command-bus-contract-version`
- `app-version-out-of-range`
- `module-id-plugin-id-mismatch`
- `invalid-command-bindings-array`
- `invalid-command-binding`
- `invalid-command-binding-id`
- `duplicate-command-binding-id`
- `unknown-ui-entry-id`
- `missing-binding-for-ui-action`
- `command-id-mismatch`
- `unknown-command-id`
- `binding-mutation-scope-mismatch`
- `invalid-capability-shape`
- `invalid-extension-key`
- `manifest-validation-error`

### Manifest error passthrough contract

- If `pluginManifest` fails validation, importer returns:
  - `code: "manifest-validation-error"`
  - `detail.manifestCode`: exact `PluginManifestValidationCode` from `pluginLoader.ts`
  - `path`: prefixed as `package.pluginManifest...`
- This preserves existing plugin-manifest boundary as source-of-truth and avoids duplicated error semantics.

### Deterministic rejection behavior

- Validation order is fixed:
  1. Package root and allowed keys
  2. Core metadata fields (`packageAbiVersion`, `moduleId`, `moduleVersion`, `displayName`)
  3. Compatibility block
  4. `pluginManifest` validation (existing guard)
  5. `commandBindings` shape and cross-reference checks
  6. Capability/extension shape checks
- Import is fail-fast with first deterministic error.
- No silent fallback, no auto-repair, and no partial registration.
- Success is atomic: manifest + bindings register together, or neither registers.

---

## Versioning and Upgrade Path

### Version axes

- `packageAbiVersion`:
  - Structural schema version for heavy module package.
  - Current accepted value: `1`.
- `moduleVersion`:
  - Author-controlled semantic module release version.
  - Used for replacement/upgrade decisions for same `moduleId`.
- `compatibility.pluginManifestVersion`:
  - Must be `1` while runtime manifest guard is v1-only.
- `compatibility.commandBusContractVersion`:
  - Must be `1` while command metadata contract remains current v1 baseline.

### Import-time upgrade policy

- Current (v1 strict mode):
  - Accept only `packageAbiVersion = 1`.
  - Reject unknown major versions with `invalid-package-abi-version`.
- Forward upgrade path (documented for future implementation tasks):
  1. Detect incoming package major version.
  2. Resolve explicit migration chain to importer-supported target.
  3. Apply pure-data migration only (no executable hooks).
  4. Re-run full validation as if native package of target version.
  5. If no chain exists, reject deterministically (same ABI version error family).

### Manifest/command evolution guardrails

- Future manifest schema versions must not bypass `validateDeclarativePluginManifest`; support requires explicit adapter/migration.
- Command renames/deprecations require explicit migration mapping of `commandBindings.commandId`; implicit aliasing is forbidden.
- Any future ABI expansion must be additive and JSON-safe; breaking changes require new major `packageAbiVersion`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M1-HEAVY
- Depends on tasks:
  - [`task_250`]
- Enables tasks:
  - [`task_254`, `task_256`, `task_257`]
- Parallel group:
  - G-heavy
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Module package format defines metadata, UI slots, command bindings, and compatibility version.
- [x] AC-2: Import ABI defines validation failure codes and deterministic rejection behavior.
- [x] AC-3: Upgrade path for future manifest versions is documented.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect package schema section.
   - Expected result: all required fields are explicitly typed and constrained.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect import failure matrix.
   - Expected result: deterministic error codes and no silent fallback.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect versioning/migration section.
   - Expected result: forward-compat and migration notes exist.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ABI ambiguity can break third-party modules.
  - Future schema expansion without migration registry can cause import fragmentation.
- Roll-back:
  - Freeze to prior manifest ABI until migration tooling is ready.
  - Disable heavy package import entrypoint if deterministic validation cannot be guaranteed.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User instruction in chat on 2026-02-16: "You own Task 253 only (Wave 5 heavy-doc)."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`
- `sed -n '1,240p' codex_tasks/task_250_dual_track_modding_program_governance.md`
- `sed -n '280,380p' v10/AI_READ_ME.md`
- `sed -n '1,620p' v10/src/core/extensions/pluginLoader.ts`
- `sed -n '1,260p' v10/src/core/engine/commandBus.ts`

## Gate Results (Codex fills)

- Lint:
  - N/A (doc-only task)
- Build:
  - N/A (doc-only task)
- Script checks:
  - N/A (doc-only task)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1: Confirmed package schema now defines metadata, slot constraints, command binding structure, and compatibility fields.
- AC-2: Confirmed deterministic import error code set, manifest passthrough contract, and fail-fast semantics are explicitly documented.
- AC-3: Confirmed version axes and future migration chain policy are explicitly documented.

Notes:
- Capability semantics intentionally remain delegated to `task_254`; this task defines shape/ABI boundary only.
