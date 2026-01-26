# Task 014: Text Editing UI (Core)

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 009 (Text Layer), Task 010 (MathJax), Task 012.5 (BoardSpec), Task 013 (Animation)
**Design Reference:** `design_drafts/task_014_text_editing.html`

## Context
Currently, text items are read-only. We need a way to create, edit, and format text directly on the canvas. This task implements the "Text Editing" mode with a contextual bubble toolbar. The editing flow must respect **BoardSpec coordinates** and be safe on **touch devices**.

## Goals
1.  **Interaction:** Text tool-based create/edit. Double-click desktop optional.
2.  **Editor UI:** Implement `TextEditor` component with a Bubble Toolbar (Bold, Color, Math).
3.  **State:** Manage `editingItemId` in `useUIStore`.
4.  **Safety:** Disable drawing tools while editing, and suppress animation sequences.

## Requirements

### 1. Store Updates (`useUIStore.ts`)
*   **State:** `editingItemId: string | null`.
*   **Action:** `setEditingItem(id: string | null)`.
*   **Interaction:** When `editingItemId` is set, lock drawing inputs and disable auto-play (no animation sequence).

### 2. Text Creation (Canvas Interaction)
*   **Primary Trigger (Touch-safe):** `activeTool === "text"` and **tap** on canvas background.
*   **Desktop Convenience:** Double-click on canvas background also creates text (optional).
*   **Logic:**
    *   Get click coordinates (**Board Space**) via `useBoardTransform`.
    *   Create new `TextItem` with empty content.
    *   Set `editingItemId` to new item ID.
    *   *Note:* Handle "Flow" vs "Absolute" mode. Default to "Absolute" for click-to-create.
*   **Defaults:** `style = { fontSize: "28px", color: "#ffffff" }`, `stepIndex = currentStep`.

### 3. Text Editor Component (`src/components/canvas/editing/TextEditor.tsx`)
*   **Behavior:**
    *   Rendered *instead* of `MathTextBlock` when `item.id === editingItemId`.
    *   Use `contentEditable` div.
    *   **Auto-focus** on mount.
    *   **Blur:** `onBlur` -> save content to `useCanvasStore`, clear `editingItemId`.
    *   **Escape:** cancel edit (restore previous content).
    *   **Enter:** insert newline (no auto-save).
*   **Bubble Toolbar:**
    *   **Reference:** See `design_drafts/task_014_text_editing.html`.
    *   **Buttons:**
        *   **Bold/Italic:** `document.execCommand` (or safer alternative).
        *   **Color:** Toggle predefined colors (White/Yellow/Cyan).
        *   **Size:** Cycle font sizes (sm/md/lg).
        *   **Math:** Insert `$$ $$` at cursor.
        *   **Delete:** Remove item.
*   **Sanitize:** Save content via DOMPurify (allow basic tags: `b`, `i`, `br`, `span`).

### 4. Integration (`ContentLayer.tsx`)
*   Update the mapping loop:
    ```tsx
    if (item.id === editingItemId) {
      return <TextEditor item={item} />;
    } else {
      return <MathTextBlock ... onClick={() => setEditingItem(item.id)} />;
    }
    ```
*   Only enable editing if `activeTool === "text"` (to avoid accidental edits during pen usage).
*   In Overview mode, editing is disabled.

## Deliverables
*   `src/components/canvas/editing/TextEditor.tsx`.
*   `src/components/canvas/editing/BubbleToolbar.tsx`.
*   Updated `ContentLayer.tsx` and `useUIStore.ts`.
*   Verified: Double-click creates text, clicking outside saves it.

## Acceptance Criteria
1.  **Creation:** Text tool + tap (or desktop double-click) spawns a text box.
2.  **Editing:** Clicking existing text while Text tool is active enables editing mode.
3.  **Toolbar:** Bubble menu appears above text while editing.
4.  **Math:** Typing `$$ x $$` and clicking outside renders MathJax correctly.
5.  **Touch Safe:** On tablets, single tap with Text tool works; no double-click required.
