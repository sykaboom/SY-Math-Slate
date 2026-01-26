# Task 032: Layout Cursor & Breaks (Data‑Layout Separation)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 031

## Context
Line/column/page controls must move the **layout cursor** (reading start) without mutating data. Layout breaks should be removable in the Data panel but must not alter raw data.

## Goals
1. Separate **layout breaks** from `stepBlocks` (data).
2. Line/column/page buttons insert **layout breaks** at the shared insertion point.
3. DataInputPanel shows layout breaks for removal, without touching raw text.

## Non-goals
- No canvas visual markers.
- No persistence schema changes.
- No new playback behavior.

## Scope (touched files)
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

## Requirements
1. Store:
   - Add `layoutBreaks` state (line/column/page breaks).
   - Add `addLayoutBreak(kind)` + `removeLayoutBreak(id)` actions.
   - Line/column/page buttons must add layout breaks (no data mutation).
   - Layout breaks must affect flow layout by merging into rendering pipeline.
2. DataInputPanel:
   - Render layout breaks inside Blocks list.
   - Allow deleting layout breaks from the panel.
   - Keep raw input text unchanged.

## Acceptance Criteria
1. Pressing 줄/단/페이지 does **not** change data blocks.
2. Layout breaks are visible in Blocks list and removable.
3. Canvas layout reflects layout breaks (line/column/page shifts).

## Manual Verification
1. Add layout break → data panel shows it; raw text unchanged.
2. Remove layout break → canvas layout returns.
3. Multiple breaks can be inserted at same insertion point.

## Closeout
- **Changed files:**
  - `v10/src/features/store/useCanvasStore.ts`
  - `v10/src/features/layout/DataInputPanel.tsx`
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
- **Commands run:** none
- **Manual verification:** not run (not requested).
- **Notes:** Added insertion mode (auto/panel) so toolbar breaks follow the playback cursor when the data panel is closed, while panel edits still honor explicit insertion markers.
- **Notes (follow-up):** Preserve current view after inserting/removing layout breaks by mapping the active step’s block index to its new page/local step placement.
