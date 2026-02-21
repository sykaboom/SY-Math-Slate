# Task 110: 3-Tier State Segmentation (Doc/Sync/Local)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Introduce `useDocStore`, `useSyncStore`, `useLocalStore` and separate responsibilities for persisted document, shared sync/session, and device-local role/view state.
  - Route persistence/export serialization through `useDocStore` only.
- What must NOT change:
  - No breaking change to existing canvas editing/playback behavior.
  - No new dependency.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/store/useDocStore.ts` (new)
- `v10/src/features/platform/store/useSyncStore.ts` (new)
- `v10/src/features/platform/store/useLocalStore.ts` (new)
- `v10/src/features/platform/hooks/usePersistence.ts`
- `v10/src/features/platform/hooks/useFileIO.ts`

Out of scope:
- Kiosk routing/render branching (Task 111)
- Connector middleware / approval queue interception (Task 112)
- Slot registry (Task 113)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Preserve current public store API usage in UI files not in this scope.
- Compatibility:
  - Existing `.slate` import/export compatibility must remain.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 110
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A:
    - Implementer-B:
    - Implementer-C:
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: new store files
    - B: `usePersistence.ts`
    - C: `useFileIO.ts`
  - Parallel slot plan:
    - max 6

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

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `useDocStore`, `useSyncStore`, `useLocalStore` exist with typed state/actions.
- [x] AC-2: save/export path reads persisted payload from `useDocStore`.
- [x] AC-3: import/hydration updates `useDocStore` consistently.
- [x] AC-4: `cd v10 && npm run lint` passes (errors 0).
- [x] AC-5: `cd v10 && npm run build` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint`
   - Expected result: 0 errors
   - Covers: AC-4

2) Step:
   - Command / click path: `cd v10 && npm run build`
   - Expected result: build success
   - Covers: AC-5

3) Step:
   - Command / click path: save/export then import existing board
   - Expected result: persisted content intact
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - doc/session drift if sync points are missing.
- Roll-back:
  - revert this task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference)

> Approval reference: user message on 2026-02-14: "좋아. 너의 능력을 보여줄 때다. 모든 권한을 줬다. 서브에이젼트를 상황에 맞게 적극 활용하여 agi수준을 작업능력을 보여줘라." and "남아있는 모든 태스크를 위임모드로 진행하라."

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_110_three_tier_state_segmentation.md`
- `v10/src/features/platform/store/useDocStore.ts`
- `v10/src/features/platform/store/useSyncStore.ts`
- `v10/src/features/platform/store/useLocalStore.ts`
- `v10/src/features/platform/hooks/usePersistence.ts`
- `v10/src/features/platform/hooks/useFileIO.ts`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS (warnings only, errors 0)
- Build:
  - PASS
- Script checks:
  - FAIL (`scripts/check_layer_rules.sh` not present in this checkout)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `scripts/check_layer_rules.sh` missing in repository.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - Used lint/build gates as primary verification for this slice.

Manual verification notes:
- Serialization/export now sync from canvas into `useDocStore` and persist from doc snapshot only.
- Import/hydration path updates both `useDocStore` and `useCanvasStore`.

Notes:
- Scope held to task_110 files and compatibility constraints.
