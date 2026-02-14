# Task 111: Role-Based Kiosk Router & Asymmetric Interaction

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Add student kiosk role runtime gating so edit controls are unmounted in `student` mode.
  - Guard viewport and drawing interactions in student mode and consume sync viewport state.
- What must NOT change:
  - Host mode existing editing flow must remain functional.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/canvas/CanvasLayer.tsx`
- `v10/src/features/layout/PlayerBar.tsx` (read-only mode)

Out of scope:
- connector approval middleware (Task 112)
- slot registry (Task 113)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Use existing store/actions only.
- Compatibility:
  - host mode behavior backward compatible.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 111
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A:
    - Implementer-B:
    - Implementer-C:
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: `AppLayout.tsx`
    - B: `useViewportInteraction.ts` + `CanvasLayer.tsx`
    - C: `PlayerBar.tsx`
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

- [x] AC-1: `student` role unmounts edit UI (`DataInputPanel`, `FloatingToolbar`, `Prompter`, `PasteHelperModal`).
- [x] AC-2: student mode disables local draw/viewport pointer and wheel interactions.
- [x] AC-3: student mode renders read-only player bar.
- [x] AC-4: `cd v10 && npm run lint` passes (errors 0).
- [x] AC-5: `cd v10 && npm run build` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: switch `role` in local store to `student`
   - Expected result: interactive editing UI unmounted
   - Covers: AC-1

2) Step:
   - Command / click path: drag/wheel/draw on canvas in `student`
   - Expected result: no local mutation interaction
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: pass
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - accidental host-mode regression in layout rendering branches.
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
- `codex_tasks/task_111_role_based_kiosk_router.md`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/canvas/CanvasLayer.tsx`
- `v10/src/features/layout/PlayerBar.tsx`

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
  - Used lint/build + static interaction guard checks.

Manual verification notes:
- Student mode now routes footer to read-only `PlayerBar` and unmounts edit UI surfaces.
- `CanvasLayer` and `useViewportInteraction` apply student guard + sync viewport mirror.

Notes:
- Host mode rendering/interaction paths were preserved.
