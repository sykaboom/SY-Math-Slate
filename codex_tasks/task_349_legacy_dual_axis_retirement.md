# Task 349: Legacy Dual-Axis Retirement (Template Registry De-dup)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Retire temporary dual-axis compatibility paths once package runtime, routing, diagnostics, and checks are all green.
  - Remove duplicated mapping logic and deprecated fallbacks.
- What must NOT change:
  - user-visible package/template behavior.
  - runtime stability in production path.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/features/toolbar/toolbarModePolicy.ts`
- `v10/src/core/mod/package/*`
- `v10/docs/architecture/ModEngine.md`

Out of scope:
- unrelated feature development.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - no direct reintroduction of hardcoded toolbar mapping outside package policy.
- Compatibility:
  - only execute after all predecessor tasks validated in regression matrix.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W349
- Depends on tasks:
  - [`task_345_mod_studio_package_diagnostics_and_conflicts`, `task_347_mod_package_regression_matrix_and_runtime_checks`, `task_348_mod_package_docs_rollout_and_operator_guide`]
- Enables tasks:
  - []
- Parallel group:
  - G8-retirement
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - `v10/src/mod/runtime/templatePackRegistry.ts`
  - `v10/src/features/toolbar/toolbarModePolicy.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - final cleanup must be serialized after all convergence checks.

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
    - fallback paths can silently reintroduce SSOT drift if left long-term.
  - Sunset criteria:
    - all fallback branches removed and regression suite green.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES / NO
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: compatibility fallbacks removed for dual-axis runtime ownership.
- [x] AC-2: package policy is sole toolbar mapping authority.
- [x] AC-3: full lint/build/check chain passes after cleanup.
- [x] AC-4: no canonical runtime docs or roadmap references point to `ModeEngine.md`.

---

## Manual Verification Steps (Base Required)

1) fallback removal audit
   - Command / click path:
     - `rg -n "fallback|legacy|template.*runtime" target files`
   - Expected result:
     - only intended historical comments remain
   - Covers: AC-1

2) mapping authority check
   - Command / click path:
     - inspect toolbar mode policy path
   - Expected result:
     - package policy selector is sole authority
   - Covers: AC-2

3) final gates
   - Command / click path:
     - `bash scripts/check_layer_rules.sh`
     - `bash scripts/check_mod_contract.sh`
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - all pass
   - Covers: AC-3

4) stale reference scan
   - Command / click path:
     - `rg -n "ModeEngine\\.md" v10 PROJECT_ROADMAP.md codex_tasks`
   - Expected result:
     - no canonical references remain outside archived history/spec logs.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - premature fallback removal can break edge paths.
- Roll-back:
  - restore one-wave compatibility branch and rerun regression matrix.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive, 2026-02-20: "You own Task 349 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/features/toolbar/toolbarModePolicy.ts`
- `v10/src/core/mod/package/selectors.ts`
- `v10/docs/architecture/ModEngine.md`
- `codex_tasks/task_349_legacy_dual_axis_retirement.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `rg -n "fallback|legacy|template.*runtime" v10/src/mod/runtime/templatePackRegistry.ts v10/src/features/toolbar/toolbarModePolicy.ts v10/src/core/mod/package v10/docs/architecture/ModEngine.md`
- `rg -n "ModeEngine\\.md" v10 PROJECT_ROADMAP.md codex_tasks`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules.sh`, `check_mod_contract.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None in final required gate chain.
- Newly introduced failures:
  - None in final required gate chain.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- `toolbarModePolicy.ts` removed feature-layer hardcoded `mode -> modId` fallback/logging and resolves via package selectors only.
- `core/mod/package/selectors.ts` now centralizes deterministic compatibility mapping for `mode <-> modId`; mapped-only selector APIs are retained as deprecated shims.
- `templatePackRegistry.ts` now uses package batch registration (`registerRuntimeModPackages`) for deterministic sync and de-duplicated adapter registration flow.
- `ModEngine.md` updated to document package-selector-only toolbar mapping authority and retirement status language.
- `ModeEngine.md` scan shows active docs/roadmap do not use it as canonical path; remaining mentions are archival/history context.
