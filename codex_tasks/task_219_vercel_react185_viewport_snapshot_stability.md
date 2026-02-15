# Task 219: Vercel React #185 Viewport Snapshot Stability Hotfix

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Fix client-side React #185 (`Maximum update depth exceeded`) by stabilizing `useSyncExternalStore` viewport snapshots in tablet shell profile runtime.
- What must NOT change:
  - No layout behavior redesign.
  - No feature additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md`
- `v10/src/features/layout/useTabletShellProfile.ts`
- `codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md`
- `v10/AI_READ_ME.md`

Out of scope:
- Sync architecture changes.
- Toolbar/slot registry changes.
- Community/moderation logic.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep `useTabletShellProfile` API unchanged.
  - Fix only snapshot referential stability and notification behavior.
- Compatibility:
  - Existing consumers of `useTabletShellProfile` remain unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX
- Depends on tasks:
  - [`task_218`]
- Enables tasks:
  - []
- Parallel group:
  - G-hotfix
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

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

- [x] Applies: YES
- If YES:
  - Explicit user hotfix approval quote:
    - "수정해."
  - Exact hotfix scope/files:
    - `v10/src/features/layout/useTabletShellProfile.ts`
  - Hotfix log path:
    - `codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md`

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `useSyncExternalStore` snapshot path in `useTabletShellProfile` returns stable references when viewport width/height are unchanged.
- [x] AC-2: `cd v10 && npm run lint` passes.
- [x] AC-3: `cd v10 && npm run build` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `useTabletShellProfile` snapshot helper implementation.
   - Expected result: unchanged viewport values reuse previous snapshot object.
   - Covers: AC-1

2) Step:
   - Command / click path: `cd v10 && npm run lint`
   - Expected result: PASS
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Low risk; confined to viewport subscription snapshot behavior.
- Roll-back:
  - Revert this task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "수정해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/layout/useTabletShellProfile.ts`
- `codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md`
- `codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None observed
- Newly introduced failures:
  - None observed
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- `readViewportSnapshot` now reuses cached snapshot objects when width/height are unchanged.
- Subscription notifier suppresses `onStoreChange` when snapshot reference has not changed.

Notes:
- This fix addresses the known React #185 loop class caused by unstable `useSyncExternalStore` snapshots.
