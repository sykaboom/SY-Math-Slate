# Task 009: Text Layer & Layout Engine

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 008 (Content Model)
**Design Reference:** `design_drafts/task_009_typography.html`

## Context
We have the item-based content model (Task 008). Now we need to implement the **Text Layer** to render `TextItem`s and a **Layout Engine** to manage 1-4 column structures. This restores the core "Step-by-Step" lecture flow of the legacy app.

## Goals
1.  **Content Model:** Define `TextItem` structure in `src/types/canvas.ts`.
2.  **View Layer:** Implement `ContentLayer.tsx` to render text blocks *under* the Canvas (ink) layer.
3.  **Layout Engine:** Implement a column-flow layout controlled by `useUIStore` (legacy-style reading order).
4.  **Interaction:** Implement "Next/Prev Step" logic (basic visibility toggle + UI trigger).

## Requirements

### 1. Type Definitions (`src/types/canvas.ts`)
Update `CanvasItem` to include `TextItem`:
```typescript
export interface TextItem extends BaseItem {
  type: 'text';
  content: string; // HTML allowed only if sanitized
  stepIndex: number; // For step-by-step reveal (default 0 if missing)
  layoutMode?: 'flow' | 'absolute'; // default 'flow'
  style?: Record<string, unknown>; // optional CSS overrides
}
// Update CanvasItem union
export type CanvasItem = StrokeItem | TextItem | ...;
```

### 2. Layout & View (`ContentLayer.tsx`)
*   **Z-Index:** Must be `z-10` (Below `CanvasLayer` which is `z-20`).
*   **Flow Layout:** Use CSS columns to preserve top-to-bottom reading order (legacy behavior).
    ```tsx
    <div
      className=\"absolute inset-0 z-10 p-12 text-layer\"
      style={{ columnCount, columnGap: \"3rem\" }}
    >
      {/* Render flow items here */}
    </div>
    ```
    - Each flow item should use `break-inside: avoid`.
*   **Absolute Layout:** Separate layer for `layoutMode === 'absolute'`.
    ```tsx
    <div className=\"absolute inset-0 z-10 pointer-events-none\">
      {/* Render absolute items here */}
    </div>
    ```
*   **Sanitization:** If `content` is HTML, render via `dangerouslySetInnerHTML` **only after sanitizing**.
    - Use DOMPurify (add dependency) or restrict to plain text for this task.
*   **Styling:** Refer to `design_drafts/task_009_typography.html`.
    *   Add `.step-badge`, `.hl-cyan`, `.hl-yellow`, `.prompter-glass` to `globals.css` (Tailwind base layer).

### 3. Store Updates (`useUIStore.ts` & `useCanvasStore.ts`)
*   **UI Store:** Add `columnCount` (1~4) state and actions.
*   **Canvas Store:**
    *   Add `currentStep: number`.
    *   Update `nextStep()` / `prevStep()` actions to increment/decrement `currentStep`.
    *   **Logic:** TextItems with `stepIndex > currentStep` are hidden (`display: none`).
    *   **Bounds:** `currentStep` cannot exceed max `stepIndex` of existing text items.
    *   **Persistence (optional but recommended):** If persisted, add `currentStep` to V2 payload and default to 0 during migration.

### 4. Interaction/UI
*   Add **Next/Prev Step** controls (location: FloatingToolbar, near page controls).
*   Minimum UI: two buttons that call `nextStep()` / `prevStep()`.
*   Column count control may be a small toggle (1–4) or a compact +/− for now.

### 5. Prompter UI (`Prompter.tsx`)
*   **Location:** Fixed at bottom (above toolbar), see Draft.
*   **Content:** Show the plain text content of the *next* available TextItem (stepIndex === currentStep + 1).
*   **Style:** Glassmorphism (`bg-black/60 backdrop-blur-md`).
*   **Sanitize/Strip:** Convert HTML to plain text for preview (strip tags).

## Deliverables
*   Updated `src/types/canvas.ts`.
*   `src/components/canvas/ContentLayer.tsx`.
*   `src/components/layout/Prompter.tsx`.
*   Updated `AppLayout.tsx` (Include ContentLayer & Prompter).
*   `useCanvasStore` updated with step logic.
*   `FloatingToolbar.tsx` updated with Next/Prev Step controls.

## Acceptance Criteria
1.  **Rendering:** Text items appear in columns based on `columnCount`.
2.  **Flow:** Ink (`CanvasLayer`) is drawn ON TOP of text.
3.  **Stepping:** Next/Prev buttons reveal/hide text items by stepIndex.
4.  **Prompter:** Shows preview of the next step.
