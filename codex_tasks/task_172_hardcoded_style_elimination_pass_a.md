# Task 172: Hardcoded Style Elimination Pass A

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Remove first batch of hardcoded color/style usages in high-impact files and map to semantic theme tokens.
- What must NOT change:
  - No UX flow changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_172_hardcoded_style_elimination_pass_a.md`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/app/globals.css`
- `codex_tasks/workflow/style_budget.env`
- `v10/AI_READ_ME.md`

Out of scope:
- pass B files.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Compatibility:
  - existing interactions and controls remain unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - [`task_168`, `task_171`]
- Enables tasks:
  - [`task_173`, `task_174`]
- Parallel group:
  - G1-theme
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
    - W1 (`task_167~174`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - pass A files single ownership
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

---

## Acceptance Criteria (Base Required)

- [x] AC-1: selected pass A files replace hardcoded classes with tokenized classes/vars.
- [x] AC-2: hardcoding budget is reduced from W0 baseline.
- [x] AC-3: gate scripts and lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_hardcoding_budget.sh`
   - Expected result: PASS with reduced budget.
   - Covers: AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - visual contrast drift in panel/header components.
- Roll-back:
  - revert pass A file edits and restore prior budget.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "바로 w1 넘어가자."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_172_hardcoded_style_elimination_pass_a.md`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/app/globals.css`
- `codex_tasks/workflow/style_budget.env`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_hardcoding_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`scripts/check_v10_hardcoding_budget.sh`)

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
- pass A target files (`DataInputPanel`, `PlayerBar`) removed regex-matched hardcoded color classes.
- budget reduced from W0 baseline `56` to current `21` (cap set to `24`).
- interactions and controls remained unchanged.

Notes:
- semantic theme variables are now used in high-impact layout surfaces.
