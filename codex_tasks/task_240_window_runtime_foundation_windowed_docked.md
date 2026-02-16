# Task 240: Window Runtime Foundation (Windowed/Docked)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Build the headless window runtime foundation that can render panel modules in `windowed` or `docked` mode from declarative config.
  - Provide deterministic drag, clamp, reset, and z-order focus behavior as shared runtime primitives.
- What must NOT change:
  - Do not migrate DataInput/FloatingToolbar internals in this task.
  - Do not introduce role policy branching in `AppLayout`.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_240_window_runtime_foundation_windowed_docked.md`
- `v10/src/features/layout/windowing/windowRuntime.types.ts` (new)
- `v10/src/features/layout/windowing/windowRuntime.ts` (new)
- `v10/src/features/layout/windowing/useWindowRuntime.ts` (new)
- `v10/src/features/layout/windowing/WindowHost.tsx` (new)
- `v10/src/features/store/useChromeStore.ts` (minimal state surface update if needed)

Out of scope:
- Panel module adapter cutover (handled in `task_242`)
- Core control dogfooding (handled in `task_243`)
- Clean start shell cutover (handled in `task_244`)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Follow `sy-slate-architecture-guardrails` layer boundaries.
  - Runtime state must stay JSON-safe.
  - No `window` global assignments.
- Compatibility:
  - Must consume panel behavior contract from `task_237`.
  - Must conform to the canonical SVG/redline pack from `task_238`:
    - `design_drafts/layout_task238_window_shell_master.svg`
    - `design_drafts/layout_task238_redlines.json`
    - `design_drafts/layout_task238_redlines.md`

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-B
- Depends on tasks:
  - [`task_237`, `task_238`]
- Enables tasks:
  - [`task_241`, `task_242`]
- Parallel group:
  - G-window-core
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Status note:
- UNBLOCKED: `task_238` canonical pack is finalized and referenced below for implementation consumption.

Task 238 layout input (authoritative):
- master SVG: `design_drafts/layout_task238_window_shell_master.svg` (`viewBox="0 0 1440 1080"`)
- viewport SVGs: `design_drafts/layout_task238_768x1024.svg`, `design_drafts/layout_task238_820x1180.svg`, `design_drafts/layout_task238_1024x768.svg`, `design_drafts/layout_task238_1180x820.svg`
- redlines: `design_drafts/layout_task238_redlines.json` and `design_drafts/layout_task238_redlines.md`
- runtime constraints consumed from redlines:
  - DataInput min/max: `320x240` / `640x800`
  - ToolbarAux min/max: `240x56` / `480x56`
  - drag clamp formulas: `minX/minY/maxX/maxY` from `clampBounds`
  - launcher safe anchor: left-bottom safe region with `24px` x/y inset and `56x56` target

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

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Runtime supports `displayMode: 'windowed' | 'docked'` with deterministic render path.
- [x] AC-2: `movable=false` disables drag; `movable=true` allows drag within clamped bounds.
- [x] AC-3: Reset action restores `defaultPosition` from contract and clamps to viewport.
- [x] AC-4: Window runtime state is serializable/JSON-safe and free from DOM references.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `windowRuntime` types/hooks.
   - Expected result: mode/drag/reset/clamp semantics exist in shared runtime APIs.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: inspect state shape in store/runtime.
   - Expected result: only JSON-safe values (string/number/boolean/object/array).
   - Covers: AC-4

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Clamp math bugs could make panels unreachable on tablet.
  - Runtime API churn may ripple to adapter tasks.
- Roll-back:
  - Revert `windowing` runtime files and restore previous panel host path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user instruction assigning Task 240 (Wave 3) with scope-locked implementation.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_240_window_runtime_foundation_windowed_docked.md`
- `v10/src/features/layout/windowing/windowRuntime.types.ts`
- `v10/src/features/layout/windowing/windowRuntime.ts`
- `v10/src/features/layout/windowing/useWindowRuntime.ts`
- `v10/src/features/layout/windowing/WindowHost.tsx`
- `v10/src/features/store/useChromeStore.ts`

Commands run (only if user asked or required by spec):
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS (`scripts/check_v10_changed_lint.sh` via `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None in required gates.
- Newly introduced failures:
  - None (intermediate local lint iteration issues were resolved before final gate run).
- Blocking:
  - NO
- Mitigation:
  - Not required.

Manual verification notes:
- AC-1 PASS: `windowRuntime.types.ts`, `windowRuntime.ts`, and `useWindowRuntime.ts` provide deterministic `windowed|docked` runtime state and render ordering primitives.
- AC-2 PASS: `moveWindowRuntimePanelTo/moveWindowRuntimePanelBy` enforce `displayMode === "windowed" && movable === true` before moving, with clamp formulas from Task 238 redlines.
- AC-3 PASS: `resetWindowRuntimePanel` restores `defaultPosition` from Task 237 behavior contract and clamps to runtime bounds.
- AC-4 PASS: runtime/store data surfaces are JSON-safe (`Record<string, { position, zIndex }>` in `useChromeStore` and plain-object runtime state; no DOM refs).
- AC-5 PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` completed successfully.

Notes:
- Scope respected: no AppLayout cutover and no DataInput/FloatingToolbar internal migration in this task.
- No new dependencies introduced.
