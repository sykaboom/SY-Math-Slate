# Task 078: Gemini Layout SVG Pack (Structure Baseline)

Status: PENDING
Owner: Codex (spec) / Gemini (design artifacts)
Target: design_drafts/ (SVG only)
Date: 2026-02-06

## Goal
- What to change:
  - Produce baseline **layout-structure SVGs** for key v10 screens using Gemini’s spatial reasoning.
  - Use these SVGs as the authoritative **structure layer** for upcoming layout refactors.
- What must NOT change:
  - No production code edits.
  - SVGs are **design artifacts only** and must not be embedded in code.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `design_drafts/` (SVG files only)
- `codex_tasks/task_078_gemini_layout_svg_pack.md`

Out of scope:
- Any v10 production code edits
- Any CSS/JS changes
- Any non-SVG design assets

## Dependencies / constraints
- Must follow `GEMINI_CODEX_PROTOCOL.md` SVG handoff rules.
- SVGs must include `viewBox` with explicit width/height and ratio label.
- Default baseline size: **1440x1080 (4:3)**.
- Optional secondary variant: **1920x1080 (16:9)** for presentation/overview where needed.

## Screens to design (SVG required)
1) `AppLayout` (full shell)
   - Header + primary canvas + right panel layout
2) `PlayerBar` (playback controls)
3) `DataInputPanel` (input/blocks/toolbar/insert markers)
4) `OverviewStage` (overview + viewport ratio effects)
5) `Prompter` (step preview overlay)

## SVG Requirements (non-negotiable)
- **Structural only**: layout boxes, alignment, hierarchy (no styling).
- Must encode:
  - layout ratios / grid (if any)
  - component relationships and grouping
  - alignment rules (edges, centers, baselines)
  - hierarchy (visual importance / z-order)
  - stable component IDs (for code mapping)
- Include annotations in SVG (labels or metadata) for:
  - primary container bounds
  - spacing tokens (gaps, paddings)
  - key breakpoints (if any)

## Naming convention
- `design_drafts/layout_app_layout_1440x1080.svg`
- `design_drafts/layout_playerbar_1440x1080.svg`
- `design_drafts/layout_datainput_1440x1080.svg`
- `design_drafts/layout_overviewstage_1440x1080.svg`
- `design_drafts/layout_prompter_1440x1080.svg`
- Optional 16:9 variants:
  - `design_drafts/layout_<name>_1920x1080.svg`

## Acceptance criteria (must be testable)
- [ ] All five SVGs exist in `design_drafts/` with correct naming.
- [ ] Each SVG includes `viewBox` and ratio label.
- [ ] Each SVG contains component IDs and alignment/hierarchy annotations.
- [ ] No production code files are modified.

## Manual verification steps (since no automated tests)
- Open each SVG and confirm:
  - viewBox is set (1440x1080 or 1920x1080)
  - labeled component IDs exist
  - alignment guides / hierarchy annotations present

## Risks / roll-back notes
- Risk: Overly detailed styling may sneak into SVG; enforce structure-only.
- Roll-back: delete SVGs and re-request with stricter constraints.

---

## Implementation Log (Codex fills)
Status: PENDING
Changed files:
- `codex_tasks/task_078_gemini_layout_svg_pack.md`

Commands run (only if user asked):
- None

Notes:
- Spec created to trigger Gemini SVG design pass.
