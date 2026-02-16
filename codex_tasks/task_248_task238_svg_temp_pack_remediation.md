# Task 248: Task238 SVG Temp Pack Remediation

Status: APPROVED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remediate blocking issues found in `task_247` temp SVG/redline pack under `design_drafts/tmp_task238/`.
  - Make temp drafts pass gate criteria required for promotion review.
- What must NOT change:
  - Do not touch runtime code in `v10/src`.
  - Do not move temp files to final canonical paths yet.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_248_task238_svg_temp_pack_remediation.md`
- `design_drafts/tmp_task238/layout_task238_window_shell_master.svg`
- `design_drafts/tmp_task238/layout_task238_768x1024.svg`
- `design_drafts/tmp_task238/layout_task238_820x1180.svg`
- `design_drafts/tmp_task238/layout_task238_1024x768.svg`
- `design_drafts/tmp_task238/layout_task238_1180x820.svg`
- `design_drafts/tmp_task238/layout_task238_redlines.json`
- `design_drafts/tmp_task238/layout_task238_redlines.md`

Out of scope:
- Final promotion into `design_drafts/` canonical gate paths
- Runtime/UI implementation tasks (`task_240+`)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep edits deterministic and numeric.
  - Maintain required IDs/state groups in all SVGs.
- Compatibility:
  - Must satisfy unresolved blockers from `task_247`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-A3-REMED
- Depends on tasks:
  - [`task_247`]
- Enables tasks:
  - `task_247` promotion decision (survivor pass)
- Parallel group:
  - G-svg
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid` (manual SVG gate checks)

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/` (temp path)
  - [x] SVG has explicit `viewBox`
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

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

- [ ] AC-1: All close targets are at least `44x44` in every temp SVG.
- [ ] AC-2: Redline JSON contains viewport-specific top/bottom chrome rects with numeric `x,y,width,height`.
- [ ] AC-3: Redline JSON docked/windowed defaults are numeric per viewport (no `%` strings).
- [ ] AC-4: Reachability section includes per-viewport pass/fail entries in JSON and MD.
- [ ] AC-5: Required semantic IDs/state groups remain present in all 5 SVGs after remediation.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg` width/height on close targets across all SVGs.
   - Expected result: each close target `>=44x44`.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect redline JSON keys/values.
   - Expected result: numeric viewport-specific chrome rects and docked/windowed rects.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path: inspect reachability blocks in JSON/MD.
   - Expected result: four viewport pass/fail rows.
   - Covers: AC-4

4) Step:
   - Command / click path: required ID/state scan across all SVGs.
   - Expected result: no missing required semantic IDs/state groups.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Broad find/replace can accidentally alter required IDs.
- Roll-back:
  - Revert temp draft files and task file.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message "보정바람."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_248_task238_svg_temp_pack_remediation.md`
- `design_drafts/tmp_task238/layout_task238_window_shell_master.svg`
- `design_drafts/tmp_task238/layout_task238_768x1024.svg`
- `design_drafts/tmp_task238/layout_task238_820x1180.svg`
- `design_drafts/tmp_task238/layout_task238_1024x768.svg`
- `design_drafts/tmp_task238/layout_task238_1180x820.svg`
- `design_drafts/tmp_task238/layout_task238_redlines.json`
- `design_drafts/tmp_task238/layout_task238_redlines.md`

Commands run (only if user asked or required by spec):
- `sed -i` replacements on all temp SVG files for close target sizes (`44x44`)
- overwrite redline files with numeric-per-viewport content:
  - `layout_task238_redlines.json`
  - `layout_task238_redlines.md`
- gate verification via `rg`, `sed`, `ls` across temp pack

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (manual SVG gate checks)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - Not required

Manual verification notes:
- AC-1 PASS: all close targets remediated to `44x44` in 5/5 SVGs.
- AC-2 PASS: redline JSON now includes per-viewport numeric `topChromeRect`/`bottomChromeRect`.
- AC-3 PASS: docked/windowed defaults are numeric per viewport (no `%` strings).
- AC-4 PASS: reachability includes per-viewport PASS/FAIL entries in JSON and MD.
- AC-5 PASS: required IDs/state groups preserved in all SVGs.

Notes:
- Temp pack is now candidate-ready for promotion to canonical `design_drafts/` paths.
