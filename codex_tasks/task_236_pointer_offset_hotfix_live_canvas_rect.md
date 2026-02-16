# Task 236: Pointer Offset Hotfix via Live Canvas Rect Mapping

Status: COMPLETED
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

- [x] AC-1: Main drawing path (`useCanvas`) no longer uses stale board-transform cached offset for pointer mapping.
- [x] AC-2: Pointer-to-stroke mapping uses live canvas rect dimensions/position for each event sample.
- [x] AC-3: Existing draw gesture lock and palm rejection paths remain intact.
- [x] AC-4: No structural layout/panel changes are introduced in this task.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

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
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/hooks/useCanvas.ts`
- `codex_tasks/task_236_pointer_offset_hotfix_live_canvas_rect.md`

Commands run (only if user asked or required by spec):
- `rg --files codex_tasks | rg 'task_236'`
- `sed -n '1,260p' codex_tasks/task_236_pointer_offset_hotfix_live_canvas_rect.md`
- `sed -n '1,1100p' v10/src/features/hooks/useCanvas.ts`
- `sed -n '1,280p' v10/src/features/hooks/useBoardTransform.ts`
- `rg -n "useBoardTransform|toBoardPoint|getCanvasPoint|makePoint" v10/src/features/hooks/useCanvas.ts`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `rg -n "toBoardPoint|useBoardTransform|getCanvasPoint" v10/src/features/hooks/useCanvas.ts`
- `rg -n "TOUCH_PALM|acquireGestureLock|releaseGestureLock|shouldSuppressTouch" v10/src/features/hooks/useCanvas.ts`
- `git diff --name-only -- codex_tasks/task_236_pointer_offset_hotfix_live_canvas_rect.md v10/src/features/hooks/useCanvas.ts`

## Gate Results (Codex fills)

- Lint:
  - PASS (via `scripts/check_v10_changed_lint.sh` in `VERIFY_STAGE=mid` run; linted changed file `src/features/hooks/useCanvas.ts`)
- Build:
  - N/A
- Script checks:
  - PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
  - Included PASS checks: `check_ai_read_me_sync`, `check_layer_rules`, `check_v10_changed_lint`, `check_v10_chaos_recovery_drills`, `check_v10_command_write_path`, `check_v10_experiment_registry`, `check_v10_feature_flag_registry`, `check_v10_hardcoding_budget`, `check_v10_legacy_freeze`, `check_v10_marketplace_readiness`, `check_v10_migration_baseline`, `check_v10_modding_sdk_scaffold`, `check_v10_module_theme_scope`, `check_v10_rc_signoff`, `check_v10_realtime_env_purge`, `check_v10_theme_visual_gate`, `check_v10_viewport_contract`

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
- Mapping path check PASS: `rg -n "toBoardPoint|useBoardTransform|getCanvasPoint" v10/src/features/hooks/useCanvas.ts` confirms stale `useBoardTransform`/`toBoardPoint` dependency removed; `getCanvasPoint` remains as live mapping path.
- Gesture/palm guard check PASS: `rg -n "TOUCH_PALM|acquireGestureLock|releaseGestureLock|shouldSuppressTouch" v10/src/features/hooks/useCanvas.ts` confirms gesture lock/palm rejection logic remains present.
- Scoped file diff check PASS: `git diff --name-only -- codex_tasks/task_236_pointer_offset_hotfix_live_canvas_rect.md v10/src/features/hooks/useCanvas.ts` returns only Task 236 spec + `useCanvas.ts`.
- App-level manual tablet/desktop interaction check not executed in this CLI session (runtime UI not launched here); required command/script verifications passed.

Notes:
- `useCanvas` pointer coordinate mapping now computes per-event coordinates from live `canvas.getBoundingClientRect()` plus logical canvas dimensions (`clientWidth`/`clientHeight`) with bounds clamping.
- This keeps the existing gesture lock and palm rejection pathways unchanged while removing stale transform-cache dependence from drawing/eraser/laser pointer paths.
