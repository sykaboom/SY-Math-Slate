# Task 224: Chaos and Recovery Drills

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add repeatable chaos/recovery drill runbook + automated guard script.
- What must NOT change:
  - No runtime feature behavior changes in app core.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_224_chaos_recovery_drills.md`
- `codex_tasks/workflow/chaos_recovery_drills.md` (new)
- `scripts/check_v10_chaos_recovery_drills.sh` (new)
- `v10/tests/chaos_recovery_drills.mjs` (new)

Out of scope:
- Legacy purge changes
- Beta gate v2 orchestration
- RC checklist document

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Drill automation should stay as static checks and deterministic node test.
- Compatibility:
  - Must run in existing repo verification chain without external services.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W9
- Depends on tasks:
  - [`task_219`]
- Enables tasks:
  - [`task_225`, `task_226`, `task_227`]
- Parallel group:
  - G9-release
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
    - task_219 + task_224~227
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - release workflow docs/scripts/test files owned by this task.
  - Parallel slot plan:
    - sequential

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
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Chaos/recovery drill runbook exists with at least 5 deterministic drills.
- [x] AC-2: Automated check script validates drill artifacts and fails on missing critical guards.
- [x] AC-3: Drill check is executable standalone and via repo verification chain.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_chaos_recovery_drills.sh`
   - Expected result: PASS.
   - Covers: AC-2, AC-3

2) Step:
   - Command / click path: open `codex_tasks/workflow/chaos_recovery_drills.md`
   - Expected result: includes 5+ drills + recovery validation steps.
   - Covers: AC-1

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly brittle string checks can cause noisy failures.
- Roll-back:
  - Loosen check assertions and rerun verification.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "1,2 실행하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_224_chaos_recovery_drills.md`
- `codex_tasks/workflow/chaos_recovery_drills.md`
- `scripts/check_v10_chaos_recovery_drills.sh`
- `v10/tests/chaos_recovery_drills.mjs`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_chaos_recovery_drills.sh`
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
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- runbook now documents 5 deterministic drills and recovery criteria.
- dedicated drill check script passes standalone and inside end-stage verification.

Notes:
- Drill checks are fail-closed and static to avoid external service dependency.
