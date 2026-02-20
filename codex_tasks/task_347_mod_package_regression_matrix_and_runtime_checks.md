# Task 347: Mod Package Regression Matrix + Runtime Checks

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Add regression test/check matrix for package activation + input routing + host policy behavior.
  - Encode critical runtime checks for desktop/tablet/mobile.
- What must NOT change:
  - production runtime behavior.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_mod_contract.sh` (extended runtime assertions)
- `scripts/scan_guardrails.sh` (stage/report updates)
- `codex_tasks/workflow/` (matrix doc or env thresholds)

Out of scope:
- UI refactor or feature additions.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - checks are shell/rg based; no heavy test framework install.
- Compatibility:
  - check outputs remain script-friendly for CI logs.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W347
- Depends on tasks:
  - [`task_341_pointer_wheel_routing_integration`, `task_342_keyboard_routing_focus_guard_integration`, `task_343_toolbar_mapping_to_package_activation_policy`, `task_344_ui_host_contribution_filter_by_package_policy`, `task_346_mod_package_boundary_enforcement_and_ci`]
- Enables tasks:
  - `task_348_mod_package_docs_rollout_and_operator_guide`
  - `task_349_legacy_dual_axis_retirement`
- Parallel group:
  - G6-quality
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `scripts/check_mod_contract.sh`, `scripts/scan_guardrails.sh`
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - depends on multiple prior task outputs; best as convergence gate.

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
    - multiple migration pieces need one convergence guard to prevent silent regressions.
  - Sunset criteria:
    - package architecture is stable and checks become baseline.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: matrix covers desktop/tablet/mobile runtime checks.
- [x] AC-2: regression checks assert package activation and input routing contracts.
- [x] AC-3: check chain is executable in CI/pre-push without new dependencies.

---

## Manual Verification Steps (Base Required)

1) matrix execution
   - Command / click path:
     - run matrix script/check suite
   - Expected result:
     - pass summary with viewport/runtime sections
   - Covers: AC-1, AC-2

2) CI compatibility
   - Command / click path:
     - run full pre-push sequence locally
   - Expected result:
     - no dependency install required
   - Covers: AC-3

3) failure mode smoke
   - Command / click path:
     - inject known violation and rerun checks
   - Expected result:
     - deterministic fail output
   - Covers: AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - false positives creating operator fatigue.
- Roll-back:
  - downgrade non-critical checks to WARN while preserving boundary FAIL checks.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive, 2026-02-20: "You own Task 347 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_mod_contract.sh`
- `scripts/scan_guardrails.sh`
- `codex_tasks/workflow/mod_package_runtime_regression_matrix.csv`
- `codex_tasks/workflow/mod_package_runtime_thresholds.env`
- `codex_tasks/task_347_mod_package_regression_matrix_and_runtime_checks.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_mod_contract.sh`
- `bash scripts/scan_guardrails.sh`
- `cd v10 && npm run lint`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A (not required in this task)
- Script checks:
  - PASS (`check_mod_contract.sh`, `scan_guardrails.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None observed in required gates.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Added a workflow-managed runtime regression matrix file with required rows for `desktop`, `tablet`, and `mobile`, each covering `activation_policy`, `input_routing`, and `host_policy`.
- Added wave-scoped threshold config (`MOD_RUNTIME_REQUIRED_VIEWPORTS`, `MOD_RUNTIME_REQUIRED_CHECK_IDS`, `MOD_RUNTIME_MIN_ROWS_PER_VIEWPORT`) and wired it into `check_mod_contract.sh`.
- `check_mod_contract.sh` now validates import boundaries, required symbols, and matrix coverage/pattern assertions, and emits sectioned logs suitable for CI.
- `scan_guardrails.sh` stage/report text now explicitly surfaces the mod runtime matrix gate in the guardrail scan output.
