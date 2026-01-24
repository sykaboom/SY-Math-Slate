# Task 004.5: Canvas UX Polishing & Layering Fixes

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 004 (Canvas Engine)

## Context
User clarified that **Ink must be drawn ON TOP of the content**. This creates an interaction conflict: a full-screen canvas on top blocks clicks to underlying buttons or text. We must toggle pointer events based on the active tool.

## Goals
1.  **Fix Layering:** Position `CanvasLayer` above the content but below the Toolbar/Floating UI.
2.  **Dynamic Input:** Toggle `pointer-events` on the canvas based on `activeTool`.
3.  **Smart Defaults:** Implement auto-configuration when switching Pen/Laser types.

## Requirements

### 1. Canvas Layering & Interaction (`CanvasLayer.tsx`)
*   **Z-Index:** Ensure Canvas is `z-20` (or similar), sitting **above** the main content (`z-10`) but **below** the Header/Toolbar (`z-40`, `z-50`).
*   **Dynamic Pointer Events:**
    *   Subscribe to `useUIStore.activeTool`.
    *   Logic:
        ```tsx
        const { activeTool } = useUIStore();
        const isDrawingMode = ['pen', 'eraser', 'laser'].includes(activeTool);
        // ...
        <canvas className={cn(..., isDrawingMode ? 'pointer-events-auto' : 'pointer-events-none')} />
        ```
    *   This ensures users can click buttons/text when in 'Hand' or 'Text' mode, but draw freely in 'Pen' mode.

### 2. Smart Tool Switching (`useUIStore.ts`)
*   **Requirement:** When `setPenType` or `setLaserType` is called, update related properties automatically to match legacy behavior.
*   **Logic:**
    *   **Fountain (Ink):** Width = 3, Opacity = 100, Color = White (if not set).
    *   **Pencil:** Width = 2, Opacity = 80, Color = '#cccccc'.
    *   **Highlighter:** Width = 20, Opacity = 30, Color = '#FFFF00'.
    *   *Laser Standard:* Width = 10, Color = Red.
    *   *Laser Highlighter:* Width = 40, Color = Yellow.
*   **Implementation:** Update store actions to batch these state changes.

### 3. Layout Cleanup (`AppLayout.tsx`)
*   Remove any `pointer-events-none` hacks from the content container if they were added. The control should be managed solely by the Canvas layer's presence.

## Deliverables
*   Updated `CanvasLayer.tsx` with dynamic class logic.
*   Updated `useUIStore.ts` with smart actions.
*   Verified:
    *   Pen Mode -> Draws on top of text.
    *   Hand Mode -> Can select text or click underlying buttons.
