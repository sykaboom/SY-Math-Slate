# Task 119: Baseline Freeze and Regression Matrix

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Define and freeze an explicit regression matrix for command/toolbar/state migration.
  - Add a lightweight baseline verification script for delegated migration waves.
- What must NOT change:
  - No runtime behavior changes in this task.
  - No command/store refactor yet.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_119_baseline_freeze_and_regression_matrix.md`
- `scripts/check_v10_migration_baseline.sh` (new)
- `v10/AI_READ_ME.md` (baseline verification section)

Out of scope:
- Any mutation logic rewrite
- Command registration changes
- UI rendering changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Script must be bash-only and deterministic.
  - Baseline checks must use local static analysis (rg/lint/build hooks), no external network calls.
- Compatibility:
  - Existing pre-commit/pre-push flows remain compatible.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_119 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `scripts/check_v10_migration_baseline.sh`
    - Implementer-B: `v10/AI_READ_ME.md`
    - Implementer-C: `codex_tasks/task_119_baseline_freeze_and_regression_matrix.md`
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `scripts/check_v10_migration_baseline.sh` exists and is executable.
- [x] AC-2: Script validates baseline migration invariants (command presence/store references/build hooks) with deterministic pass/fail output.
- [x] AC-3: `v10/AI_READ_ME.md` includes baseline verification commands for task_119~132 chain.
- [x] AC-4: `bash scripts/run_repo_verifications.sh` continues to pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `chmod +x scripts/check_v10_migration_baseline.sh && scripts/check_v10_migration_baseline.sh`
   - Expected result: script runs and prints baseline status
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md`
   - Expected result: baseline verification section added
   - Covers: AC-3

3) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: repository verifications pass
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-strict baseline checks could cause noisy failures.
- Roll-back:
  - Remove baseline script and revert doc section.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "좋아 모든 권한을 주겠다. 너를 오케스트라로 위임하여 작업완료를 명령한다.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- See task-scoped file list in this commit diff.

Commands run (only if user asked or required by spec):
- node scripts/gen_ai_read_me_map.mjs
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/run_repo_verifications.sh
- scripts/check_layer_rules.sh
- scripts/check_v10_migration_baseline.sh

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (non-blocking, pre-existing).
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Lint/build/repo verification scripts passed for the delegated chain.
- Command-bus migration, declarative shadow/cutover path, and UI store split scaffold were integrated without layer violations.

Notes:
- Baseline locking task for delegated migration waves.
