# Task 018: Interaction Polish (Snap + Guides)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 011 (Image Object), Task 015 (Data Input Panel)

## Context
Image objects exist but alignment is imprecise. We want light-weight, predictable snapping and visual guides when moving/positioning items. This task is **object interaction polish**, not a layout overhaul.

## Goals
1) Snap image positions to key guide lines (page center + other image edges/centers).  
2) Show lightweight alignment guides during drag.  
3) Keyboard nudge for selected image (1px, Shift+Arrow = 10px).

## Non-goals
- Text item snapping (flow text is not interactive).  
- Grid snapping, rotation snapping, or smart layout.  
- No new text layout modes; image drag may toggle image `layoutMode` without changing text flow rules.

## Scope (touched files)
- `v10/src/hooks/useSnap.ts` (new)
- `v10/src/store/useUIStore.ts`
- `v10/src/components/canvas/CanvasGuides.tsx` (new)
- `v10/src/components/canvas/CanvasStage.tsx`
- `v10/src/components/canvas/objects/ImageBlock.tsx`
- `v10/src/components/canvas/ContentLayer.tsx`
- `v10/src/hooks/useImageInsert.ts`
- `v10/src/types/canvas.ts`

## Requirements
### 1) Snap Engine
- Implement `useSnap` that accepts:
  - `bounds`: current item rect in board space `{ x, y, w, h }`
  - `others`: array of rects for other images on the same page
  - `boardSize`: `{ width, height }`
- Output:
  - `{ x, y, guides: Array<{ type: "vertical" | "horizontal"; pos: number; kind: "center" | "edge" }> }`
- Threshold: snap when within **6px**.
- Snap targets:
  - Board center lines (vertical + horizontal).
  - Other image left/right/top/bottom/center edges.

### 2) Drag integration (ImageBlock)
- Apply snapping **only while dragging**.
- Guides are shown only during drag and cleared on pointer up.
- If drag movement is not currently supported, add minimal drag-to-move behavior here (board-space x/y update).

### 3) Guides overlay
- Render SVG lines on a top overlay layer (`CanvasGuides`).
- Style:
  - Center guide: solid red line.
  - Other guides: dashed blue line.

### 4) Keyboard nudge
- When an image is selected and focus is **not** inside a text input/textarea:
  - Arrow keys move by 1px.
  - Shift+Arrow moves by 10px.
- Do not interfere with typing inside the data input panel.

## Acceptance Criteria
1) Dragging an image near the board center snaps and shows a red guide.  
2) Dragging near another image edge snaps and shows a dashed blue guide.  
3) Arrow keys nudge the selected image, and do nothing while typing in the panel.

## Manual Verification
1) Insert two images and drag one near the other; confirm snap + guides.  
2) Toggle focus to the data input panel and confirm Arrow keys only move caret.  
3) Release drag and confirm guides disappear.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/hooks/useSnap.ts`
- `v10/src/store/useUIStore.ts`
- `v10/src/components/canvas/CanvasGuides.tsx`
- `v10/src/components/canvas/CanvasStage.tsx`
- `v10/src/components/canvas/objects/ImageBlock.tsx`
- `v10/src/components/canvas/ContentLayer.tsx`
- `v10/src/hooks/useImageInsert.ts`
- `v10/src/types/canvas.ts`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions).
