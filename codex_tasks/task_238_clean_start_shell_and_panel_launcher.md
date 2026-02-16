# Task 238: Clean Start Shell and Panel Launcher

Status: PENDING
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
  - [ ] SVG path in `design_drafts/`
  - [ ] SVG has explicit `viewBox` (width / height / ratio)
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

Status note:
- BLOCKED until one Gemini SVG draft is produced and redlines are recorded here.
- This task is the layout gate producer; downstream layout tasks remain blocked until completion.

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

- [ ] AC-1: A single SVG draft exists in `design_drafts/` with explicit `viewBox` and named zones for canvas, launcher, and panel windows.
- [ ] AC-2: Redlines (pixel values) for panel min/max size, default anchors, drag bounds, and launcher safe-area offsets are documented in this spec.
- [ ] AC-3: All required tablet viewports (768x1024, 820x1180, 1024x768, 1180x820) are mapped with no unreachable close/recover control.
- [ ] AC-4: Downstream implementation tasks (`task_240`, `task_244`) reference this SVG path and redlines.
- [ ] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes (docs/spec-only change).

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

## SVG / Redline Pack (to be filled in this task)

- SVG path:
  - `design_drafts/<to-be-provided>.svg`
- `viewBox`:
  - `<width> x <height>`
- Canvas safe writing region:
  - top: `<px>`, right: `<px>`, bottom: `<px>`, left: `<px>`
- Launcher default anchor + offset:
  - anchor: `<corner/edge>`, x/y offset: `<px>`
- Window defaults:
  - DataInput: width `<px>`, height `<px>`, anchor `<...>`
  - Toolbar adjunct: width `<px>`, height `<px>`, anchor `<...>`
- Drag clamp bounds:
  - minX `<px>`, minY `<px>`, maxX `<formula>`, maxY `<formula>`
- Reachability checks:
  - 768x1024: PASS/FAIL
  - 820x1180: PASS/FAIL
  - 1024x768: PASS/FAIL
  - 1180x820: PASS/FAIL

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
