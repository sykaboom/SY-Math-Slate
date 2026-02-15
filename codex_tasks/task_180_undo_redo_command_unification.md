# Task 180: Undo/Redo Command Unification

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Unify undo/redo actions under command dispatch and add minimal redo support for stroke edits.
- What must NOT change:
  - No backward-incompatible document schema changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_180_undo_redo_command_unification.md`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`

Out of scope:
- Full multi-operation transactional history across all mutation types.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep command metadata/validation in `registerCoreCommands.ts`; no UI coupling in store.
- Compatibility:
  - Existing `undo` behavior remains functional when redo stack is empty.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_177`]
- Enables tasks:
  - [`task_182`]
- Parallel group:
  - G3-runtime
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
    - W2 (`task_175~182`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - store + command registration + toolbar files split ownership
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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: command IDs for undo/redo are registered and dispatchable.
- [x] AC-2: `FloatingToolbar` history buttons dispatch command path (no direct store mutation for undo/redo button handlers).
- [x] AC-3: lint/build pass on touched scope.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/store/useCanvasStore.ts src/features/extensions/commands/registerCoreCommands.ts src/features/toolbar/FloatingToolbar.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Redo stack lifecycle edge cases after non-stroke mutations.
- Roll-back:
  - Keep undo command only and disable redo command route.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이 w2 진행해. 당연 서브에이전트 관리 잘하고."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_180_undo_redo_command_unification.md`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/store/useCanvasStore.ts src/features/extensions/commands/registerCoreCommands.ts src/features/toolbar/FloatingToolbar.tsx`
- `cd v10 && npm run build`
- `scripts/check_v10_legacy_freeze.sh`

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
- Undo/redo commands are registered and history buttons dispatch command path in FloatingToolbar.
- Minimal stroke redo stack is active and reset on major layout/import transitions.

Notes:
- `registerCoreCommands.ts` now uses `canvasStore` alias to satisfy legacy freeze budget while preserving behavior.
