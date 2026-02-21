# Task 209: Pointer Gesture Conflict Resolution

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Resolve gesture conflicts between drawing input and viewport pan/zoom interactions.
  - Add explicit gesture-lock coordination between drawing and viewport handlers.
- What must NOT change:
  - Student read-only interaction restrictions must remain enforced.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_209_pointer_gesture_conflict_resolution.md`
- `v10/src/features/platform/store/useViewportStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/platform/hooks/useCanvas.ts`
- `v10/src/features/platform/hooks/useOverlayCanvas.ts`
- `v10/src/features/editor/canvas/viewport/useViewportInteraction.ts`

Out of scope:
- Toolbar layout changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Gesture lock state must stay in existing UI/viewport store boundaries.
- Compatibility:
  - Existing hand-tool and pinch-zoom behavior must remain available when not locked.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6
- Depends on tasks:
  - [`task_207`, `task_208`]
- Enables tasks:
  - [`task_210`, `task_211`]
- Parallel group:
  - G6-mobile
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
    - `design_drafts/layout_tablet_ink_fullscreen_1024x768.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
    - gesture lock switch latency target: <=1 frame
    - pen draw vs pan simultaneous activation: 0 occurrences in manual replay
    - two-finger pinch availability while not drawing: preserved
  - [x] Codex verified SVG exists before implementation

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

- [x] AC-1: Drawing input and viewport interactions no longer conflict under rapid pointer switching.
- [x] AC-2: Gesture lock path preserves intentional hand-tool/pinch workflows.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: perform pen draw then immediate pan/zoom attempts on tablet viewport sizes.
   - Expected result: no unintended viewport movement during active drawing.
   - Covers: AC-1

2) Step:
   - Command / click path: activate hand tool and pinch gesture scenarios.
   - Expected result: pan/zoom still works when gesture lock not engaged.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-aggressive lock can suppress legitimate pan input.
- Roll-back:
  - Keep lock checks additive and scoped to drawing-active windows only.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 진행바람."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/store/useViewportStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/editor/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/platform/hooks/useCanvas.ts`
- `v10/src/features/platform/hooks/useOverlayCanvas.ts`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_command_write_path.sh`
- `scripts/check_v10_legacy_freeze.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_v10_command_write_path`, `check_v10_legacy_freeze`, `run_repo_verifications`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - N/A
- Mitigation:
  - N/A

Manual verification notes:
- Added gesture lock ownership in draw hooks and viewport interaction cancellation on lock; pan/pinch remains active when lock is not engaged.

Notes:
- Resolved temporary `useUIStore` budget regression by switching viewport interaction reads to `useViewportStore/useToolStore` where appropriate.
