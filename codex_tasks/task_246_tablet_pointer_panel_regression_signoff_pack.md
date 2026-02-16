# Task 246: Tablet Pointer/Panel Regression Signoff Pack

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Execute final regression signoff for pointer accuracy + windowed panel UX across required tablet viewports.
  - Produce a concise pass/fail matrix linked to `task_236~245` outcomes.
- What must NOT change:
  - No feature changes.
  - No dependency changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_246_tablet_pointer_panel_regression_signoff_pack.md`
- `codex_tasks/workflow/tablet_pointer_panel_signoff.csv` (new)
- `codex_tasks/workflow/tablet_pointer_panel_signoff.md` (new summary)

Out of scope:
- Additional refactors or design changes
- New product features

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Signoff outputs must be factual and reproducible.
  - No fabricated pass results.
- Compatibility:
  - Uses outputs from `task_236` (pointer) and `task_244` (shell cutover).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-G
- Depends on tasks:
  - [`task_245`]
- Enables tasks:
  - []
- Parallel group:
  - G-signoff
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

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
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Signoff matrix includes all required viewports (768x1024, 820x1180, 1024x768, 1180x820).
- [ ] AC-2: Matrix includes pointer accuracy, panel drag/reopen, launcher reachability, and student visibility checks.
- [ ] AC-3: Any failing item includes repro path and blocking severity.
- [ ] AC-4: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: execute viewport/manual checks and record matrix.
   - Expected result: complete pass/fail table with reproducible notes.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: run end-stage verification.
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Manual signoff can miss intermittent issues if run count is too low.
- Roll-back:
  - Not applicable (report-only task).

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

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
- (to be filled)

Notes:
- (to be filled)
