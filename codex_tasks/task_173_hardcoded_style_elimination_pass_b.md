# Task 173: Hardcoded Style Elimination Pass B

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Remove second batch of hardcoded style usages (mod-studio and adjunct components), continue budget reduction.
- What must NOT change:
  - no feature flow changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_173_hardcoded_style_elimination_pass_b.md`
- `v10/src/features/platform/mod-studio/**`
- `v10/src/features/editor/canvas/PasteHelperModal.tsx`
- `v10/src/features/editor/canvas/objects/ImageBlock.tsx`
- `codex_tasks/workflow/style_budget.env`
- `v10/AI_READ_ME.md`

Out of scope:
- style removal in store defaults requiring value-contract changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Compatibility:
  - preserve existing component states and interaction affordances.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - [`task_172`]
- Enables tasks:
  - [`task_174`]
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
    - pass B files single ownership
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

- [x] AC-1: pass B files remove designated hardcoded classes/values in favor of tokens.
- [x] AC-2: hardcoding budget decreases again from pass A.
- [x] AC-3: verification and lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_hardcoding_budget.sh`
   - Expected result: PASS with reduced budget.
   - Covers: AC-2

2) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - component-level contrast/readability regressions.
- Roll-back:
  - revert pass B edits and restore style budget threshold.

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
- `codex_tasks/task_173_hardcoded_style_elimination_pass_b.md`
- `v10/src/features/platform/mod-studio/theme/ThemeStudioSection.tsx`
- `v10/src/features/platform/mod-studio/policy/PolicyStudioSection.tsx`
- `v10/src/features/platform/mod-studio/publish/PublishStudioSection.tsx`
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/editor/canvas/PasteHelperModal.tsx`
- `v10/src/features/editor/canvas/objects/ImageBlock.tsx`
- `codex_tasks/workflow/style_budget.env`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_hardcoding_budget.sh`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

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
- pass B target files removed regex-matched hardcoded colors in mod-studio + modal/image controls.
- pass B scope contributes to total hardcoding count reduction (`56 -> 21`).
- verification suite passed with updated budget gate (`max=24`).

Notes:
- feature flow preserved; only presentation token mapping changed.
