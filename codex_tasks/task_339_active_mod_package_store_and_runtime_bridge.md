# Task 339: Active Mod Package Store + Runtime Bridge

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Introduce active package state SSOT (`activePackageId`) and selectors.
  - Bridge package selection with existing `useModStore` lifecycle without breaking current active mod behavior.
- What must NOT change:
  - default startup active mod (`draw`) unless package policy explicitly overrides.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/store/useModStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/core/mod/package/*` (selectors only)

Out of scope:
- toolbar mode mapping cutover.
- mod contribution filtering.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - feature stores only consume public package selectors.
- Compatibility:
  - legacy fields remain readable for one migration wave.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W339
- Depends on tasks:
  - [`task_337_mod_package_contracts_registry_core`]
- Enables tasks:
  - `task_343_toolbar_mapping_to_package_activation_policy`
  - `task_344_ui_host_contribution_filter_by_package_policy`
- Parallel group:
  - G1-state-bridge
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/features/platform/store/useModStore.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES (after 337)
- Rationale:
  - store SSOT change should remain single-owner to avoid racey merges.

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
    - runtime currently tracks active mod but not active package contract ownership.
  - Sunset criteria:
    - direct legacy fallback reads removed in task_349.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: active package id is tracked in state with deterministic default.
- [x] AC-2: existing active mod behavior remains functional.
- [x] AC-3: state bridge exposes package id without breaking current UI bridge fields.

---

## Manual Verification Steps (Base Required)

1) state default
   - Command / click path:
     - startup app and inspect store snapshot
   - Expected result:
     - active package default exists and active mod remains draw unless policy changes
   - Covers: AC-1, AC-2

2) bridge compatibility
   - Command / click path:
     - read `useUIStoreBridge` selectors used by toolbar
   - Expected result:
     - no undefined field errors
   - Covers: AC-3

3) lint gate
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - pass
   - Covers: AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - package default/active mod mismatch at cold start.
- Roll-back:
  - keep legacy field path and revert activePackageId writes.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive, 2026-02-20: "You own Task 339 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/store/useModStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `codex_tasks/task_339_active_mod_package_store_and_runtime_bridge.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `bash scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A (not required for this task)
- Script checks:
  - PASS (`check_layer_rules`)

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
- `useModStore` now tracks `activePackageId` as SSOT with deterministic default via package selectors (`selectPrimaryModPackage(listRuntimeModPackages())`) and `null` fallback.
- Existing `activeModId` default/set/reset flow remains unchanged (`draw` default preserved).
- `useUIStoreBridge` now exposes `activePackageId` while preserving legacy `activeModId` bridge field for compatibility.
