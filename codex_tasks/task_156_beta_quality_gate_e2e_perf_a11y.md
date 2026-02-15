# Task 156: Beta Quality Gate (E2E/Perf/A11y)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Define and implement beta gate checks for end-to-end behavior, performance, and accessibility.
  - Create release checklist for 1st UI/UX review start.
- What must NOT change:
  - No silent lowering of quality thresholds after failures.

---

## Scope (Base Required)

Touched files/directories:
- `v10/tests/**` (new/updated)
- `scripts/**` (quality gate scripts)
- `v10/AI_READ_ME.md`
- `codex_tasks/**` (gate docs)

Out of scope:
- Major feature addition unrelated to quality gates.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (unless test tooling addition is user-approved)
- Boundary rules:
  - Tests target visible user journeys and security invariants.
  - Performance checks include tablet viewport scenarios.
- Compatibility:
  - Gate scripts should run locally and CI.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: e2e scenarios
    - B: perf/a11y checks
    - C: release gate scripts/docs
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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: E2E tests cover host/student core journeys and approval flow.
- [ ] AC-2: Performance checks define pass/fail budgets for tablet targets.
- [ ] AC-3: Accessibility baseline checks (keyboard/labels) pass.
- [ ] AC-4: Release gate script reports green for beta entry.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run e2e suite.
   - Expected result: core journeys pass.
   - Covers: AC-1

2) Step:
   - Command / click path: run perf and a11y checks.
   - Expected result: budgets and baseline checks pass.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path: run release gate script.
   - Expected result: beta gate output PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-strict gates may block all releases.
- Roll-back:
  - Keep hard fail only on critical invariants; others as warning with explicit sign-off.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES / NO
- Mitigation:
  - ...

Manual verification notes:
- ...

Notes:
- ...
