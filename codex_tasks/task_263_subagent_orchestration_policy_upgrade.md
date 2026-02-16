# Task 263: Sub-agent Orchestration Policy Upgrade

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - Upgrade workflow governance so delegated execution is explicitly scheduler-driven, not wait-driven.
  - Encode dynamic executor/reviewer pool rules, heartbeat-safe agent management, and slot reuse policy.
  - Reflect these rules in workflow policy docs/templates so specs are authored with sub-agent efficiency in mind.
- What must NOT change:
  - No product/runtime behavior changes in `v10/src/**`.
  - No dependency additions.
  - No relaxation of safety gates (file lock, escalation conditions).

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_263_subagent_orchestration_policy_upgrade.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/_TEMPLATE_task.md`

Out of scope:
- Feature implementation tasks
- Layout/SVG protocol changes
- Build/lint gate logic changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep delegated chain hard-limit `<= 6` active slots.
  - Preserve one-file-one-implementer ownership lock.
  - Preserve escalation triggers as-is.
- Compatibility:
  - Must remain consistent with `AGENTS.md` delegated execution invariants.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GOV
- Depends on tasks:
  - []
- Enables tasks:
  - Improves all subsequent delegated waves by codifying scheduler-first execution.
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
    - Not expected.
  - [x] Semantic/rule changes:
    - Update workflow policy documents and task template guidance.

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Playbook documents scheduler-first orchestration (ready-queue, JIT spawn, immediate close/reuse).
- [x] AC-2: Playbook defines safe heartbeat policy (soft status ping vs termination) with long-running exception handling.
- [x] AC-3: Playbook defines dynamic pool strategy (executor/reviewer split) and wave transition rules.
- [x] AC-4: Task template requires explicit delegated orchestration plan details when Delegated mode applies.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `_PLAYBOOK_subagent_oneclick.md` sections for scheduler, heartbeat, pool, and slot rules.
   - Expected result: explicit normative rules exist and are actionable.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: inspect `_TEMPLATE_task.md` delegated block.
   - Expected result: explicit sub-agent orchestration planning fields are present.
   - Covers: AC-4

3) Step:
   - Command / click path: run `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`.
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict orchestration text may reduce operator flexibility.
- Roll-back:
  - Revert only this task commit to restore prior playbook/template language.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message requesting this policy be reflected in workflow-related markdown.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_263_subagent_orchestration_policy_upgrade.md`
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
- AC-1 PASS: playbook now includes scheduler-first orchestration rules and ready-queue refill policy.
- AC-2 PASS: playbook now defines safe heartbeat semantics and reassignment conditions with long-running exceptions.
- AC-3 PASS: dynamic slot split profiles and wave-mode guidance were added.
- AC-4 PASS: template delegated block now requires scheduler/heartbeat/reassignment planning and closeout metrics.
- AC-5 PASS: mid verification completed successfully.

Notes:
- This task intentionally modifies governance text only and preserves existing safety invariants.
