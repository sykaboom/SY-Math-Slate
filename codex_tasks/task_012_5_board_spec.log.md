# Task 012.5 Log: BoardSpec & Coordinate System

## Summary
- Introduced fixed BoardSpec sizes (16:9, 4:3) and refactored PageViewport to scale content to fit.
- Added board transform hook for input coordinate mapping.
- Updated canvas renderers to draw in board coordinates with DPR transforms.
- Applied one-time local storage migration to convert legacy screen coords to board coords.
- Normalized overview page sizes to BoardSpec to keep layout consistent.

## Files Touched
- v10/src/lib/boardSpec.ts
- v10/src/components/canvas/PageViewport.tsx
- v10/src/hooks/useBoardTransform.ts
- v10/src/hooks/useCanvas.ts
- v10/src/hooks/useOverlayCanvas.ts
- v10/src/components/canvas/StaticStrokeLayer.tsx
- v10/src/components/layout/OverviewStage.tsx
- v10/src/hooks/useImageInsert.ts
- v10/src/components/canvas/CanvasStage.tsx
- v10/src/components/canvas/objects/ImageBlock.tsx
- v10/src/hooks/usePersistence.ts
- codex_tasks/task_012_5_board_spec.md
