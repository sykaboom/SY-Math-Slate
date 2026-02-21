# Task 031: Logical Insertion Point for Layout Controls

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 030

## Context
The line/column/page buttons currently append break blocks to the end of the document, making the controls feel unusable. We need a logical insertion point so these actions apply where the user expects.

## Goals
1. Introduce a **logical insertion index** for stepBlocks.
2. Line/column/page actions insert at the current insertion point.
3. Provide a **clear, low‑friction UI** in DataInputPanel to set the insertion point.

## Non-goals
- No canvas-side visual markers.
- No new playback behavior.
- No new persistence schema.

## Scope (touched files)
- `v10/src/features/platform/store/useCanvasStore.ts`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

## Requirements
1. Store:
   - Add `insertionIndex` state (0..stepBlocks.length).
   - Add `setInsertionIndex(index)` action (clamped).
   - Break insert actions must **splice** at insertionIndex and then advance insertionIndex.
   - When blocks are imported/reset, insertionIndex defaults to end.
2. DataInputPanel:
   - Expose insertion point selection in the Blocks tab.
   - Provide a lightweight inline control between blocks to choose insertion index.
   - Selected insertion point should be visually clear.

## Acceptance Criteria
1. Pressing line/column/page inserts at the selected insertion point (not always at the end).
2. Insertion point is adjustable without closing the panel.
3. Default insertion point is end of document.

## Manual Verification
1. Set insertion point between block 2 and 3 → press Line Break → appears there in Blocks list.
2. Set insertion to start → press Column Break → appears at top.
3. Closing/reopening DataInputPanel keeps default insertion point at end (unless user set it).

## Closeout
- **Changed files:**
  - `v10/src/features/platform/store/useCanvasStore.ts`
  - `v10/src/features/chrome/layout/DataInputPanel.tsx`
- **Commands run:** none
- **Manual verification:** not run (not requested).
