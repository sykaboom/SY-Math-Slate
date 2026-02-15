# Task 215: Shared Presence and Laser Stream

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add shared presence state and remote laser pointer streaming on top of collaboration sync.
  - Render remote presence/laser as read-only overlay in canvas stage.
- What must NOT change:
  - Local drawing semantics and local laser visual behavior must remain unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_215_shared_presence_laser_stream.md`
- `v10/src/features/store/useSyncStore.ts`
- `v10/src/features/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/PresenceOverlay.tsx` (new)
- `v10/src/features/hooks/useCanvas.ts`

Out of scope:
- Conflict resolution policy internals (`task_216`).
- Community/moderation domain.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Presence model resides in sync/store; rendering remains in canvas feature layer.
- Compatibility:
  - If no remote presence exists, overlay renders nothing and does not intercept pointer events.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W7
- Depends on tasks:
  - [`task_213`, `task_214`]
- Enables tasks:
  - [`task_216`]
- Parallel group:
  - G7-collab
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

- [x] AC-1: Sync store tracks remote presence/laser stream with bounded deterministic state updates.
- [x] AC-2: Canvas stage displays remote presence overlay without blocking local input.
- [x] AC-3: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: host triggers laser movement while student tab is open.
   - Expected result: student sees remote laser/presence overlay updates.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: draw/erase locally while remote presence active.
   - Expected result: local pointer interactions are unaffected.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - High-frequency presence updates can cause render churn.
- Roll-back:
  - throttle/bound stream updates and keep overlay opt-in from sync state.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 위임모드로 진행! 역시 서브에이전트 설계부터하고 하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/store/useSyncStore.ts`
- `v10/src/features/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/hooks/useCanvas.ts`
- `v10/src/features/canvas/PresenceOverlay.tsx`
- `v10/src/features/canvas/CanvasStage.tsx`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`, `run_repo_verifications`)

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
- Remote laser/presence stream is bounded and rendered as non-blocking overlay for student runtime only.

Notes:
- Presence rendering was adjusted to theme-token classes to satisfy style hardcoding budget gate.
