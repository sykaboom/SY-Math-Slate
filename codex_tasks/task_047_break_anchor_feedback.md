# Task 047: Track A-1 — Break Anchor Feedback

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 044

## Context
Currently, line breaks, column breaks, and page breaks are treated as "transparent" by the auto-layout and playback systems. The cursor (chalk indicator) skips over them because they don't increment the step index. To match the legacy tool's UX, the cursor should be able to land on these breaks, and the system should provide immediate visual feedback on the canvas.

## Goals
1) Enable the cursor to land on break blocks during playback/navigation.
2) Provide visual feedback (anchor indicators) for breaks on the canvas.
3) Ensure breaks are measured correctly in the `anchorMap` for visual continuity.

## Scope (touched files)
- `v10/src/features/chrome/layout/autoLayout.ts`: Measurement and anchor generation for break blocks.
- `v10/src/features/platform/store/useCanvasStore.ts`: Align step indexing to a 1:1 block-to-step relationship.
- `v10/src/features/editor/canvas/AnchorIndicator.tsx`: Enhance to render distinct visuals for break anchors.
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`: Update total step calculation logic.
- `v10/src/core/migrations/migrateToV2.ts`: Add logic to trigger re-layout for legacy (content-only step) documents.

## Requirements
1) **1:1 Step Mapping:** 
   - Every `StepBlock` (regardless of `kind`) must increment the global `currentStepIndex` by 1.
   - Remove logic that "skips" step indexing for breaks.
2) **Break Measurement in `runAutoLayout`:** 
   - For `line-break`: Measure the `line-break-spacer` element.
   - For `column-break`: Measure the `force-break` element.
   - For `page-break`: Create an anchor at `x: 48, y: 48` (top-left inner padding) of the new page.
   - Use `block.id` as the `segmentId` in the `AnchorPosition`.
3) **UI Feedback (Styling):**
   - **Styling:** When the current anchor is a break (detected via `block.kind`), `AnchorIndicator` should apply a **Neon Purple shadow/glow** (`box-shadow: 0 0 15px #ff10f0`) and the chalk holder should have `opacity: 0.8`.
4) **Store Logic:**
   - Simplify `findBlockIndexForStep` to return `stepIndex` (since it's 1:1).
   - Ensure `getGlobalMaxStep` returns `stepBlocks.length - 1`.
5) **Migration / Compatibility (v2.1):**
   - Treat documents with content-only step indexing as "legacy".
   - Introduce a minor version `2.1` in the doc schema.
   - On hydration of a `v2.0` doc, automatically trigger a one-time `applyAutoLayout` to re-index all items and populate the 1:1 `anchorMap`.
   - **Audio Note:** Acknowledge that `audioByStep` keys may drift; provide a console warning if `v2.0` doc has audio.

## Risks & Rollback
- **Risk:** Audio synchronization might be lost if breaks are inserted into legacy documents.
- **Risk:** Rapid navigation might feel "stuttery" due to frequent small jumps (line breaks).
- **Rollback:** Revert `autoLayout.ts` and `useCanvasStore.ts` to the previous "isContentBlock" check for step incrementing.

## Acceptance Criteria
1) Navigating through steps (Next/Prev) lands on every block, including breaks.
2) The Chalk Indicator (AnchorIndicator) moves to the correct physical location of the break.
3) Total steps in `PlaybackControls` matches the number of items in the Data Input panel.
4) No regression: Content items still hide/show correctly based on their `stepIndex`.

## Manual Verification
1) Create: Content Block -> Line Break -> Content Block -> Page Break.
2) Step through using Playback Controls.
3) Verify the chalk lands on the line break (middle of the page) and the page break (start of next page).
4) Verify the step counter shows "Step X / 4".

## Closeout Notes
- Changed files:
  - `v10/src/features/chrome/layout/autoLayout.ts`
  - `v10/src/features/platform/store/useCanvasStore.ts`
  - `v10/src/features/editor/canvas/AnchorIndicator.tsx`
  - `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
  - `v10/src/core/migrations/migrateToV2.ts`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
