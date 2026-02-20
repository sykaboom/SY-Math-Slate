# Task 338: Template Pack Adapter -> Mod Package Registry

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Add compatibility adapter so existing `TemplatePackManifest` runtime registry resolves through `ModPackage` registry selectors.
  - Keep current template-facing public API stable.
- What must NOT change:
  - Existing mod studio/template UI behavior.
  - Existing template pack manifest wire format consumed by current callers.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/mod/templates/_contracts/templatePack.types.ts`
- `v10/src/core/mod/package/*` (adapter and guards)

Out of scope:
- input routing code.
- toolbar mapping cutover.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - adapter in core layer cannot import features.
- Compatibility:
  - maintain old exports: register/list/get/clear runtime template pack APIs.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W338
- Depends on tasks:
  - [`task_337_mod_package_contracts_registry_core`]
- Enables tasks:
  - `task_343_toolbar_mapping_to_package_activation_policy`
  - `task_345_mod_studio_package_diagnostics_and_conflicts`
  - `task_349_legacy_dual_axis_retirement`
- Parallel group:
  - G1-core-adapter
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/core/mod/package/*`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES (after 337)
- Rationale:
  - small but compatibility-sensitive; single owner safer.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES / NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - dual registries risk divergent runtime behavior.
  - Sunset criteria:
    - template registry internally delegates 100% to package registry.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: template runtime registry reads are backed by package registry adapter.
- [x] AC-2: no breaking changes for existing template registry callers.
- [x] AC-3: duplicate/invalid package manifest inputs fail deterministically.

---

## Manual Verification Steps (Base Required)

1) compatibility smoke
   - Command / click path:
     - use existing template listing path in runtime
   - Expected result:
     - same list returned as baseline
   - Covers: AC-1, AC-2

2) invalid registration
   - Command / click path:
     - register malformed pack payload in test harness
   - Expected result:
     - guarded failure with structured error
   - Covers: AC-3

3) guard checks
   - Command / click path:
     - `bash scripts/check_mod_contract.sh`
   - Expected result:
     - pass
   - Covers: AC-1

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - adapter mapping omissions may hide template metadata.
- Roll-back:
  - revert adapter path and keep prior registry implementation.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive: "You own Task 338 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/package/index.ts`
- `v10/src/core/mod/package/templatePackAdapter.types.ts`
- `v10/src/core/mod/package/templatePackAdapter.ts`
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/mod/templates/_contracts/templatePack.types.ts`
- `codex_tasks/task_338_template_pack_adapter_to_mod_package_registry.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A (not required by this task request)
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Runtime template registry public API (`register/list/get/primary/clear/is`) remained unchanged while internals now sync and query through ModPackage registry selectors.
- Template manifest contract remains wire-compatible; shared adapter types now anchor mode/layout/theme slot typing to core package compatibility types.
- Registry sync validates adapted package definitions before registration and uses deterministic packId ordering for rebuild.
