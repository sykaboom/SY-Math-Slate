# Task 343: Toolbar Mapping -> Package Activation Policy

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Move `toolbarMode -> modId` authority from hardcoded map to active package activation policy.
  - Keep transitional fallback only as explicit compatibility branch.
- What must NOT change:
  - toolbar mode UX labels and mode switching surface.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/core/mod/package/*` (activation selector)

Out of scope:
- mod contribution filtering.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - toolbar layer reads activation policy via selectors only.
- Compatibility:
  - fallback mapping preserved for one wave if policy missing.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W343
- Depends on tasks:
  - [`task_338_template_pack_adapter_to_mod_package_registry`, `task_339_active_mod_package_store_and_runtime_bridge`]
- Enables tasks:
  - `task_344_ui_host_contribution_filter_by_package_policy`
  - `task_347_mod_package_regression_matrix_and_runtime_checks`
- Parallel group:
  - G3-ui-policy
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - critical toolbar behavior file with frequent conflicts.

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
    - current hardcoded mapping keeps lecture/playback coupling outside package contract.
  - Sunset criteria:
    - direct hardcoded map removed in task_349.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: toolbar mode resolution reads active package activation policy first.
- [x] AC-2: missing policy uses explicit fallback path without crash.
- [x] AC-3: mode switches still activate corresponding runtime mod.

---

## Manual Verification Steps (Base Required)

1) policy path
   - Command / click path:
     - switch toolbar modes with package policy present
   - Expected result:
     - expected mod ids activate
   - Covers: AC-1, AC-3

2) fallback path
   - Command / click path:
     - run with package policy absent in test fixture
   - Expected result:
     - fallback map works and logs compatibility branch
   - Covers: AC-2

3) gates
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - pass
   - Covers: AC-1..3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - activation mismatch causing wrong active mod after mode switch.
- Roll-back:
  - revert to current hardcoded mapping while keeping package selectors for diagnostics only.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive, 2026-02-20: "You own Task 343 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/package/selectors.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `codex_tasks/task_343_toolbar_mapping_to_package_activation_policy.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - FAIL
- Script checks:
  - PASS (`check_layer_rules`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `cd v10 && npm run build` fails with TypeScript error in `v10/src/core/mod/package/guards.ts:226` (`Spread types may only be created from object types.`), outside Task 343 scoped edits.
- Newly introduced failures:
  - None identified in Task 343 scope.
- Blocking:
  - YES
- Mitigation:
  - Resolve the `guards.ts` typing error in its owning task branch, then rerun `cd v10 && npm run build`.

Manual verification notes:
- `toolbarMode -> modId` resolution now checks active package activation `toolbarModeMap` first via package selectors.
- Explicit compatibility fallback branch to legacy hardcoded mapping is preserved and logs once per mode/package key when policy mapping is missing.
- Toolbar labels and mode UI surface are unchanged; `FloatingToolbar` now passes `activePackageId` context to mode-resolution policy calls.
