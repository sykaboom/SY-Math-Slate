# Task 015: Data Input Panel (Block Management)

**Status:** COMPLETED
**Priority:** CRITICAL
**Assignee:** Codex CLI
**Dependencies:** Task 014 (Text Editing - to be superseded)

## Context
Direct canvas text editing is inefficient for tablet users and bulk data entry (AI workflows). We need to revert to the legacy-style "Data Input Panel" where users paste text, and the system automatically splits it into blocks (steps) based on line breaks.

## Goals
1.  **UI:** Implement a right-side panel for text input & block management (tablet-friendly).
2.  **Logic:** Parse input text (newline = new block) and sync with `TextItem`s in the store.
3.  **UX:** Replace the current 'Text Tool' behavior with opening this panel.

## Requirements

### 1. Store Updates (`useCanvasStore.ts` & `useUIStore.ts`)
*   **UI Store:** Add `isDataInputOpen: boolean` state and toggle actions.
*   **Canvas Store Action:** `importTextBlocks(text: string)`
    *   Split text by `\n`.
    *   Create `TextItem` for each line.
    *   Assign `stepIndex` sequentially (0, 1, 2...).
    *   Set layout mode to `'flow'` automatically.
    *   Empty lines should be preserved as blank blocks using `&nbsp;`.
    *   Apply behavior: **replace only the current page's flow text items**. Preserve images, strokes, and absolute-positioned text.

### 2. Data Input Panel (`src/components/layout/DataInputPanel.tsx`)
*   **Trigger:** Toolbar 'Text' button opens this panel.
*   **Layout:**
    *   **Right side panel:** Large `textarea` for raw input.
    *   **Below input:** Preview list of generated blocks.
    *   **Footer:** "Apply to Canvas" button.
*   **Block List:** Allow reordering (drag handle) and deletion of blocks.

### 3. Workflow Change
*   **Disable:** Direct canvas text creation (remove/hide the `TextEditor` creation-on-click logic).
*   **Edit:** Clicking the toolbar 'Text' opens the panel. No auto-open on block click in this task.

### 4. Block Styling (Minimal)
*   Inside the panel's block list, provide simple buttons for each row:
    *   `$$`: Wrap **selection** in MathJax delimiters.
    *   `HL`: Wrap **selection** in `<span class="hl-yellow">`.

## Deliverables
*   `v10/src/components/layout/DataInputPanel.tsx`.
*   `v10/src/components/layout/AppLayout.tsx` (mount panel).
*   `v10/src/components/toolbar/FloatingToolbar.tsx` (Text button opens panel).
*   `v10/src/store/useCanvasStore.ts` (Import logic).
*   `v10/src/store/useUIStore.ts` (panel state).
*   `v10/src/components/canvas/CanvasStage.tsx` (remove text-create-on-click).

## Scope (touched files)
- `v10/src/components/layout/DataInputPanel.tsx`
- `v10/src/components/layout/AppLayout.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/store/useCanvasStore.ts`
- `v10/src/store/useUIStore.ts`
- `v10/src/components/canvas/CanvasStage.tsx`

## Acceptance Criteria
1.  Clicking 'Text' tool opens the right-side panel.
2.  Pasting 5 lines of text creates 5 distinct flow TextItems on the current page.
3.  Empty lines are preserved as visual blank lines.
4.  Apply replaces only flow text items on the current page; strokes/images/absolute text remain.
5.  Blocks flow correctly in the column layout.

## Closeout
- **Changed files:**
  - `v10/src/components/layout/DataInputPanel.tsx`
  - `v10/src/components/layout/AppLayout.tsx`
  - `v10/src/components/toolbar/FloatingToolbar.tsx`
  - `v10/src/store/useCanvasStore.ts`
  - `v10/src/store/useUIStore.ts`
  - `v10/src/components/canvas/CanvasStage.tsx`
- **Commands run:** none
- **Manual verification:** not run (not requested).

## Hotfix Notes
- Fix: selection-based HL/$$ now preserves selection and applies correctly within blocks.
- Files: `v10/src/components/layout/DataInputPanel.tsx`
