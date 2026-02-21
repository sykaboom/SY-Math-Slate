# Task 060: Interactive Viewport (Pan & Zoom)

**Status:** COMPLETED
**Priority:** P0 (Legacy Feature Gap)
**Assignee:** Codex CLI
**Dependencies:** Task 012 (Overview), Task 012.5 (BoardSpec)

## Context
Normal mode is currently static. This task adds Pan & Zoom to both Edit and Presentation modes, including Tablet support (Pinch-to-zoom).

## Goals
1. **Viewport State:** `zoomLevel` (0.1 to 5.0), `panOffset` (screen px).
2. **Unified Interaction:**
   - **Hand Tool:** 1-finger Pan.
   - **Space + Drag / Middle Mouse:** Pan (unless typing in text box).
   - **Wheel / Pinch:** Zoom (Anchored at pointer/center).
3. **Touch Support:** 
   - **1-finger:** Drawing (Pass-through to CanvasLayer) - **Action:** Update `useCanvas` to allow touch.
   - **2-fingers:** Pan & Zoom (Handled by Viewport Hook).
   - **Policy:** Native Touch Events (`touchstart`) used only for 2-finger detection; pointer events remain for drawing.

## Requirements & Implementation Details

### 1. Store Updates (`useUIStore.ts`)
- Add `viewport: { zoomLevel: number, panOffset: { x: number, y: number } }`.
- Add actions: `setViewportZoom(level: number)`, `setViewportPan(x: number, y: number)`, `resetViewport()`.
- Ensure `setTool('hand')` logic exists (currently no-op).
- Add a transient flag `isViewportInteracting` (or equivalent) to suppress drawing during navigation gestures.

### 2. Viewport Interaction Hook (`v10/src/features/editor/canvas/viewport/useViewportInteraction.ts`)
- **Event Listeners:** Attach to `CanvasStage` container.
- **Mouse/Pointer Logic:**
  - `Wheel`: Zoom (use `ctrlKey` when available for trackpad pinch; otherwise treat wheel as zoom on canvas).
  - `PointerDown`: If `activeTool === 'hand'` OR `SpacePressed` OR `MiddleButton`:
    - Start Pan.
    - `setPointerCapture` to track movement.
    - Stop propagation to prevent selection/drawing.
- **Touch Logic (Native):**
  - Use `touchstart`, `touchmove` (passive: false).
  - If `touches.length === 2`:
    - Calculate Pinch (Zoom) & Centroid Move (Pan).
    - `e.preventDefault()` to stop browser zoom.
    - Update store `viewport`.
    - Set `isViewportInteracting = true` while gesture is active.
  - If `touches.length === 1`:
    - Ignore (Allow event to bubble to `CanvasLayer` for drawing).

### 3. Coordination & Conflict Resolution
- **Fix `useCanvas.ts`:** Remove `shouldAcceptDrawInput` check for `"touch"`. 1-finger touch must draw.
- **Fix `useOverlayCanvas.ts` (Overview):** Same touch policy if Overview ink is expected to work on tablet.
- **Space Key:** Ignore if `document.activeElement` is a text input/contentEditable.
- **Stop Propagation:**
  - When Panning (Mouse or Touch), `e.stopPropagation()` must be called to ensure `CanvasStage` background click (deselect) or `ImageBlock` drag does not fire.
- **Suppression:** When `isViewportInteracting` is true, drawing handlers must be ignored/disabled.

### 4. Component Changes
- **PageViewport:** 
  - Wrap `BoardRoot` in `div[data-viewport-transform]`.
  - Apply `transform: translate(x, y) scale(z)`.
  - **Crucial:** `useBoardTransform` relies on `getBoundingClientRect`. Since we transform the parent, the rect changes, and coordinate mapping remains correct automatically.
- **FloatingToolbar:** 
  - Add "Reset View" (100%) button in 'More' menu.
  - Wire up Hand tool button.

## Acceptance Criteria
- [ ] **Hand Tool:** Selecting Hand tool allows 1-finger panning on canvas.
- [ ] **Spacebar:** Holding Space (while not typing) allows panning with mouse/touch.
- [ ] **Zoom:** Mouse wheel zooms centered on cursor.
- [ ] **Tablet:** 
  - 1-finger touch draws ink (Pen tool).
  - 2-finger touch zooms and pans.
- [ ] **Reset:** "Reset View" restores 1.0 zoom and (0,0) pan.
- [ ] **Presentation:** Pan/Zoom works in Presentation mode.
- [ ] **No Gesture Clash:** 2-finger pinch never produces ink strokes.

## Documentation
- Update `v10/AI_READ_ME_MAP.md` after creating `v10/src/features/editor/canvas/viewport/`.
- Update `v10/AI_READ_ME.md` store schema if new UI state is added.

---

## Implementation Log (Codex)
Status: COMPLETED

Changed files:
- v10/src/features/editor/canvas/viewport/useViewportInteraction.ts
- v10/src/features/editor/canvas/CanvasStage.tsx
- v10/src/features/editor/canvas/PageViewport.tsx
- v10/src/features/platform/hooks/useCanvas.ts
- v10/src/features/platform/hooks/useOverlayCanvas.ts
- v10/src/features/chrome/toolbar/FloatingToolbar.tsx
- v10/AI_READ_ME.md
- v10/AI_READ_ME_MAP.md
- codex_tasks/task_060_interactive_viewport.md

Commands run (only if user asked):
- None (not requested)

Manual verification notes:
- Not run (no automated tests). Suggested: hand tool pan, space+drag, wheel zoom anchored on cursor, pinch pan/zoom on tablet, reset view.
