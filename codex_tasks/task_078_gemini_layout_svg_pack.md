# Task 078: Gemini Layout SVG Pack (Structure Baseline)

Status: COMPLETED

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



## Redline Fix Pack (v3 - Strict Precision)

The previous v2 drafts failed strict layout math verification. Regenerate using these precise calculations.



### 1) `AppLayout` Math (1440px width context)

- **Constraint**: `px-6` (24px padding), `gap-4` (16px gap), DataInput `420px` fixed.

- **Calculation**:

  - Left Padding: 0 to 24

  - **Canvas Stage**: x=24, width=**956** (1440 - 24*2 - 16 - 420)

  - Gap: 980 to 996 (16px)

  - **DataInput Panel**: x=996, width=**420**

  - Right Padding: 1416 to 1440 (24px)

- **Action**: Fix SVG rects to match these exact X/Width values.



### 2) `DataInputPanel` Structure

- **Constraint**: Add granular IDs for internal sections.

- **IDs**: `#region_header`, `#region_tabs`, `#region_scroll_content`, `#region_footer_actions`.

- **Constraint**: Maintain the `420px` width source of truth.



### 3) `OverviewStage` Dynamic Scale

- **Constraint**: Do not hardcode scale values (e.g. `scale(0.5)`).

- **Action**: Keep transform root structural and annotate dynamic behavior as `scale(overviewZoom)`.

- **Size**: Keep page sizes bound to board ratio (1440x1080).



### 4) Tablet/Mobile Governance

- **Action**: In `DataInput` and `AppLayout` SVGs, explicitly annotate the Responsive Behavior:

  - `<lg`: Panel is `fixed inset-0` (Overlay).

  - `>=lg`: Panel is `static w-[420px]`.



## Gemini regeneration prompt (v3)

"""

Regenerate Task 078 SVG pack (v3 strict math).



Files:

1) design_drafts/layout_app_layout_1440x1080.svg

   - Layout: Flex row.

   - Px: 24 (left pad)

   - Canvas: x=24, w=956

   - Gap: 16 (gap-4)

   - Panel: x=996, w=420

   - Px: 24 (right pad)

   - Footer: Stack centered, w=min(1120px, 94vw).



2) design_drafts/layout_datainput_1440x1080.svg

   - Width: 420 (desktop).

   - IDs: #region_header, #region_tabs, #region_scroll_content, #region_footer_actions.

   - Note: Mobile/Tablet (<lg) = fixed inset-0 overlay.



3) design_drafts/layout_overviewstage_1440x1080.svg

   - Pages: 1440x1080.

   - Grid: gap 48px.

   - Transform: "scale(overviewZoom)" (dynamic).



4) design_drafts/layout_playerbar_1440x1080.svg

   - Width: min(780px, 92vw).

   - Center aligned.



5) design_drafts/layout_prompter_1440x1080.svg

   - Width: min(720px, 92vw).

   - Position: Above floating toolbar in footer stack.



General:

- NO decorative effects or mood directives (blur/shadow/animation mood prose).

- Minimal neutral presentation is allowed for readability in design drafts.

- STRICT dimensions.

"""



## Naming convention

- `design_drafts/layout_app_layout_1440x1080.svg`

- `design_drafts/layout_playerbar_1440x1080.svg`

- `design_drafts/layout_datainput_1440x1080.svg`

- `design_drafts/layout_overviewstage_1440x1080.svg`

- `design_drafts/layout_prompter_1440x1080.svg`



## Acceptance criteria (must be testable)

- [x] `AppLayout` SVG strictly follows the 24px/956px/16px/420px/24px horizontal rhythm.

- [x] `DataInput` SVG has specific sub-region IDs.

- [x] `OverviewStage` indicates dynamic zoom scaling.

- [x] No hardcoded static zoom value remains in transform roots.

- [x] All redline conflicts from v1/v2 are resolved.



## Manual verification steps

- Open `layout_app_layout_1440x1080.svg` and check rect `x` and `width` attributes against the calculated values.



## Risks / roll-back notes

- Risk: Calculation errors in manual SVG editing.

- Roll-back: Revert to previous working state.



---



## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:

- `codex_tasks/task_078_gemini_layout_svg_pack.md`

- `design_drafts/*.svg`



Commands run:

- `apply_patch` (SVG/Spec redline consistency fixes)
- `rg -n "scale\\(|NO decorative|neutral presentation|No hardcoded static zoom" ...`



Notes:

- v3 regeneration triggered to fix precise layout math and ID granularity.

- All SVGs verified for structural accuracy and code mapping IDs.
