# Task 004: Canvas Engine Migration (React Hook)

**Status:** COMPLETED
**Priority:** CRITICAL
**Assignee:** Codex CLI
**Dependencies:** Task 003 (UI Completed)

## Context
The core drawing logic currently resides in the monolithic `main.js`. We need to migrate this to a highly performant **React Custom Hook (`useCanvas`)**. Additionally, we must connect the disconnected UI controls (Pen/Laser types) to the global store so the canvas engine can access them.

## Goals
1.  **Store Refactoring:** Move local states from `PenControls`/`LaserControls` to `useUIStore`.
2.  **Engine Porting:** Port the `handlePointer*` and `renderCanvas` logic to `src/hooks/useCanvas.ts`.
3.  **Component:** Implement `CanvasLayer.tsx`.

## Requirements

### 1. Store Expansion (`useUIStore.ts`)
*   **Action:** Update the store to hold all drawing parameters.
*   **New State Properties:**
    *   `penType`: 'ink' | 'pencil' | 'highlighter'
    *   `penOpacity`: number (0-100)
    *   `laserType`: 'standard' | 'highlighter'
    *   `laserColor`: string
*   **Update Components:** Refactor `PenControls.tsx` and `LaserControls.tsx` to remove their internal `useState` and use the store instead.

### 2. Data Structure (Zustand & Refs)
*   **Store (`useCanvasStore.ts`):**
    *   State: `strokes` (Array of objects), `currentStroke` (Temporary).
    *   Actions: `addStroke`, `undo`, `clear`.
*   **Refs (Inside Hook):**
    *   `canvasRef`, `ctxRef`, `isDrawingRef`, `pointsRef`.

### 3. `useCanvas` Hook Logic (`src/hooks/useCanvas.ts`)
*   **Dependencies:** Should subscribe to `useUIStore` to get current tool, color, and type.
*   **Input Handling:**
    *   Port `handlePointerDown`, `handlePointerMove`, `handlePointerUp`.
    *   **Crucial:** Use `e.getCoalescedEvents()` for smooth curves.
    *   Implement the smoothing algorithm (Simple Moving Average or Catmull-Rom).
*   **Rendering:**
    *   Port `drawStoredStroke` and `renderAll`.
    *   **Performance:** Do NOT use React state for the active drawing path. Draw directly to the 2D context.

### 4. Component Implementation (`CanvasLayer.tsx`)
*   **Location:** `src/components/canvas/CanvasLayer.tsx`.
*   **Z-Index:** Must be positioned correctly in `AppLayout` (behind text, above background).
*   **Resize Observer:** Auto-resize canvas on window change and call `renderAll`.

## Migration Steps (Codex Guide)
1.  **Step 1 (Store):** Update `useUIStore.ts` and refactor the Control components.
2.  **Step 2 (Logic):** Create `useCanvasStore.ts` and `useCanvas.ts`.
3.  **Step 3 (View):** Create `CanvasLayer.tsx` and mount it in `AppLayout.tsx`.

## Deliverables
*   Updated `useUIStore.ts` & Control components.
*   `src/hooks/useCanvas.ts` (The Engine).
*   `src/components/canvas/CanvasLayer.tsx` (The View).
