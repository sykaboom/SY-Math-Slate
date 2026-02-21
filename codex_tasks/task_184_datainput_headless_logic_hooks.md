# Task 184: DataInput Headless Logic Hooks

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Extract mutable drafting logic from `DataInputPanel` into headless Input Studio hooks.
- What must NOT change:
  - No visual redesign and no store schema changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_184_datainput_headless_logic_hooks.md`
- `v10/src/features/editor/input-studio/hooks/*`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Out of scope:
- LLM/approval/publish workflows (handled in task_186~190).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Hooks return state/handlers only; no JSX.
- Compatibility:
  - Current `DataInputPanel` actions maintain existing behavior.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3
- Depends on tasks:
  - [`task_183`]
- Enables tasks:
  - [`task_185`, `task_186`, `task_187`, `task_188`, `task_189`, `task_190`]
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
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W3 (`task_183~190`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - Headless hook files single-owner
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

- [x] AC-1: At least one consolidated headless hook manages drafting state + core handlers.
- [x] AC-2: `DataInputPanel` uses headless hook outputs rather than inlining equivalent logic.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open DataInput panel and perform raw/block edits
   - Expected result: behavior unchanged
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Hook extraction can introduce stale closure bugs.
- Roll-back:
  - Revert hook extraction and inline logic in panel.

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
- `v10/src/features/editor/input-studio/hooks/useInputStudioHeadless.ts`
- `v10/src/features/editor/input-studio/hooks/types.ts`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/chrome/layout/DataInputPanel.tsx src/features/editor/input-studio`
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
- Headless hook state/handlers are now consumed by `DataInputPanel`; terminal verification completed via lint/build.

Notes:
- Draft mutation logic (raw/block sync, break insert/move/delete, apply guard) is centralized under `useInputStudioHeadless`.
