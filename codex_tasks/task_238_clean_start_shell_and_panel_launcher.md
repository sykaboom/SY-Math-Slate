# Task 238: Clean Start Shell and Panel Launcher

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Produce a single approved layout SVG pack for windowed panels + clean start shell before UI implementation.
  - Record numeric redlines for tablet/desktop viewports to unblock window runtime cutover tasks.
  - Freeze launcher entry positions and safe-area constraints as design inputs (not code yet).
- What must NOT change:
  - No runtime code changes in this task.
  - Do not alter command/policy semantics.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories (expected):
- `codex_tasks/task_238_clean_start_shell_and_panel_launcher.md`
- `design_drafts/` (new SVG draft file from Gemini)
- `codex_tasks/task_240_window_runtime_foundation_windowed_docked.md` (redline references)
- `codex_tasks/task_244_clean_start_shell_cutover_hardcoding_zero.md` (redline references)

Out of scope:
- Any `v10/src/**` runtime implementation.
- Theme preset redesign.
- Student kiosk policy redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Preserve slot-driven modular architecture.
  - Ensure tablet/mobile reachability for launcher actions.
- Compatibility:
  - Existing keyboard shortcuts and fullscreen ink flow must still operate.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-A3
- Depends on tasks:
  - [`task_237`]
- Enables tasks:
  - [`task_240`, `task_244`]
- Parallel group:
  - G-svg
- Max parallel slots:
  - 6
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
- UNBLOCKED: canonical pack promoted in `design_drafts/layout_task238_*` and consumed by downstream specs.
- This task is the layout gate producer; `task_240` and `task_244` now reference the authoritative pack.

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

- [x] AC-1: A single SVG draft exists in `design_drafts/` with explicit `viewBox` and named zones for canvas, launcher, and panel windows.
- [x] AC-2: Redlines (pixel values) for panel min/max size, default anchors, drag bounds, and launcher safe-area offsets are documented in this spec.
- [x] AC-3: All required tablet viewports (768x1024, 820x1180, 1024x768, 1180x820) are mapped with no unreachable close/recover control.
- [x] AC-4: Downstream implementation tasks (`task_240`, `task_244`) reference this SVG path and redlines.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes (docs/spec-only change).

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: Confirm SVG file path and inspect `viewBox`.
   - Expected result: one authoritative SVG exists with explicit dimensions and named regions.
   - Covers: AC-1

2) Step:
   - Command / click path: Review redline section in this spec.
   - Expected result: numeric constraints for launcher/panel bounds are fully listed.
   - Covers: AC-2

3) Step:
   - Command / click path: Verify viewport checklist entries.
   - Expected result: each required tablet viewport has pass criteria and no control reachability conflict.
   - Covers: AC-3

4) Step:
   - Command / click path: Verify cross-reference links/mentions in `task_240` and `task_244`.
   - Expected result: downstream tasks explicitly consume this SVG/redline input.
   - Covers: AC-4

5) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## SVG / Redline Pack (Authoritative)

- Canonical SVG/redline paths:
  - `design_drafts/layout_task238_window_shell_master.svg` (master shell)
  - `design_drafts/layout_task238_768x1024.svg`
  - `design_drafts/layout_task238_820x1180.svg`
  - `design_drafts/layout_task238_1024x768.svg`
  - `design_drafts/layout_task238_1180x820.svg`
  - `design_drafts/layout_task238_redlines.json` (machine-readable)
  - `design_drafts/layout_task238_redlines.md` (human-readable)
- `viewBox`:
  - master: `0 0 1440 1080`
  - viewport SVGs: `0 0 768 1024`, `0 0 820 1180`, `0 0 1024 768`, `0 0 1180 820`
- Canvas safe writing region:
  - global shell inset: top `60px`, right `0px`, bottom `60px`, left `0px`
  - 768x1024: `x:0 y:60 w:768 h:904`
  - 820x1180: `x:0 y:60 w:820 h:1060`
  - 1024x768: `x:0 y:60 w:1024 h:648`
  - 1180x820: `x:0 y:60 w:1180 h:700`
- Launcher default anchor + offset:
  - anchor: `left-bottom` of the canvas safe region
  - offset: `x=24px` from left edge, `y=24px` from safe-region bottom; size `56x56`
  - per viewport anchor rects:
    - 768x1024: `x:24 y:884 w:56 h:56`
    - 820x1180: `x:24 y:1040 w:56 h:56`
    - 1024x768: `x:24 y:628 w:56 h:56`
    - 1180x820: `x:24 y:680 w:56 h:56`
- Panel min/max constraints:
  - DataInput: `min 320x240`, `max 640x800`
  - Toolbar adjunct: `min 240x56`, `max 480x56`
  - touch target minimum (close/recover controls): `44x44`
- Window defaults:
  - windowed defaults (all required viewports):
    - DataInput: `x:100 y:150 w:320 h:400`
    - Toolbar adjunct: `x:450 y:150 w:240 h:56`
  - docked defaults by viewport:
    - 768x1024: DataInput `x:448 y:60 w:320 h:904`, Toolbar adjunct `x:0 y:908 w:448 h:56`
    - 820x1180: DataInput `x:500 y:60 w:320 h:1060`, Toolbar adjunct `x:0 y:1064 w:500 h:56`
    - 1024x768: DataInput `x:704 y:60 w:320 h:648`, Toolbar adjunct `x:0 y:652 w:704 h:56`
    - 1180x820: DataInput `x:860 y:60 w:320 h:700`, Toolbar adjunct `x:0 y:704 w:860 h:56`
- Drag clamp bounds:
  - 768x1024: `x:16 y:76 w:736 h:872`
  - 820x1180: `x:16 y:76 w:788 h:1028`
  - 1024x768: `x:16 y:76 w:992 h:616`
  - 1180x820: `x:16 y:76 w:1148 h:668`
  - formulas:
    - `minX = clampBounds.x`
    - `minY = clampBounds.y`
    - `maxX = clampBounds.x + clampBounds.width - panel.width`
    - `maxY = clampBounds.y + clampBounds.height - panel.height`
- Reachability checks:
  - 768x1024: close target `PASS`, recover target `PASS`
  - 820x1180: close target `PASS`, recover target `PASS`
  - 1024x768: close target `PASS`, recover target `PASS`
  - 1180x820: close target `PASS`, recover target `PASS`

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Ambiguous redlines can create rework in runtime tasks.
  - Missing viewport constraints can produce tablet regressions later.
- Roll-back:
  - Replace SVG/redline pack with previous approved draft and update references.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user instruction assigning Task 238 Wave 2 and scope-locked completion.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_238_clean_start_shell_and_panel_launcher.md`
- `codex_tasks/task_240_window_runtime_foundation_windowed_docked.md`
- `codex_tasks/task_244_clean_start_shell_cutover_hardcoding_zero.md`

Commands run (only if user asked or required by spec):
- `rg --files design_drafts | rg 'layout_task238_'`
- `sed -n '1,260p' design_drafts/layout_task238_redlines.md`
- `sed -n '1,260p' design_drafts/layout_task238_redlines.json`
- `head -n 1 design_drafts/layout_task238_*.svg`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` (PASS)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - Not required

Manual verification notes:
- AC-1 PASS: canonical SVG pack exists in `design_drafts/layout_task238_*.svg`; master uses `viewBox="0 0 1440 1080"` and includes named zones (`zone_canvas_safe`, `anchor_launcher_host`, panel state groups).
- AC-2 PASS: numeric redlines (safe regions, anchors, panel min/max, defaults, clamp formulas) are recorded in this spec from canonical redline files.
- AC-3 PASS: required viewports (768x1024, 820x1180, 1024x768, 1180x820) each include reachability `PASS` for close/recover.
- AC-4 PASS: downstream specs `task_240` and `task_244` now reference this canonical pack and redline inputs.
- AC-5 PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` completed successfully (`check_v10_changed_lint`, registry/contract guards, and stage-mid verification chain all PASS).

Notes:
- Scope respected: no runtime code changes under `v10/src`.
