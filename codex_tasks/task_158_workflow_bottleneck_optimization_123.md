# Task 158: Workflow Bottleneck Optimization (1/2/3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Apply three workflow optimizations:
    1) fixed 2-stage verification rule (`mid` vs `end`),
    2) DAG task template standardization + task-generation helper,
    3) centralized legacy budget number management per wave.
- What must NOT change:
  - No runtime feature changes in `v10` app behavior.
  - No external dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_158_workflow_bottleneck_optimization_123.md`
- `codex_tasks/_TEMPLATE_task.md`
- `codex_tasks/workflow/legacy_budget.env` (new)
- `scripts/run_repo_verifications.sh`
- `scripts/check_v10_changed_lint.sh`
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/new_codex_task.sh` (new)
- `scripts/update_legacy_budget.sh` (new)
- `.githooks/pre-push`
- `v10/AI_READ_ME.md`

Out of scope:
- Implementing Task 139~157 feature code.
- Deletion/cleanup execution tasks.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Workflow scripts remain shell-only and deterministic.
  - Stage rules must be explicit:
    - `mid`: changed-lint + script checks
    - `end`: full lint + full build + script checks
  - Legacy thresholds must load from one central budget file.
- Compatibility:
  - Existing hooks continue to function.

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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Verification scripts support deterministic 2-stage mode (`mid`, `end`).
- [x] AC-2: Task template includes DAG/Wave metadata section and helper script can generate next task from template.
- [x] AC-3: Legacy freeze thresholds are sourced from central budget file and can be updated via helper script.
- [x] AC-4: `bash scripts/run_repo_verifications.sh` (mid) and `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` both pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: mid-stage checks pass (changed lint + scripts).
   - Covers: AC-1, AC-4

2) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: end-stage checks pass (full lint + full build + scripts).
   - Covers: AC-1, AC-4

3) Step:
   - Command / click path: `scripts/new_codex_task.sh --dry-run "workflow_test" "Workflow Test"`
   - Expected result: next task filename and DAG metadata placeholders are generated.
   - Covers: AC-2

4) Step:
   - Command / click path: `scripts/update_legacy_budget.sh --wave W158 --use-ui-max 111 --use-canvas-max 76 --dispatch-min 13`
   - Expected result: budget file updates and freeze script consumes values.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Stage mode misconfiguration could slow hooks or skip intended checks.
  - Budget file parse failures could break freeze checks.
- Roll-back:
  - Restore previous script versions and inline thresholds from git history.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_158_workflow_bottleneck_optimization_123.md`
- `codex_tasks/_TEMPLATE_task.md`
- `codex_tasks/workflow/legacy_budget.env`
- `scripts/run_repo_verifications.sh`
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/new_codex_task.sh`
- `scripts/update_legacy_budget.sh`
- `.githooks/pre-push`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/new_codex_task.sh --dry-run workflow_test "Workflow Test"`
- `scripts/update_legacy_budget.sh --wave W158 --use-ui-max 111 --use-canvas-max 76 --dispatch-min 13`
- `scripts/check_v10_legacy_freeze.sh`
- `bash scripts/run_repo_verifications.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None observed in this task scope.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Mid-stage verification: changed-lint path + script bundle passed.
- End-stage verification: full lint + full build + script bundle passed.
- Legacy budget file update consumed by freeze check (`Budget wave: W158`).
- DAG template helper dry-run produced next task id/path correctly.

Notes:
- `.githooks/pre-push` now routes verification stage to `end` when v10 changes are present.
