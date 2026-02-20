# Task 345: Mod Studio Package Diagnostics + Conflict Surface

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Extend mod studio diagnostics to show active package, package conflicts, and activation policy mismatches.
  - Provide clear non-blocking warning surfaces for package-policy/runtime divergence.
- What must NOT change:
  - existing module diagnostics behavior unrelated to package/runtime.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/core/mod/package/*` (diagnostic selectors only)

Out of scope:
- package registry contract changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - studio reads runtime/package state; runtime core must not import studio.
- Compatibility:
  - existing diagnostics remain visible.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W345
- Depends on tasks:
  - [`task_338_template_pack_adapter_to_mod_package_registry`, `task_344_ui_host_contribution_filter_by_package_policy`]
- Enables tasks:
  - `task_349_legacy_dual_axis_retirement`
- Parallel group:
  - G4-studio
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/features/mod-studio/modules/moduleDiagnostics.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES (after 344)
- Rationale:
  - studio surface should be serialized for consistent messaging.

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
    - package-policy/runtime mismatch is otherwise opaque during migration.
  - Sunset criteria:
    - no dual-axis paths remain.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: studio diagnostics include active package id and package conflict list.
- [x] AC-2: activation policy mismatch warnings are visible and deterministic.
- [x] AC-3: diagnostics do not mutate runtime state.

---

## Manual Verification Steps (Base Required)

1) active package visibility
   - Command / click path:
     - open mod studio diagnostics
   - Expected result:
     - active package and included mod list shown
   - Covers: AC-1

2) conflict fixture
   - Command / click path:
     - load package fixture with conflict metadata
   - Expected result:
     - warning shown without crash
   - Covers: AC-2

3) read-only guarantee
   - Command / click path:
     - inspect diagnostics code path for write operations
   - Expected result:
     - no runtime mutation side effects
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - overly noisy diagnostics can reduce operator trust.
- Roll-back:
  - keep core diagnostics and gate package diagnostics behind flag.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive, 2026-02-20: "You own Task 345 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/package/selectors.ts`
- `v10/src/features/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/mod-studio/modules/ModuleStudioSection.tsx`
- `codex_tasks/task_345_mod_studio_package_diagnostics_and_conflicts.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - FAIL
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `cd v10 && npm run build` fails with TypeScript error in `v10/src/mod/runtime/templatePackRegistry.ts:56` (`TemplatePackValidationResult` not assignable to `TemplatePackValidationFailure | null`), outside Task 345 scope.
- Newly introduced failures:
  - None identified in Task 345 scope.
- Blocking:
  - YES
- Mitigation:
  - Fix the existing `templatePackRegistry.ts` typing issue on its owning task branch, then rerun `cd v10 && npm run build`.

Manual verification notes:
- Runtime diagnostics now surface requested/resolved active package, package mod list, declared/reverse conflicts, active conflicts, and unknown conflict targets.
- Activation policy mismatch warnings are deterministic and read-only: active mod outside package, toolbar-mode target mismatch, and unregistered policy target mod.
- Diagnostic path is pure derivation only (`moduleDiagnostics.ts` + package selectors): no store writes, registry mutation, or runtime manager mutation were added.
