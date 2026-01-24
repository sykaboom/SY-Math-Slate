# Task 007.5: Stability & Data Integrity Fixes

**Status:** COMPLETED
**Priority:** CRITICAL
**Assignee:** Codex CLI
**Dependencies:** Task 006 (File IO)

## Context
Recent code reviews identified critical risks in data persistence and file I/O logic. Specifically, page data could be lost if `pageOrder` is desyncing, and saving failures might go unnoticed. We need to harden the `useFileIO` and `usePersistence` hooks BEFORE refactoring the UI.

## Goals
1.  **Data Integrity:** Ensure no "orphaned pages" are lost during import/load.
2.  **Error Handling:** Provide feedback (console/alert for now) when auto-save or export fails.
3.  **Security:** Add basic safeguards against ZIP bombs or oversized files.
4.  **Type Safety:** Strengthen JSON validation logic.

## Requirements

### 1. Data Integrity (`useFileIO.ts` / `useCanvasStore.ts`)
*   **Orphaned Page Recovery:**
    *   In `normalizeBoardData`, if `pages` contains keys not in `pageOrder`, **append them to `pageOrder`** instead of discarding them.
    *   Log a warning if this recovery happens.
*   **Stroke Validation:**
    *   Add a helper `isValidStroke(stroke)` that checks if `stroke.path` is an array and not empty. Filter out corrupt strokes during import.

### 2. Error Feedback (`usePersistence.ts`)
*   **Issue:** `saveSnapshot` failures in `useEffect` are currently swallowed.
*   **Fix:**
    *   Add a `saveStatus` state ('idle', 'saving', 'error') to the hook/store.
    *   Since UI refactoring is later, use simple `window.alert` or `console.error` for critical failures, or update a small status text in the current Toolbar if easy.

### 3. ZIP Import Hardening (`useFileIO.ts`)
*   **Size Limit:** Check `file.size` before processing. Reject files > 50MB (configurable).
*   **Entry Limit:** When iterating ZIP entries, throw error if entry count > 1000 (ZIP bomb protection).

### 4. Cleanup
*   Remove any leftover `console.log` debugging statements in `FloatingToolbar` or hooks, as per the Blueprint.

## Deliverables
*   Hardened `useFileIO.ts` and `usePersistence.ts`.
*   Visible error feedback mechanism (Basic).
*   Tests cases (manual verification steps):
    *   Import a corrupted JSON (missing pageOrder) -> Should recover pages.
    *   Import a 100MB file -> Should reject.
