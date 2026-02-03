# Task 063: UI Polish — Playback, Prompter, Layout & Eraser

**Status:** PENDING
**Priority:** P2 (UI/UX)
**Assignee:** Codex CLI
**Dependencies:** Task 062 (can run in parallel)

## Context
Multiple UI areas feel "debug-like" or cluttered. The user requested specific improvements to the Playback bar, the Step Preview (Prompter), and the Data Input/Layout controls. Additionally, frequently used controls (Page Nav, Column Count) are hidden or hard to access. The eraser should behave like a stroke eraser (delete whole stroke on intersection).

## Goals
1.  **Playback Bar:** De-clutter. Merge Play/Pause. Move configuration (Speed/Delay) to a settings popover.
2.  **Prompter (Step Preview):** Remove the noisy horizontal scroll list. Replace with a focused "Subtitle" style view.
3.  **Layout Controls:** Add explicit icons for inserting breaks.
4.  **Accessibility:** Ensure "Page Navigation" and "Column Count" are **always visible (1-Depth)**, not hidden in menus.
5.  **Page Management:** Add "Page Delete" (Trash) button, enabled **only** if the page is effectively empty (no content steps, no ink strokes).
6.  **Eraser Behavior:** Update standard eraser to delete whole strokes on intersection (stroke eraser).

## Scope (Files)
- `v10/src/features/toolbar/PlaybackControls.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx` (New/Update)
- `v10/src/features/layout/Prompter.tsx`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/store/useCanvasStore.ts` (For `isPageEmpty` logic)
- `v10/src/features/hooks/useCanvas.ts` (Stroke eraser hit-test + deletion)

## Detailed Design Specs

### 1. `PlaybackControls.tsx` (Toolbar)
- **Consolidate Play/Pause:** Single toggle button.
- **Settings Popover (Gear Icon):** Move Speed/Delay/Auto-Play sliders here.
- **Step Navigation:** `[Prev] [Step X] [Next]` arrow style.

### 2. `PageNavigator.tsx` (Always Visible)
- **Location:** Always visible in main toolbar row (1-depth), not inside the "More" menu.
- **Controls:**
    - `[ < Prev Page ]`
    - `[ Page X / Y ]` (Click to jump)
    - `[ Next Page > ]`
    - `[ + ]` (Add Page)
    - `[ Trash ]` (Delete Page)
        - **Disabled (Locked):** If page has content (Steps or Ink).
        - **Enabled:** If page is empty.
- **Column Control:**
    - Adjacent to Page Nav.
    - Toggle: `[ 1 Col ] [ 2 Col ]` (use existing increase/decrease).

### 3. `Prompter.tsx` (Step Preview)
- **Style:** "Dynamic Subtitle" (Centered bottom-floating pill).
- **Content:** Current Step Text (Large) + Next Step Preview (Small/Dimmed).
- **Animation:** Subtle fade/slide on change.
- **Data Source:** Page-based (only steps/items from current page).

### 4. `DataInputPanel.tsx` (Layout)
- **Insert Icons:** `CornerDownLeft` (Line), `Columns` (Column), `FilePlus` (Page Break).
- **Media Icons:** Use `ImagePlus`.

### 5. `useCanvasStore.ts` (Logic)
- **`isPageEmpty(pageId)`:**
    - Returns `true` if:
        - No `stepBlocks` belong to this page (checked via `layoutSnapshot` or `pages` mapping).
        - No `CanvasItems` (Ink/Shapes) exist on this page.
    - **Ink Eraser Check:** If user erases all strokes, `pages[pageId]` becomes empty array -> `isPageEmpty` becomes true.
    - **Deletion policy:** Only delete the page itself; do **not** delete or rewrite global `stepBlocks`.

## Eraser UX (Stroke Eraser)
- **Requirement:** Standard eraser deletes **entire StrokeItem** on intersection (object-level erase).
- **Scope:** Update `useCanvas.ts` hit-test + deletion so that erasing removes the full stroke.

## Acceptance Criteria
- [ ] **Playback:** Clean, single Play/Pause, Settings popover.
- [ ] **1-Depth Controls:** Page Nav (<, >) and Column Toggle (1, 2) are always visible on the main toolbar.
- [ ] **Page Delete:** Trash icon is active ONLY when page is empty.
- [ ] **Empty Detection:** Erasing all ink + removing all text makes the page "empty" and unlock deletion.
- [ ] **Prompter:** Subtitle style, no scroll list.
- [ ] **Eraser:** Standard eraser deletes whole strokes on intersection.
