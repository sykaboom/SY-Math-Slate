# Task 165: Command Mutation Trace Baseline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add baseline guard that tracks direct store write-path exceptions outside command pathways.
  - Fail on regressions above allowed direct-write baseline.
- What must NOT change:
  - No large store refactor in this task.
  - No runtime behavior change.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_165_command_mutation_trace_baseline.md`
- `codex_tasks/workflow/command_path_budget.env` (new)
- `scripts/check_v10_command_write_path.sh` (new)
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Migrating all mutations to command bus.
- Removing existing approved exceptions.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Guard script uses deterministic grep-based counting and explicit allowlist.
  - Baseline values stored in workflow env file.
- Compatibility:
  - Script runs in local/CI shell.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W0
- Depends on tasks:
  - [`task_161`]
- Enables tasks:
  - [`task_175+` editor/input migrations]
- Parallel group:
  - G0-architecture
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
    - command-path guard files owned by single implementer
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
    - add command path budget and check script
  - [x] Semantic/rule changes:
    - AI_READ_ME migration baseline update

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `check_v10_command_write_path.sh` reports direct write-path counts.
- [x] AC-2: budget env file exists and script enforces threshold.
- [x] AC-3: verification runner executes command write-path guard.
- [x] AC-4: guard passes with current baseline.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_command_write_path.sh`
   - Expected result: PASS with baseline counts.
   - Covers: AC-1, AC-2, AC-4

2) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: includes command write-path guard and passes.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Pattern-based matching may need tuning as migration evolves.
- Roll-back:
  - Revert guard and keep migration tracking manual.

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
- `codex_tasks/task_165_command_mutation_trace_baseline.md`
- `codex_tasks/workflow/command_path_budget.env`
- `scripts/check_v10_command_write_path.sh`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_command_write_path.sh`
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
- Baseline counts fixed and passing: `canvas_getstate=6`, `ui_getstate=16`, `canvas_hydrate=3`.
- Guard is wired into repository verification runner via `check_` script discovery.

Notes:
- This baseline intentionally tracks exceptions without forcing immediate large refactor.
