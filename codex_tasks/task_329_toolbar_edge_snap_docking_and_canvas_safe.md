# Task 329: Toolbar Edge Snap Docking + Canvas Safe Region

Status: PARKED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Park Reason
- Deferred by user direction to prioritize codebase-wide modularization and `modding engine + mod manager` architecture contracts first.
- This task remains reusable after core `mod` architecture phases are approved.

---

## Goal (Base Required)
- What to change:
  - Replace ineffective `left/center/right` dock selector behavior with edge-snap docking behavior:
    - When toolbar window is dragged near viewport edges, it snaps and docks to `top | bottom | left | right`.
    - Docked toolbar behaves as slot-like strip (Samsung Notes style), not floating window.
  - Ensure docked toolbar does not cover Slate drawing surface by reserving canvas-safe insets.
- What must NOT change:
  - Existing command IDs and command bus contracts.
  - Existing `setToolbarDock` payload contract (`left|center|right`) must remain backward-compatible.
  - Student/host role-policy security behavior.

---

## Scope (Base Required)

Touched files/directories:
- `design_drafts/task_329_toolbar_edge_snap_docking.svg`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/windowing/WindowHost.tsx`
- `v10/src/features/chrome/layout/windowing/panelAdapters.tsx`
- `v10/src/features/chrome/layout/windowing/windowRuntime.types.ts`
- `v10/src/features/platform/store/useChromeStore.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/platform/extensions/commands/commands.tool.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `scripts/check_toolbar_contract.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Toolbar visual redesign (new icon art/theme overhaul).
- New editing tools/features.
- Mod Studio UX redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep layer rules unchanged.
  - No direct `window` global export or unsafe runtime injection.
- Compatibility:
  - Existing floating window mode remains available when not snapped.
  - Existing saved layout data must not crash; add safe fallback migration for new dock edge state.
  - Legacy `setToolbarDock(position: left|center|right)` calls must continue to work:
    - interpreted as bottom-strip alignment (or alias field), not removed/broken.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1-toolbar-edge-dock
- Depends on tasks:
  - [`task_328`]
- Enables tasks:
  - []
- Parallel group:
  - G-layout-toolbar
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 10-12
- Files shared with other PENDING tasks:
  - `none` (as of write time)
- Cross-module dependency:
  - YES (layout + store + toolbar + command)
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~70min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Snap/dock behavior and safe-region math are coupled; split edits risk geometry regressions.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/task_329_toolbar_edge_snap_docking.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Redlines (initial contract):
- Snap threshold: 24px from each viewport edge.
- Dock strip thickness:
  - top/bottom: 72px max (including safe-area padding).
  - left/right: 84px max (icon+label vertical lane).
- Canvas-safe minimum visible area:
  - width >= 320px, height >= 240px after dock insets.

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
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1:
  - Dragging floating toolbar near top/bottom/left/right edge snaps and docks to that edge.
- [ ] AC-2:
  - Docked toolbar no longer occludes Slate canvas and must satisfy redlines:
    - top/bottom dock strip <= 72px
    - left/right dock strip <= 84px
    - visible canvas >= 320x240 after insets on tablet target viewports.
- [ ] AC-3:
  - Leaving edge threshold undocks back to floating behavior with prior window interaction preserved.
- [ ] AC-4:
  - Existing `setToolbarDock` contract remains backward-compatible:
    - `left|center|right` payload is still accepted.
    - No dead control remains in UI (legacy selector hidden or mapped to bottom-strip alignment semantics).
- [ ] AC-5:
  - Existing persisted layout/state data (without new edge field) loads safely with deterministic fallback and no crash.
- [ ] AC-6:
  - `scripts/check_toolbar_contract.sh`, `cd v10 && npm run lint`, and `cd v10 && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Run app and drag toolbar window to each edge.
   - Expected result:
     - Snap/dock occurs at all 4 edges.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - Draw near all canvas boundaries while each edge dock is active.
   - Expected result:
     - Toolbar does not cover active drawing area.
     - Redlines are satisfied (dock strip thickness + minimum visible area).
   - Covers: AC-2

3) Step:
   - Command / click path:
     - Drag toolbar away from edge beyond threshold.
   - Expected result:
     - Toolbar undocks and behaves as floating window again.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - Trigger existing toolbar dock command paths / inspect canvas tab controls.
   - Expected result:
     - `setToolbarDock(left|center|right)` path remains valid.
     - No dead `left/center/right` semantics remain in visible controls.
   - Covers: AC-4

5) Step:
   - Command / click path:
     - Load with legacy persisted state (no edge dock field), then open app.
   - Expected result:
     - No crash; fallback state applied deterministically.
   - Covers: AC-5

6) Step:
   - Command / click path:
     - `bash scripts/check_toolbar_contract.sh`
     - `cd v10 && npm run lint`
     - `cd v10 && npm run build`
   - Expected result:
     - All pass.
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Edge clamp math can produce jitter near threshold.
  - Incorrect safe inset calculation can shrink canvas too aggressively on small tablet/mobile viewports.
- Roll-back:
  - Revert dock-edge state additions and restore current floating-window-only behavior.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PARKED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- ...

Notes:
- ...
