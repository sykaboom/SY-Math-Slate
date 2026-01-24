# Task 006: File System (.slate ZIP) & Navigation UI

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 005 (Store Refactor)

## Context
We need a portable file format (`.slate`) to save user work. Also, since we introduced a multi-page store in Task 005, we must expose **Page Navigation Controls** in the UI so users can create and move between pages before saving them.

## Goals
1.  **UI Update:** Add Page Navigation (Prev, Next, Indicator) to the Toolbar.
2.  **File System:** Implement `saveAsSlate()` (Export) and `loadFromSlate()` (Import) using `jszip`.
3.  **Format:** Define and strictly follow the `.slate` ZIP structure.

## Requirements

### 1. Page Navigation UI (`FloatingToolbar.tsx`)
*   **Location:** Add a section (left or right side) to the existing toolbar.
*   **Components:**
    *   `Button`: ChevronLeft (Prev)
    *   `Span`: "Page {current} / {total}"
    *   `Button`: ChevronRight (Next - creates new page if last)
*   **Logic:** Connect to `useCanvasStore` actions (`prevPage`, `nextPage`).

### 2. File Structure (`.slate`)
ZIP archive containing:
```text
/manifest.json       # { version: "1.0", createdAt: ISOString, title: "..." }
/board.json          # { pages: Record<...>, pageOrder: [...] }
/preview.png         # (Future implementation)
/assets/             # (Future implementation)
```

### 3. Export Implementation (`useFileIO.ts`)
*   **Library:** `npm install jszip file-saver` (and types).
*   **Hook:** `useFileIO()`
    *   `exportSlate()`:
        1.  Collect data from `useCanvasStore`.
        2.  Build ZIP with `board.json` and `manifest.json`.
        3.  Trigger download via `file-saver`.

### 4. Import Implementation
*   **UI:** Add "Open" (FolderOpen) and "Save" (Download) buttons to the toolbar (distinct from the Quick Save).
*   **Hook:** `importSlate(file)`:
    1.  Unzip file.
    2.  Parse `board.json`.
    3.  Validate structure (check for `pages` and `pageOrder`).
    4.  Update store: `useCanvasStore.setState({ ...parsedData })`.

## Deliverables
*   `src/hooks/useFileIO.ts`.
*   Updated `FloatingToolbar.tsx` with **Page Nav** and **File I/O** buttons.
*   Working `.slate` file generation and loading.

## Notes
*   **UX:** When clicking "Next" on the last page, it should automatically create a new blank page (Standard whiteboard behavior). Ensure `useCanvasStore.nextPage()` handles this or update the store logic if needed.
