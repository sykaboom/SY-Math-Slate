# Task 333: LectureMod + Pilot Mod Migration Slice

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Implement `LectureMod` as a first-class mod (no privileged path).
  - Migrate one additional pilot mod (`draw` or `playback`) to prove contract viability.
- What must NOT change:
  - No direct `AppLayout` lecture branches.
  - No command bypass that skips command bus/policy gates.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/builtin/lecture.mod.ts` (new)
- `v10/src/core/mod/builtin/draw.mod.ts` or `v10/src/core/mod/builtin/playback.mod.ts` (new)
- `v10/src/core/mod/builtin/index.ts` (new)
- `v10/src/core/mod/host/manager.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (consume contributions)
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts` (bridge window only)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_333_lecture_mod_and_pilot_mod_migration.md`

Out of scope:
- Full migration of all current modes.
- Docking model redesign.
- Mod Studio UI integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Builtin mods in `core/mod/builtin/*` must not import `features/layout/windowing/store`.
- Compatibility:
  - Existing commands and payload schemas are reused as-is through ModContext dispatch.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W4-mod-pilot
- Depends on tasks:
  - [`task_332`]
- Enables tasks:
  - [`task_334`]
- Parallel group:
  - G-mod-migration
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7-9
- Files shared with other PENDING tasks:
  - `v10/src/core/mod/host/manager.ts`
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~70min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Pilot migration is contract proof and regression-sensitive.

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
  - `LectureMod` is registered via `ModRegistry` and activated through `ModManager`.
- [x] AC-2:
  - `LectureMod` provides declarative toolbar contributions and optional overlay hook.
- [x] AC-3:
  - Pilot second mod uses same contract and command path.
- [x] AC-4:
  - No direct imports from migrated mods to layout/windowing/store.
- [x] AC-5:
  - Lecture path has no privileged branch (`AppLayout`/host code remains generic).
- [x] AC-6:
  - `cd v10 && npm run lint`, `cd v10 && npm run build`, `bash scripts/check_layer_rules.sh` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Activate lecture mod and run prev/next/play controls.
   - Expected result:
     - Controls work through command bus; no privileged lecture branch.
   - Covers: AC-1, AC-2, AC-5

2) Step:
   - Command / click path:
     - Activate migrated pilot mod and exercise core interactions.
   - Expected result:
     - Behavior parity with legacy path for covered interactions.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - Inspect import graph of builtin mods.
   - Expected result:
     - Boundary-safe imports only.
   - Covers: AC-4

4) Step:
   - Command / click path:
     - Run lint/build/layer checks.
   - Expected result:
     - All pass.
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Hidden coupling in toolbar orchestration may cause parity regressions.
- Roll-back:
  - Feature-flag migrated mods and fallback to existing selector path.

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
- `v10/src/core/mod/builtin/lecture.mod.ts`
- `v10/src/core/mod/builtin/draw.mod.ts`
- `v10/src/core/mod/builtin/playback.mod.ts`
- `v10/src/core/mod/builtin/canvas.mod.ts`
- `v10/src/core/mod/builtin/index.ts`
- `v10/src/core/mod/index.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts`
- `codex_tasks/task_333_lecture_mod_and_pilot_mod_migration.md`

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
- Verified `LectureMod` is registered via runtime mod registry and activated through `ModManager` path.
- Verified pilot/builtin mods (`draw`, `playback`, `canvas`) use same contract and command-dispatch model.
- Verified no privileged lecture branch was added in `AppLayout`.

Notes:
- Toolbar role remains host-owned; mod contributions are declarative and consumed by host bridge.
