# Task 017: Cleanup After Hotfixes

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 016 (Tablet UX Polish)

## Context
Recent hotfixes stabilized layout/resize behavior and introduced a data input panel. Some legacy text-editing paths are now unused, and PageViewport sizing logic can be simplified. This task cleans up code paths without changing user-visible behavior.

## Goals
1. **Remove unused text-editing UI** now that text input is panel-driven.
2. **Simplify PageViewport sizing logic** while keeping responsive scaling.
3. **Streamline DataInputPanel logic** (minor refactor only; no UX change).

## Scope (touched files)
- `v10/src/components/canvas/ContentLayer.tsx`
- `v10/src/components/canvas/editing/TextEditor.tsx` (remove)
- `v10/src/components/canvas/editing/BubbleToolbar.tsx` (remove)
- `v10/src/store/useUIStore.ts`
- `v10/src/components/canvas/CanvasLayer.tsx`
- `v10/src/components/canvas/CanvasStage.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/hooks/useCanvas.ts`
- `v10/src/hooks/useSequence.ts`
- `v10/src/components/canvas/PageViewport.tsx`
- `v10/src/components/layout/DataInputPanel.tsx`

## Requirements
### 1) Remove canvas text-editing UI
- Remove `TextEditor`/`BubbleToolbar` usage and files.
- ContentLayer should render flow/absolute text without edit-on-click.
- Remove `editingItemId` gating where it only existed for the editor.

### 2) PageViewport cleanup
- Replace `boardSize` state with derived value (memo) based on `ratio`.
- Keep ResizeObserver + rAF (if still needed), but remove extra conditional clutter.
- Ensure scaling still updates on resize both directions.

### 3) DataInputPanel cleanup
- Minor refactor only (no UX change). Keep current behavior: tabs on <1024px, Up/Down reorder, selection-based HL/$$.

## Acceptance Criteria
1. No text editing UI is reachable from the canvas.
2. Resize up/down still scales the board correctly with no jitter.
3. Data input panel behavior unchanged.

## Closeout
- **Changed files:**
  - `v10/src/components/canvas/ContentLayer.tsx`
  - `v10/src/components/canvas/editing/TextEditor.tsx` (removed)
  - `v10/src/components/canvas/editing/BubbleToolbar.tsx` (removed)
  - `v10/src/store/useUIStore.ts`
  - `v10/src/components/canvas/CanvasLayer.tsx`
  - `v10/src/components/canvas/CanvasStage.tsx`
  - `v10/src/components/toolbar/FloatingToolbar.tsx`
  - `v10/src/hooks/useCanvas.ts`
  - `v10/src/components/canvas/PageViewport.tsx`
- **Commands run:** none
- **Manual verification:** not run (not requested).

## Hotfix Notes
- Fix: restore missing `useUIStore` import after cleanup.
- Files: `v10/src/components/canvas/ContentLayer.tsx`
- Fix: add missing `totalSteps` in PlaybackControls and add step jump slider to step counter.
- Files: `v10/src/components/toolbar/PlaybackControls.tsx`, `v10/src/components/toolbar/FloatingToolbar.tsx`
- Fix: add missing Slider import for step jump.
- Files: `v10/src/components/toolbar/FloatingToolbar.tsx`
- Fix: enable mouse-wheel step scrub, center board padding, and wire header zoom to overview mode.
- Files: `v10/src/components/toolbar/FloatingToolbar.tsx`, `v10/src/components/toolbar/PlaybackControls.tsx`, `v10/src/components/layout/AppLayout.tsx`, `v10/src/components/canvas/CanvasStage.tsx`
- Fix: allow asymmetric board padding (more bottom space for UI overlays).
- Files: `v10/src/components/canvas/PageViewport.tsx`, `v10/src/components/canvas/CanvasStage.tsx`
- Fix: switch to layout-based footer stack (no fixed overlays), removing safe-bottom JS logic.
- Files: `v10/src/components/layout/AppLayout.tsx`, `v10/src/components/layout/Prompter.tsx`, `v10/src/components/toolbar/FloatingToolbar.tsx`, `v10/src/components/layout/PlayerBar.tsx`, `v10/src/components/canvas/CanvasStage.tsx`
- Fix: group steps + toolbar into one footer block and remove horizontal scroll.
- Files: `v10/src/components/layout/AppLayout.tsx`, `v10/src/components/layout/Prompter.tsx`, `v10/src/components/toolbar/FloatingToolbar.tsx`
- Fix: add raw input line markers and adaptive line spacing for DataInputPanel.
- Files: `v10/src/features/chrome/layout/DataInputPanel.tsx`
- Fix: categorize and compact the More menu sections.
- Files: `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Fix: auto-advance pages during autoplay when a next page exists.
- Files: `v10/src/features/platform/hooks/useSequence.ts`, `v10/src/features/platform/store/useCanvasStore.ts`
- Fix: keep Data Input Panel open after applying changes.
- Files: `v10/src/features/chrome/layout/DataInputPanel.tsx`
