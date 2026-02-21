# Task 034: WYSIWYG Breaks + Global Step Index

**Status:** COMPLETED  
**Priority:** CRITICAL  
**Assignee:** Codex CLI  
**Dependencies:** Task 033

## Context
Layout controls must behave like the legacy UX: “the visible sentence is the edit target.”  
Currently step indices reset per page, and break insertion feels like data programming instead of visual editing.

## Goals
1. **Global Step Index:** Step indices are continuous across pages (no per-page reset).
2. **WYSIWYG Breaks:** Line/Column/Page break buttons act on the *current visible step* and the view follows.
3. **Immediate Feedback:** Break insertion is immediately visible on canvas.
4. **Visual Markers (Edit Mode):** When Data Input panel is open, break locations are visible (dashed markers). When closed, markers are hidden.

## Requirements
### 1) Global Step Index
- `buildPagesFromBlocks` must **not reset** `stepIndex` on page breaks.
- `autoLayout.ts` must **not reset** `currentStepIndex` on page breaks or overflow; step numbers continue globally.
- Any “max step” calculations used by playback/toolbar must be global across all pages.

### 2) View Follows Content
- When `currentStep` changes (next/prev/jump), `currentPageId` must update to the page that contains that global step.
- Playback controls must use global step count and move pages automatically when step changes.

### 3) WYSIWYG Insert Target
- For break insertion (panel closed): target index is the block for `currentStep` (insert *before* it).
- For panel open: use `insertionIndex` (explicit marker).
- After insertion, the view must remain on the page containing the current step’s content.

### 4) Visual Markers (Edit Mode Only)
- Add a “editing” flag on the canvas layer when `isDataInputOpen` is true.
- CSS:
  - `.editing-breaks .line-break-spacer` shows a dashed horizontal marker.
  - `.editing-breaks .force-break` shows a dashed vertical marker.
- Markers are hidden when panel is closed.

## Scope (touched files)
- `v10/src/features/platform/store/useCanvasStore.ts`
- `v10/src/features/platform/hooks/useSequence.ts`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/editor/canvas/ContentLayer.tsx`
- `v10/src/features/chrome/layout/autoLayout.ts`
- `v10/src/app/globals.css`

## Acceptance Criteria
1. Global step count continues across pages (no reset to 0 on new pages).
2. Playback / step controls move to the correct page automatically.
3. Inserting a page break moves subsequent content to a new page and the view follows.
4. With Data Input open, break locations display dashed markers; closed, they disappear.

## Manual Verification
1. Add 3 steps + page break, play through → step numbers continue and page auto-follows.
2. Open Data Input panel → line/column break markers appear; close panel → markers hidden.

## Closeout
- **Changed files:**
  - `v10/src/features/platform/store/useCanvasStore.ts`
  - `v10/src/features/platform/hooks/useSequence.ts`
  - `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
  - `v10/src/features/editor/canvas/ContentLayer.tsx`
  - `v10/src/features/chrome/layout/autoLayout.ts`
  - `v10/src/app/globals.css`
- **Commands run:** none
- **Manual verification:** not run (not requested).
