# Task 137: Legacy Path Freeze and Gate

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add deterministic guard scripts that prevent regression toward legacy direct-mutation paths.
  - Encode baseline guardrails for migration metrics and forbidden pattern growth.
- What must NOT change:
  - No forced deletion of remaining legacy paths in this task.
  - No blocking on informational metric drift outside explicit thresholds.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_137_legacy_path_freeze_and_gate.md`
- `scripts/check_v10_legacy_freeze.sh` (new)
- `scripts/run_repo_verifications.sh`
- `scripts/check_v10_migration_baseline.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Runtime feature changes.
- Large refactors in `v10/src/features/**`.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Scripts must be shell-only and deterministic.
  - Freeze script should focus on measurable guard conditions.
- Compatibility:
  - Script outputs must be CI/pre-commit friendly.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_133~138
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: new freeze script
    - Implementer-B: verification runner integration
    - Implementer-C: docs and baseline notes
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

- [x] AC-1: `scripts/check_v10_legacy_freeze.sh` exists and returns deterministic pass/fail.
- [x] AC-2: Script enforces no-growth (or bounded growth) for legacy mutation indicators.
- [x] AC-3: `scripts/run_repo_verifications.sh` invokes the new freeze script.
- [x] AC-4: verification script set passes in repository state.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_legacy_freeze.sh`
   - Expected result: pass with explicit metric outputs.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: runner includes and passes legacy freeze check.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict thresholds may block valid refactors.
- Roll-back:
  - Adjust thresholds or temporarily remove freeze script from runner.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_137_legacy_path_freeze_and_gate.md`
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/check_v10_migration_baseline.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- scripts/check_v10_legacy_freeze.sh
- bash scripts/run_repo_verifications.sh
- node scripts/gen_ai_read_me_map.mjs

## Gate Results (Codex fills)

- Lint:
  - PASS (2 pre-existing warnings in untouched files)
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (pre-existing, non-blocking) in compileAnimationPlan/ChalkActor.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Freeze script thresholds and verification runner integration were validated by direct script execution.

Notes:
- Delegated execution completed for this task scope.
