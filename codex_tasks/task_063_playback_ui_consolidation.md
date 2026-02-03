# Task 063 (Deprecated): UI Polish — Playback, Prompter, & Layout Controls

**Status:** DEPRECATED
**Priority:** P2 (UI/UX)
**Assignee:** Codex CLI
**Dependencies:** Task 062 (can run in parallel)

## Context
Multiple UI areas feel "debug-like" or cluttered. The user requested specific improvements to the Playback bar, the Step Preview (Prompter), and the Data Input/Layout controls.

## Superseded
- This spec is superseded by `codex_tasks/task_063_ui_polish.md` (consolidated version).

## Goals
1.  **Playback Bar:** De-clutter. Merge Play/Pause. Move configuration (Speed/Delay) to a settings popover.
2.  **Prompter (Step Preview):** Remove the noisy horizontal scroll list. Replace with a focused "Subtitle" style view (Current + Next preview).
3.  **Layout Controls:** Add/Polish explicit buttons for inserting Layout Breaks (Line/Column/Page) using intuitive icons instead of text.
4.  **Icons:** Update "Paste/Image" actions to use the standard `ImagePlus` icon.

## Scope (Files)
- `v10/src/features/toolbar/PlaybackControls.tsx`
- `v10/src/features/layout/Prompter.tsx`
- `v10/src/features/layout/DataInputPanel.tsx`

## Detailed Design Specs

### 1. `PlaybackControls.tsx` (Toolbar)
- **Consolidate Play/Pause:**
    - Single toggle button.
    - Icon: `Play` (when paused/stopped) / `Pause` (when animating).
- **Settings Popover (Gear Icon):**
    - Move `Speed` slider, `Delay` slider, and `Auto-Play` toggle inside a `Settings` popover.
    - Remove them from the top-level bar.
- **Step Navigation:**
    - Simplify to: `[Prev <] [ Current / Total ] [> Next]`.
    - Remove the slider if it feels cramped, or keep it inside the Settings popover if needed. For now, arrow navigation is preferred.

### 2. `Prompter.tsx` (Step Preview)
- **Current Issue:** The horizontal scroll list (`overflow-x-auto`) is noisy and looks like a debug view.
- **New Design:** "Dynamic Subtitle"
    - **Container:** Centered bottom-floating pill (Glassmorphism).
    - **Content:**
        - **Current Step:** Bright white text, larger font.
        - **Next Step:** (Optional) Small, dimmed text below or to the right ("Next: ...").
    - **Animation:** subtle fade transition when step changes.
    - **Hide:** If `currentStep` has no text, hide or show placeholder.

### 3. `DataInputPanel.tsx` (Layout & Content)
- **Insert Break Icons:**
    - Add a toolbar row (likely at the top or sticky bottom) to insert breaks explicitly.
    - **Line Break:** Icon `CornerDownLeft` (Enter key style).
    - **Column Break:** Icon `Columns` or `ArrowRightToLine`.
    - **Page Break:** Icon `FilePlus` or `ScanLine`.
- **Media Icons:**
    - Change "Image" button icon to `ImagePlus`.
- **Refinement:**
    - Ensure these buttons insert the respective `StepBlock` (kind: `line-break`, etc.) at the `insertionIndex`.

## Acceptance Criteria
- [ ] **Playback:** Bar is cleaner. Settings (Speed/Delay) are hidden in a popover. Play/Pause works as a toggle.
- [ ] **Prompter:** No longer a scroll list. Shows focused current step text. Looks like a polished subtitle overlay.
- [ ] **Data Input:** Users can click icons to insert Line/Column/Page breaks.
- [ ] **Icons:** `ImagePlus` is used for image actions.

## Risks
- **Prompter Visibility:** Ensure the new prompter doesn't overlap with the Playback bar or content too aggressively. (Z-index check).
- **Break Insertion:** Ensure inserting a break update the `stepBlocks` correctly without breaking `autoLayout`.
