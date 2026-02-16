# Task 249: Promote Task238 SVG Pack to Canonical Paths

Status: APPROVED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Promote remediated temp SVG/redline pack from `design_drafts/tmp_task238/` into canonical `design_drafts/` paths for task_238 gate consumption.
- What must NOT change:
  - Do not modify runtime code under `v10/src`.
  - Do not alter SVG/redline content during promotion.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_249_promote_task238_svg_pack_to_canonical.md`
- `design_drafts/layout_task238_window_shell_master.svg` (new)
- `design_drafts/layout_task238_768x1024.svg` (new)
- `design_drafts/layout_task238_820x1180.svg` (new)
- `design_drafts/layout_task238_1024x768.svg` (new)
- `design_drafts/layout_task238_1180x820.svg` (new)
- `design_drafts/layout_task238_redlines.json` (new)
- `design_drafts/layout_task238_redlines.md` (new)

Out of scope:
- Deleting `design_drafts/tmp_task238/` temp files
- Updating downstream task statuses (`task_238`, `task_240`, `task_242`, `task_244`)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Promotion is copy-only from reviewed temp artifacts.
  - Preserve filenames/content exactly.
- Compatibility:
  - Canonical files must be discoverable by layout gate tasks.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-A3-PROMOTE
- Depends on tasks:
  - [`task_248`]
- Enables tasks:
  - [`task_238`, `task_240`, `task_242`, `task_244`] gate consumption
- Parallel group:
  - G-svg
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid` (manual file presence/integrity checks)

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
  - [x] SVG has explicit `viewBox`
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded
  - [x] Codex verified files exist before downstream implementation

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

- [ ] AC-1: 7 canonical files exist in `design_drafts/` with expected names.
- [ ] AC-2: Canonical files are byte-identical to temp sources.
- [ ] AC-3: Canonical SVG files expose required semantic IDs/state groups and explicit `viewBox`.
- [ ] AC-4: Runtime source files remain unchanged.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `ls -1 design_drafts/layout_task238_*`
   - Expected result: all 7 canonical files exist.
   - Covers: AC-1

2) Step:
   - Command / click path: `cmp` each temp file with canonical file.
   - Expected result: byte-identical for all 7 pairs.
   - Covers: AC-2

3) Step:
   - Command / click path: `rg` semantic IDs/state/viewBox on canonical SVG files.
   - Expected result: required markers present.
   - Covers: AC-3

4) Step:
   - Command / click path: `git status --short`
   - Expected result: only task_247/248/249 and design_drafts files changed, no `v10/src` changes.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Wrong file path mapping during promotion.
- Roll-back:
  - Remove promoted canonical files and rerun promotion.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message "응 승격."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_249_promote_task238_svg_pack_to_canonical.md`
- `design_drafts/layout_task238_window_shell_master.svg`
- `design_drafts/layout_task238_768x1024.svg`
- `design_drafts/layout_task238_820x1180.svg`
- `design_drafts/layout_task238_1024x768.svg`
- `design_drafts/layout_task238_1180x820.svg`
- `design_drafts/layout_task238_redlines.json`
- `design_drafts/layout_task238_redlines.md`

Commands run (only if user asked or required by spec):
- `cp` (7 temp files -> canonical `design_drafts/layout_task238_*`)
- `cmp -s` pairwise byte identity checks (7/7)
- `rg` checks for `viewBox` + required semantic IDs/state groups on canonical SVGs
- `git status --short` scope check

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (manual promotion integrity checks)

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
- AC-1 PASS: all 7 canonical `design_drafts/layout_task238_*` files exist.
- AC-2 PASS: canonical files are byte-identical to temp source files.
- AC-3 PASS: canonical SVGs include explicit `viewBox`, required IDs, and required state groups.
- AC-4 PASS: no `v10/src` runtime files changed.

Notes:
- Temp pack kept intact (`design_drafts/tmp_task238/`) per scope.
