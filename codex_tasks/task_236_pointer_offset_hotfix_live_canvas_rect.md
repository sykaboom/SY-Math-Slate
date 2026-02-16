# Task 236: Pointer Offset Hotfix via Live Canvas Rect Mapping

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Fix pen/eraser/laser pointer coordinate mismatch on web/tablet by mapping pointer coordinates from live canvas bounding rect at event time.
  - Remove stale transform-offset dependency in the main drawing path.
  - Stabilize pointer mapping before panel windowing cutover tasks (`task_242+`) so window drag/overlay changes do not mask the core ink bug.
- What must NOT change:
  - No behavior change to role policy (host/student visibility or permissions).
  - No layout structure change in `AppLayout` / toolbar components.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_236_pointer_offset_hotfix_live_canvas_rect.md`
- `v10/src/features/hooks/useCanvas.ts`

Out of scope:
- `useOverlayCanvas.ts` refactor (unless blocker discovered).
- Theme/UX redesign.
- Realtime sync logic changes unrelated to pointer mapping.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep fix minimal and deterministic.
  - Preserve existing gesture lock / palm rejection logic.
- Compatibility:
  - Must pass repo verification stage `mid`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-A1
- Depends on tasks:
  - []
- Enables tasks:
  - [`task_242`, `task_244`]
- Parallel group:
  - G-ink-core
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

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

- [ ] AC-1: Main drawing path (`useCanvas`) no longer uses stale board-transform cached offset for pointer mapping.
- [ ] AC-2: Pointer-to-stroke mapping uses live canvas rect dimensions/position for each event sample.
- [ ] AC-3: Existing draw gesture lock and palm rejection paths remain intact.
- [ ] AC-4: No structural layout/panel changes are introduced in this task.
- [ ] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "toBoardPoint|useBoardTransform|getCanvasPoint" v10/src/features/hooks/useCanvas.ts`
   - Expected result: `useCanvas` no longer relies on stale transform cache for pointer mapping; live rect-based mapping code present.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `rg -n "TOUCH_PALM|acquireGestureLock|releaseGestureLock|shouldSuppressTouch" v10/src/features/hooks/useCanvas.ts`
   - Expected result: gesture lock/palm rejection paths still present.
   - Covers: AC-3

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

4) Step:
   - Command / click path: Run app on tablet/desktop and draw near corners/center after opening/closing DataInput panel.
   - Expected result: rendered stroke follows actual pointer/touch location without persistent offset.
   - Covers: AC-2

5) Step:
   - Command / click path: `git diff --name-only`
   - Expected result: changes are limited to `v10/src/features/hooks/useCanvas.ts` and this spec file.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - If rect mapping is mis-scaled, stroke coordinates could drift under zoom.
- Roll-back:
  - Revert `v10/src/features/hooks/useCanvas.ts` to prior commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- (to be filled)

Notes:
- (to be filled)
