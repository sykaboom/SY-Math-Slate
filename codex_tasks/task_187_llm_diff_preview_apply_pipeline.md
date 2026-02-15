# Task 187: LLM Diff Preview and Apply Pipeline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add candidate-vs-current diff preview pipeline for LLM-generated drafts and controlled apply path.
- What must NOT change:
  - No direct apply without explicit user action.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_187_llm_diff_preview_apply_pipeline.md`
- `v10/src/features/input-studio/diff/*`
- `v10/src/features/input-studio/llm/*`
- `v10/src/features/layout/DataInputPanel.tsx`

Out of scope:
- Semantic/math-aware diff algorithms.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Diff logic remains pure deterministic utilities.
- Compatibility:
  - Existing apply button semantics preserved.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3
- Depends on tasks:
  - [`task_186`]
- Enables tasks:
  - [`task_190`]
- Parallel group:
  - G3-input
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

- [x] AC-1: Diff summary is generated for candidate draft blocks.
- [x] AC-2: Candidate apply action uses command path and updates draft/canvas only on explicit click.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: request LLM draft, inspect diff summary, click apply
   - Expected result: diff visible before apply; apply updates target state once
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect diff mapping can mislead user preview.
- Roll-back:
  - Keep candidate apply path and hide diff visualization.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "w3 위임모드 실행. 서브에이전트 최적 설계하여 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/input-studio/diff/types.ts`
- `v10/src/features/input-studio/diff/draftDiff.ts`
- `v10/src/features/input-studio/llm/useInputStudioLlmDraft.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/layout/DataInputPanel.tsx src/features/input-studio`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
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
  - None
- Newly introduced failures:
  - None
- Blocking:
  - None
- Mitigation:
  - N/A

Manual verification notes:
- LLM candidate preview shows summary counts (added/modified/removed) before any apply/queue action.

Notes:
- Candidate apply runs deterministic normalize pipeline first and then updates draft state explicitly.
