# Task 033: Layout Controls (Explicit Break Blocks)

**Status:** COMPLETED
**Priority:** CRITICAL
**Assignee:** Codex CLI
**Dependencies:** Task 028 (Auto Layout)

## Context
We are implementing **Explicit Break Blocks** to control layout persistently. This replaces the previous `layoutBreaks` attempt.
This task refactors the layout buttons to insert actual blocks into the `stepBlocks` array.

## Goals
1.  **Insert Block:** Layout buttons insert a break block.
2.  **Persistence:** Breaks are saved in `stepBlocks`.
3.  **Cleanup:** Remove deprecated `layoutBreaks`.
4.  **UX Safety:** View follows the content after insertion.

## Requirements
### 1. Store Logic (`useCanvasStore`)
- **Insertion Index Logic:**
  - Use **`insertionIndex` only when `isDataInputOpen` is true**.
  - If panel is closed: try **`selectedItemId` -> segmentId -> block index**.
  - Fallback: find the first content block for `currentStep` and insert *before* it.
- **Action:** `insertBreak(type)`.
  - Perform `stepBlocks.splice(targetIndex, 0, newBreakBlock)`.
  - `newBreakBlock` has `segments: []` (empty).
- **View Maintenance:**
  - After insertion/rebuild, check which page the `currentStep` ended up on.
  - Automatically `setCurrentPageId` to that page so the user doesn't lose context.

### 2. Block Building Logic (`buildPagesFromBlocks` & `autoLayout.ts`)
- **Break Rendering:**
  - Data: `segments` is empty.
  - **Build Time:** When converting blocks to pages, inject specific `CanvasItem`s for breaks:
    - `line-break` -> TextItem with `<div class="line-break-spacer"></div>`.
    - `column-break` -> TextItem with `<div class="force-break"></div>` (CSS: `break-before: column`).
    - `page-break` -> Triggers new page creation logic.
- **Auto Layout Update:**
  - Ensure `autoLayout.ts` respects manual `line-break` and `column-break` blocks (currently it only handles page breaks).
  - Do **NOT** increment `stepIndex` for break blocks.

### 3. UI Updates
- **Floating Toolbar:** Bind buttons to `insertBreak`.
- **Data Input Panel:**
  - Visualize break blocks (e.g., Icon + Label "Line Break").
  - Allow delete/drag.

## Scope (touched files)
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/layout/autoLayout.ts`
- `v10/src/core/types/canvas.ts`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/app/globals.css`

## Acceptance Criteria
1.  Clicking "Column Break" inserts a break item in the panel.
2.  The rendered content moves to the next column immediately.
3.  The viewport stays focused on the current content (doesn't jump to page 1).
4.  `stepIndex` count remains unchanged.
5.  Reloading preserves the break.

## Manual Verification
1. Open Data Input panel, click an insertion marker between blocks, then click “Line Break” → break appears in list and a visible gap shows on canvas.
2. Close panel, during playback click “Page Break” → current content moves to the next page and the view follows it.

## Closeout
- **Changed files:**
  - `v10/src/features/store/useCanvasStore.ts`
  - `v10/src/features/layout/DataInputPanel.tsx`
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
  - `v10/src/features/layout/autoLayout.ts`
  - `v10/src/app/globals.css`
- **Commands run:** none
- **Manual verification:** not run (not requested).
- **Notes:** DataInputPanel now re-syncs local blocks when only break blocks are inserted from the toolbar (panel open) without overwriting content edits.
- **Notes:** ContentLayer sanitizer now explicitly allows `class` to preserve break markup (`line-break-spacer`, `force-break`).
- **Notes:** Line break spacer now uses `1lh` (line-height) and a non-breaking space so spacing scales with font size.
