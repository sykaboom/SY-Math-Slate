# Task 162: Hardcoding Token Detection Gate

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add a repository gate that measures hardcoded style/color usage in `v10/src/features` and `v10/src/ui`.
  - Establish a baseline budget and fail when usage regresses above budget.
- What must NOT change:
  - No runtime behavior changes.
  - No style refactor in this task (baseline gate only).

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_162_hardcoding_token_detection_gate.md`
- `codex_tasks/workflow/style_budget.env` (new)
- `scripts/check_v10_hardcoding_budget.sh` (new)
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Eliminating existing hardcoded styles.
- Theme token migration implementation.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Scan scope limited to `v10/src/features` and `v10/src/ui`.
  - Budget-based gate to prevent regressions while allowing existing baseline.
- Compatibility:
  - Script must run in local and CI shell environments.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W0
- Depends on tasks:
  - [`task_161`]
- Enables tasks:
  - [`task_172`, `task_173`]
- Parallel group:
  - G0-governance
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W0 (`task_162~166`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - verification scripts and workflow budgets owned by single implementer
  - Parallel slot plan:
    - max 6 active slots

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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - add budget/script files
  - [x] Semantic/rule changes:
    - update AI_READ_ME verification baseline section

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `scripts/check_v10_hardcoding_budget.sh` exists and reports pass/fail based on budget.
- [x] AC-2: `codex_tasks/workflow/style_budget.env` defines current baseline max and is consumed by script.
- [x] AC-3: `scripts/run_repo_verifications.sh` executes this gate.
- [x] AC-4: W0 verifications pass with current baseline.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_hardcoding_budget.sh`
   - Expected result: PASS with baseline counters.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: includes hardcoding budget check and passes.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Regex may over/under count style patterns.
- Roll-back:
  - Revert gate script and budget file, keep previous verification set.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이. 진행하자. 위임모드 진행!"

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_162_hardcoding_token_detection_gate.md`
- `codex_tasks/workflow/style_budget.env`
- `scripts/check_v10_hardcoding_budget.sh`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_hardcoding_budget.sh`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- Hardcoding usage baseline fixed to `56` and current count is `56`.
- Gate runs in standalone and verification bundle paths.

Notes:
- This task establishes baseline guard only; elimination is deferred to W1 hardcoding cleanup tasks.
