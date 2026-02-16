# Task 264: Max Orchestration Mode Workflow Setting

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - Make max-efficiency orchestration controllable by natural-language user trigger.
  - Encode this mode in always-on governance and delegated playbook.
  - Add explicit verification cadence policy to reduce lint/build bottlenecks without dropping safety.
- What must NOT change:
  - No runtime product behavior changes in `v10/src/**`.
  - No dependency changes.
  - No relaxation of safety gates/escalation conditions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_264_max_orchestration_mode_workflow_setting.md`
- `AGENTS.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/_TEMPLATE_task.md`

Out of scope:
- Feature implementation
- Build system behavior changes
- Non-workflow documentation rewrites

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep AGENTS short and governance-focused.
  - Keep detailed scheduling logic in playbook.
  - Keep template requirements actionable and minimal.
- Compatibility:
  - Must remain consistent with delegated invariants and max 6 slots.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GOV
- Depends on tasks:
  - [`task_263`]
- Enables tasks:
  - All future delegated waves with explicit max-mode trigger and cadence guidance.
- Parallel group:
  - G-governance
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

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

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - None.
  - [x] Semantic/rule changes:
    - Updated governance and delegated execution workflow docs.

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `AGENTS.md` supports natural-language max mode on/off triggers and binds max-mode behavior to playbook rules.
- [x] AC-2: Playbook documents verification cadence policy (`mid` frequent, `end` wave-close batching).
- [x] AC-3: Task template includes requested orchestration mode field in delegated planning.
- [x] AC-4: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `AGENTS.md` delegated section.
   - Expected result: natural-language trigger phrases and max-mode expectations are explicit.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect `codex_tasks/_PLAYBOOK_subagent_oneclick.md`.
   - Expected result: verification cadence and bottleneck-control guidance are explicit.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect `codex_tasks/_TEMPLATE_task.md` delegated block.
   - Expected result: "Requested orchestration mode" field exists.
   - Covers: AC-3

4) Step:
   - Command / click path: run `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`.
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly aggressive max-mode expectations can reduce flexibility for edge cases.
- Roll-back:
  - Revert this task commit to restore prior workflow policy wording.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user instruction "오케이 최적운영으로 워크플로 세팅해버려."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_264_max_orchestration_mode_workflow_setting.md`
- `AGENTS.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/_TEMPLATE_task.md`

Commands run (only if user asked or required by spec):
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None observed.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - Not required.

Manual verification notes:
- Natural-language trigger phrases were added in governance/playbook.
- Max-mode scheduler behavior and verification cadence are now explicitly documented.
- Delegated template now captures orchestration mode request phrase.
- Mid-stage verification passes.

Notes:
- This task modifies workflow governance only.
