# Task 332: ModManager + useModStore Bridge (Single Active Mod SSOT)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Add `ModManager` runtime skeleton and `useModStore` authority store.
  - Bridge current toolbar mode state into `activeModId` without changing visible behavior.
- What must NOT change:
  - No direct toolbar UX redesign.
  - No panel/window layout behavior change.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/host/manager.ts` (new)
- `v10/src/core/mod/host/index.ts`
- `v10/src/features/store/useModStore.ts` (new)
- `v10/src/features/toolbar/FloatingToolbar.tsx` (bridge only)
- `v10/src/features/toolbar/toolbarModePolicy.ts` (bridge types/mapper only)
- `v10/src/features/store/useUIStoreBridge.ts` (optional read-only exposure bridge)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_332_mod_manager_active_mod_store_bridge.md`

Out of scope:
- Migrating tool handlers into mod definitions.
- Command execution policy rewrites.
- Studio diagnostics.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - `ModManager` must live in `core/mod/host` and not import `features`.
  - `useModStore` is the only active-mod authority.
  - Mod transition APIs are exported via `@core/mod/host` barrel only.
- Compatibility:
  - Legacy `draw/playback/canvas` selector continues to work through adapter mapping.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3-mod-manager-bridge
- Depends on tasks:
  - [`task_331`]
- Enables tasks:
  - [`task_333`, `task_334`]
- Parallel group:
  - G-mod-runtime
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5-7
- Files shared with other PENDING tasks:
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~55min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Bridge correctness requires coordinated changes in manager/store/toolbar shell.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
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
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update

---

## Acceptance Criteria (Base Required)

- [x] AC-1:
  - `useModStore` owns `activeModId` as SSOT.
- [x] AC-2:
  - Legacy toolbar selector maps deterministically to `activeModId` via bridge.
- [x] AC-3:
  - `ModManager` exposes lifecycle and routing skeleton APIs with no behavior regression.
- [x] AC-4:
  - No direct imports from mod runtime to layout/windowing/store feature internals.
- [x] AC-5:
  - `activeModId` transition path is single authority (`useModStore`) and legacy selector is adapter-only.
- [x] AC-6:
  - `cd v10 && npm run lint`, `cd v10 && npm run build`, and `bash scripts/check_layer_rules.sh` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Toggle draw/playback/canvas via existing toolbar mode selector.
   - Expected result:
     - UI behavior unchanged; active mod state updated.
   - Covers: AC-1, AC-2, AC-5

2) Step:
   - Command / click path:
     - Inspect manager/store imports.
   - Expected result:
     - Core mod runtime remains boundary-safe.
   - Covers: AC-4

3) Step:
   - Command / click path:
     - Run lint/build/layer checks.
   - Expected result:
     - All pass.
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Dual authority bug if `activeModId` and legacy selector diverge.
- Roll-back:
  - Disable bridge writes and fall back to legacy toolbar local state.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: "맥스 오케스트레이션 모드. 위임모드 진행. 구현하라.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/host/manager.ts`
- `v10/src/core/mod/host/index.ts`
- `v10/src/features/store/useModStore.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/toolbarModePolicy.ts`
- `v10/src/features/store/useUIStoreBridge.ts`
- `codex_tasks/task_332_mod_manager_active_mod_store_bridge.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified `useModStore` is SSOT for `activeModId`.
- Verified toolbar mode selector routes through mod-id mapping bridge.
- Verified `ModManager` exposes activation/routing skeleton APIs without layout/windowing behavior changes.

Notes:
- Legacy toolbar visuals and command handlers were intentionally preserved.
