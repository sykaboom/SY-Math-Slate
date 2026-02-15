# Task 174: Visual Regression Theme Gate

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add a lightweight theme visual regression gate script for W1 (preset contract + token hooks + budget check chain).
- What must NOT change:
  - No runtime feature behavior changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_174_visual_regression_theme_gate.md`
- `scripts/check_v10_theme_visual_gate.sh` (new)
- `scripts/run_beta_quality_gate.sh`
- `v10/tests/theme_visual_gate.mjs` (new)
- `v10/AI_READ_ME.md`

Out of scope:
- full pixel screenshot regression framework adoption.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Compatibility:
  - gate must run in local/CI with existing toolchain.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - [`task_170`, `task_171`, `task_172`, `task_173`]
- Enables tasks:
  - [`task_175+`]
- Parallel group:
  - G1-theme
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

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
    - visual gate files single ownership
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

- [x] AC-1: theme visual gate script exists and validates preset/token contract.
- [x] AC-2: beta gate runs theme visual check.
- [x] AC-3: end-stage verification and beta gate pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_theme_visual_gate.sh`
   - Expected result: PASS.
   - Covers: AC-1

2) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh && bash scripts/run_beta_quality_gate.sh`
   - Expected result: PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - gate becoming too strict for iterative UI work.
- Roll-back:
  - keep check script optional and remove from beta gate chain.

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
- `codex_tasks/task_174_visual_regression_theme_gate.md`
- `scripts/check_v10_theme_visual_gate.sh`
- `scripts/run_beta_quality_gate.sh`
- `v10/tests/theme_visual_gate.mjs`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_theme_visual_gate.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
- `bash scripts/run_beta_quality_gate.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`scripts/check_v10_theme_visual_gate.sh`)

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
- theme visual gate verifies preset contract (`chalk/parchment/notebook`) + token hook path.
- beta gate now includes theme visual gate before lint/build/smoke.
- end-stage verification and beta gate both PASS.

Notes:
- lightweight textual contract gate added without screenshot framework dependency.
