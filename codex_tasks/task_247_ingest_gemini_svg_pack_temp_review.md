# Task 247: Ingest Gemini SVG Pack as Temp Files and Gate Review

Status: APPROVED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Ingest the user-provided Gemini SVG/redline outputs as temporary files under `design_drafts/tmp_task238/`.
  - Run structured gate review against `task_238`/`task_240`/`task_244` unblock requirements.
  - Produce pass/fail assessment and identify survivors for final placement.
- What must NOT change:
  - Do not apply these drafts to final `design_drafts/` production paths yet.
  - Do not modify runtime code under `v10/src`.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_247_ingest_gemini_svg_pack_temp_review.md`
- `design_drafts/tmp_task238/layout_task238_window_shell_master.svg` (new temp)
- `design_drafts/tmp_task238/layout_task238_768x1024.svg` (new temp)
- `design_drafts/tmp_task238/layout_task238_820x1180.svg` (new temp)
- `design_drafts/tmp_task238/layout_task238_1024x768.svg` (new temp)
- `design_drafts/tmp_task238/layout_task238_1180x820.svg` (new temp)
- `design_drafts/tmp_task238/layout_task238_redlines.json` (new temp)
- `design_drafts/tmp_task238/layout_task238_redlines.md` (new temp)

Out of scope:
- Promoting temp drafts into final design_drafts canonical files
- Runtime implementation tasks (`task_240`, `task_242`, `task_244`)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Preserve exact user-provided draft content during ingest.
  - Review is validation-only; no speculative redesign.
- Compatibility:
  - Review criteria aligned to `task_238` SVG/redline gate requirements.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-A3-INTAKE
- Depends on tasks:
  - [`task_238`]
- Enables tasks:
  - [`task_240`, `task_242`, `task_244`] (after pass)
- Parallel group:
  - G-svg
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid` (review checks only; no v10 code changes)

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/` (temp intake path used first)
  - [x] SVG has explicit `viewBox` (to verify)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec (to verify JSON+MD)
  - [x] Codex verified SVG exists before implementation (temp ingest phase)

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

- [ ] AC-1: All 7 user-provided draft artifacts are created under `design_drafts/tmp_task238/`.
- [ ] AC-2: No runtime/app code files are modified.
- [ ] AC-3: Each SVG is checked for required semantic IDs and required state groups.
- [ ] AC-4: Redline JSON/MD are checked for required numeric fields and viewport coverage.
- [ ] AC-5: Review report clearly labels pass/fail and survivor candidates.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `ls -1 design_drafts/tmp_task238`
   - Expected result: 7 expected temp files exist.
   - Covers: AC-1

2) Step:
   - Command / click path: `git status --short`
   - Expected result: only task_247 + temp draft files changed, no `v10/src` changes.
   - Covers: AC-2

3) Step:
   - Command / click path: ID/state check via `rg` against all temp SVG files.
   - Expected result: explicit pass/fail by required token list.
   - Covers: AC-3

4) Step:
   - Command / click path: inspect redline JSON/MD keys and viewport sections.
   - Expected result: pass/fail by mandatory fields and consistency.
   - Covers: AC-4

5) Step:
   - Command / click path: publish review summary in chat.
   - Expected result: clear survivor list + remediation list.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Temporary drafts could be mistaken for approved final assets.
- Roll-back:
  - Remove `design_drafts/tmp_task238/` and revert task file.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user asked to create temp files first, review, then promote survivors.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_247_ingest_gemini_svg_pack_temp_review.md`
- `design_drafts/tmp_task238/layout_task238_window_shell_master.svg`
- `design_drafts/tmp_task238/layout_task238_768x1024.svg`
- `design_drafts/tmp_task238/layout_task238_820x1180.svg`
- `design_drafts/tmp_task238/layout_task238_1024x768.svg`
- `design_drafts/tmp_task238/layout_task238_1180x820.svg`
- `design_drafts/tmp_task238/layout_task238_redlines.json`
- `design_drafts/tmp_task238/layout_task238_redlines.md`

Commands run (only if user asked or required by spec):
- `mkdir -p design_drafts/tmp_task238`
- `cat > design_drafts/tmp_task238/*.svg|*.json|*.md` (ingest user-provided drafts)
- semantic gate checks using `rg`, `sed`, `ls` over temp SVG/JSON/MD files

## Gate Results (Codex fills)

- Lint:
  - N/A (no app code changes)
- Build:
  - N/A (no app code changes)
- Script checks:
  - N/A (manual SVG gate checks executed instead)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - SVG gate nonconformances in temp drafts:
    - Close target touch size < 44px on all SVGs (`32x32`, `32x24`)
    - Redlines do not provide per-viewport top/bottom chrome rect (only height)
    - Redlines include non-numeric docked sizes (`\"100% ...\"`) where numeric px expected
    - Reachability checks are generic text, not per-viewport pass/fail entries
- Blocking:
  - NO (for intake task); YES for promotion to final gate assets
- Mitigation:
  - Keep drafts in temp path; revise failing fields before promotion

Manual verification notes:
- AC-1 PASS: 7 temp artifacts created in `design_drafts/tmp_task238/`.
- AC-2 PASS: no runtime code files modified.
- AC-3 PASS (presence): required IDs/states are present across all 5 SVGs.
- AC-4 PARTIAL: viewport coverage exists, but redline numeric/format constraints not fully met.
- AC-5 PASS: review classification prepared (survivor vs revise).

Notes:
- These are intake drafts only and not yet promoted into canonical `design_drafts/` paths.
