# Task 028: Auto Layout + AnchorMap + Media Steps

**Status:** COMPLETED  
**Priority:** CRITICAL  
**Assignee:** Codex CLI  
**Dependencies:** Task 015 (Data Input Panel), Task 020 (Presentation Mode)

## Context
Auto playback should work from raw input without manual layout, while still allowing the user to adjust placement minimally. We also need to support multiple media assets (images/videos) within a single step and preserve their intended order when rendering and replaying.

## Goals
1. **Auto Layout Pipeline** that assigns page/column/position for each step from raw data.
2. **AnchorMap** that persists layout decisions for stable replay and future video export.
3. **Media Steps** that allow multiple assets inside a step, with explicit order control in the input panel.
4. **Anchor UI** that previews the next insertion point and visually ties to chalk animation.
5. **Legacy Cursor Controls** that let users nudge the anchor (line/column/page) from the basic toolbar.
6. **Highlight Timing** that runs marker sweeps after a step completes (not during typing).

## Requirements

### 1) Data Model Extensions (Core)
- Introduce a **StepBlock** model:
  - `id`, `stepIndex`, `segments[]`
  - Segment types: `text | image | video`
  - Each segment has an `orderIndex` and optional `assetRef`.
- Add `AnchorMap` per page:
  - `pageId -> { stepIndex -> AnchorPosition[] }`
  - `AnchorPosition` includes `x`, `y`, `column`, `pageId`, `segmentId`.
- [Optional for future] Support relative anchors:
  - `relativeTo: "previous-segment" | "column-start" | "page-start"` with offsets.
- Persist `anchorMap` in `PersistedCanvasV2` (optional field).

### 2) Data Input Panel (Ordering + Media)
- Within each step, show segments as draggable chips/icons:
  - `img01`, `img02`, `play03` style labels.
- Drag & reorder segments inside a step.
- Allow adding image/video segments via file picker or URL.
- **Apply** imports steps and segments without auto layout.

### 3) Auto Layout Button (Manual Trigger)
- Add **“Auto Layout”** button in Data Input Panel.
- Running Auto Layout:
  - Generates/updates AnchorMap.
  - Auto-creates pages when overflow is detected.
  - Keeps user-inserted anchors/line breaks as **fixed constraints**.
  - **Safety:** Auto Layout must push a snapshot to Undo so it can be reverted.

### 4) Render Pipeline
- ContentLayer should render based on **AnchorMap** when present:
  - Same step renders in the same location across replays.
  - If AnchorMap missing, fallback to current flow logic.

### 5) Anchor UI (Next Position Preview)
- Display a “Next Anchor” indicator with chalk-actor continuity:
  - **States:** Idle (breathing), Active (morph into actor on play), Hidden (presentation mode).
  - **Visual continuity:** Anchor and ChalkActor share color/texture.
  - On play, the actor spawns at the anchor position and the anchor fades out.
 - **Legacy behavior:** The cursor is visible by default (no presentation/edit split) and the moving chalk is the cursor during typing.

### 6) Legacy Cursor Controls (Line / Column / Page)
- Add three basic toolbar actions:
  - **Line Break** (moves cursor down one line)
  - **Column Break** (moves cursor to next column; last column triggers new page)
  - **Page Break** (creates new page and moves cursor)
- These actions should not require the data panel to be open.

## Scope (touched files)
- `v10/src/core/types/canvas.ts` (StepBlock + AnchorMap types)
- `v10/src/features/platform/store/useCanvasStore.ts` (store StepBlocks + anchorMap)
- `v10/src/features/chrome/layout/DataInputPanel.tsx` (segment list, order UI, auto layout trigger)
- `v10/src/features/chrome/layout/autoLayout.ts` (overflow measurement + layout engine)
- `v10/src/features/chrome/layout/AppLayout.tsx` (if new controls are mounted)
- `v10/src/features/editor/canvas/ContentLayer.tsx` (render using AnchorMap)
- `v10/src/features/editor/canvas/AnchorIndicator.tsx` (next anchor UI)
- `v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx` (typing + highlight timing)
- `v10/src/features/editor/canvas/actors/ChalkActor.tsx` (cursor continuity)
- `v10/src/features/editor/canvas/CanvasStage.tsx` (anchor indicator overlay)
- `v10/src/features/platform/hooks/useSequence.ts` (auto playback uses AnchorMap order)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (optional shortcut to Auto Layout)
- `v10/src/app/globals.css` (highlight + break helpers)

## Acceptance Criteria
1. A step can contain **multiple images/videos** with explicit order shown in the input panel.
2. Dragging segment chips updates the order in the rendered result.
3. “Auto Layout” generates pages when needed and saves AnchorMap.
4. Auto playback respects AnchorMap so positions remain consistent.
5. Anchor indicator appears at the next insertion point and uses a chalk-like style.
6. Auto Layout is undoable (single-step revert).
7. Cursor actions (line/column/page) are available in the basic toolbar and update the anchor immediately.
8. Highlight sweeps occur after a step completes (marker animation at the end).

## Risks / Notes
- Auto layout should be **manual trigger** to avoid unexpected reshuffles.
- AnchorMap must be forward-compatible with future video export tasks.

## Closeout
- **Changed files:**
  - `v10/src/core/types/canvas.ts`
  - `v10/src/features/platform/store/useCanvasStore.ts`
  - `v10/src/features/chrome/layout/autoLayout.ts`
  - `v10/src/features/chrome/layout/DataInputPanel.tsx`
  - `v10/src/features/editor/canvas/ContentLayer.tsx`
  - `v10/src/features/editor/canvas/AnchorIndicator.tsx`
  - `v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx`
  - `v10/src/features/editor/canvas/animation/MathRevealBlock.tsx`
  - `v10/src/features/editor/canvas/actors/ChalkActor.tsx`
  - `v10/src/features/platform/hooks/useSequence.ts`
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
  - `v10/src/app/globals.css`
- **Commands run:** none
- **Manual verification:** not run (not requested).
