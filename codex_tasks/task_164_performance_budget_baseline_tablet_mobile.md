# Task 164: Performance Budget Baseline Tablet Mobile

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Externalize beta performance budget values into workflow-managed env file.
  - Make perf gate consume budget env for deterministic baseline control.
- What must NOT change:
  - No lowering of budget silently.
  - No runtime feature changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_164_performance_budget_baseline_tablet_mobile.md`
- `codex_tasks/workflow/perf_budget.env` (new)
- `scripts/run_beta_quality_gate.sh`
- `v10/tests/beta_gate_perf_a11y.mjs`
- `v10/AI_READ_ME.md`

Out of scope:
- Full perf optimization implementation.
- New perf tool dependencies.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Budget source must be single-file (`perf_budget.env`).
  - Gate script reads budget and passes value into node checks.
- Compatibility:
  - Existing beta gate command remains stable.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W0
- Depends on tasks:
  - [`task_161`]
- Enables tasks:
  - [`task_211`, `task_226`]
- Parallel group:
  - G0-platform
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
    - perf budget and beta gate files owned by single implementer
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
    - add perf budget file
  - [x] Semantic/rule changes:
    - AI_READ_ME baseline section update

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `perf_budget.env` exists and defines baseline JS bundle budget.
- [x] AC-2: beta gate script sources the budget and exports env into node check.
- [x] AC-3: node perf check reads env budget and reports budget in pass log.
- [x] AC-4: beta gate passes with current baseline.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `bash scripts/run_beta_quality_gate.sh`
   - Expected result: PASS and reports active JS budget value.
   - Covers: AC-1, AC-2, AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misconfigured env parsing could break beta gate.
- Roll-back:
  - Revert env integration and restore fixed budget literal.

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
- `codex_tasks/task_164_performance_budget_baseline_tablet_mobile.md`
- `codex_tasks/workflow/perf_budget.env`
- `scripts/run_beta_quality_gate.sh`
- `v10/tests/beta_gate_perf_a11y.mjs`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `bash scripts/run_beta_quality_gate.sh`
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
- Beta gate reports active budget from env and passes with `js_bytes=1272160, budget=3200000`.
- Perf budget is now centralized in `codex_tasks/workflow/perf_budget.env`.

Notes:
- Budget literal is removed from process control path; future updates should be budget-file driven.
