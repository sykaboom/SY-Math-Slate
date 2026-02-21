# Task 138: Purge Cutover Closeout

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Remove validated transitional fallback paths that are no longer needed after 133~137.
  - Finalize closeout docs and migration metrics for next-wave planning.
- What must NOT change:
  - No risky hard purge of still-used runtime paths.
  - No behavior changes outside validated cutover scope.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_138_purge_cutover_closeout.md`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (targeted fallback removals only)
- `v10/src/features/chrome/layout/DataInputPanel.tsx` (targeted fallback removals only)
- `v10/src/features/chrome/layout/PlayerBar.tsx` (targeted fallback removals only)
- `v10/src/features/platform/hooks/useSequence.ts` (targeted fallback removals only)
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Out of scope:
- Deleting `useCanvasStore` entirely.
- Refactoring unrelated domains.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Remove fallbacks only after command registration and guards are verified.
  - Keep deterministic error handling for failed command dispatch.
- Compatibility:
  - Host workflow remains functional for core controls.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_133~138
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: targeted toolbar/player purge
    - Implementer-B: sequence/data-input purge
    - Implementer-C: docs/map and final checks
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

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

- [x] AC-1: Targeted fallback paths are removed where command path is stable and verified.
- [x] AC-2: No new direct legacy mutation paths are introduced.
- [x] AC-3: AI_READ_ME and map are synchronized to final 133~138 state.
- [x] AC-4: `cd v10 && npm run lint`, `cd v10 && npm run build`, and repo verification scripts pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "fallback|legacy" v10/src/features/{toolbar,layout,hooks}/*`
   - Expected result: targeted stale fallback blocks removed or reduced.
   - Covers: AC-1

2) Step:
   - Command / click path: `node scripts/gen_ai_read_me_map.mjs && bash scripts/run_repo_verifications.sh`
   - Expected result: docs synced and verifications pass.
   - Covers: AC-3, AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: lint/build pass.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Premature fallback deletion can regress edge flows.
- Roll-back:
  - Restore specific fallback blocks from this task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_138_purge_cutover_closeout.md`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/run_repo_verifications.sh
- node scripts/gen_ai_read_me_map.mjs

## Gate Results (Codex fills)

- Lint:
  - PASS (2 pre-existing warnings in untouched files)
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (pre-existing, non-blocking) in compileAnimationPlan/ChalkActor.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Removed command fallback paths were validated by lint/build and repository verification scripts.

Notes:
- Delegated execution completed for this task scope.
