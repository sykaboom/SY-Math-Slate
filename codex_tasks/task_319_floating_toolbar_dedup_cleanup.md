# Task 319: Floating Toolbar Dedup Cleanup

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Remove duplicated UI paths in `FloatingToolbar` so mode-specific controls do not reappear in `More`/compact expanded panels.
  - Simplify `More` panel into settings-oriented surface and keep action controls in mode lanes.
  - Reduce compact expanded overload by conditionally rendering only missing quick actions.
- What must NOT change:
  - Do not remove existing command behavior (undo/redo/step/file/local/view/cursor/layout).
  - Do not introduce new dependencies.
  - Do not alter role/policy/permission logic.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md` (regenerate)

Out of scope:
- Toolbar command contracts (`commandBus`) and store schemas
- New toolbar feature additions
- Layout/SVG geometry redesign

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep toolbar behavior command-driven (use existing toolbar command functions).
  - Keep cutover policy usage via `resolveToolbarRenderPolicy`.
  - Preserve compact/desktop split (`ThumbZoneDock` vs desktop shell).
- Compatibility:
  - Existing toggles and actions must remain reachable in at least one visible path per mode.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-DEDUP-1
- Depends on tasks:
  - [`task_316`]
- Enables tasks:
  - next toolbar UX simplification waves
- Parallel group:
  - G-TBAR-CLEANUP
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~45min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
- Rationale:
  - Main code change is concentrated in one file (`FloatingToolbar.tsx`) while doc/update checks can run in parallel.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - Task 319 implementation + verification
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: toolbar dedup logic
  - Implementer-B: docs/map closeout
  - Implementer-C: n/a
  - Reviewer+Verifier: gate run + diff review
- File ownership lock plan:
  - `FloatingToolbar.tsx` single-owner lock
  - docs/map files separate owner
- Parallel slot plan:
  - max 6 active slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - critical-path-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 verifier
  - Ready-queue refill trigger:
    - on completion of toolbar code diff
  - Agent close/reuse policy:
    - close completed agent immediately and recycle slot
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 5m
    - Long-running exceptions: lint/build verification
  - Reassignment safety rule:
    - only after two unanswered pings and zero diff progress
- Delegated closeout metrics:
  - Peak active slots: 2
  - Average active slots: 2.0
  - Slot refill count: 0
  - Reassignment count: 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - User explicitly reported stacked/duplicated floating toolbar UI and requested aggressive cleanup.
- Sunset criteria:
  - Keep until toolbar is fully declarative and panel duplication guards are script-enforced.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `More` panel no longer renders duplicate `Mode` and `Fallback` sections.
- [x] AC-2: `More` panel no longer duplicates `Steps/History` when current mode is `playback`.
- [x] AC-3: Compact expanded panel quick actions render only actions not already present in active mode lane.
- [x] AC-4: `scripts/check_toolbar_contract.sh`, `scripts/check_layer_rules.sh`, `cd v10 && npm run lint`, `cd v10 && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open desktop toolbar -> switch Draw/Playback/Canvas -> open More
   - Expected result: no duplicated mode/fallback blocks; playback mode does not show duplicate steps/history in More
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: compact viewport -> open expanded panel in Draw/Playback/Canvas
   - Expected result: quick actions only show actions absent from current mode strip
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `scripts/check_toolbar_contract.sh`
     - `scripts/check_layer_rules.sh`
     - `cd v10 && npm run lint`
     - `cd v10 && npm run build`
   - Expected result: all pass
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-cleanup may hide actions users relied on in secondary paths.
- Roll-back:
  - Revert task commit and restore prior `FloatingToolbar` rendering blocks.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_319_floating_toolbar_dedup_cleanup.md`

Commands run (only if user asked or required by spec):
- `scripts/check_toolbar_contract.sh`
- `scripts/check_layer_rules.sh`
- `node scripts/gen_ai_read_me_map.mjs --check`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - none

Manual verification notes:
- Desktop `More` panel no longer shows `Mode` and `Fallback`.
- Playback mode no longer duplicates `Steps/History` inside `More`.
- Compact expanded panel quick actions are now mode-aware and hidden when redundant.

Notes:
- Implemented in delegated mode with split ownership: toolbar code path + AI_READ_ME semantic sync.
