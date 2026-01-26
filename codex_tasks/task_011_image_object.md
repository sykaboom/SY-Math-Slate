# Task 011: Image Object & Manipulation

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 010 (MathJax - finished or parallel), Task 008 (Content Model)
**Design Reference:** `design_drafts/task_011_image_handles.html`

## Context
We need to allow users to insert images (e.g., problem sets, diagrams) onto the canvas and manipulate them (move, resize, rotate). We will implement a custom manipulation layer to avoid heavy dependencies.

**Layering rule (fixed):** Pen/Laser must always be the topmost layer.
**Flow rule (fixed):** Images must not overlap text; treat images as flow objects like text.

## Goals
1.  **Content Model:** Extend `ImageItem` as needed (no overlap with text).
2.  **View Layer:** Render images within the flow layout (same column system as text).
3.  **Interaction:** Implement Resize, Invert, Selection, and Flow order changes.
4.  **File Input:** Implement Drag & Drop onto the canvas to spawn images.

## Requirements

### 1. Store Updates (`useCanvasStore.ts` & `useUIStore.ts`)
*   **Selection State:** Add `selectedItemId: string | null` to `useCanvasStore`.
*   **Actions:**
    *   `selectItem(id: string | null)`
    *   `updateItem(id: string, partial: Partial<CanvasItem>)`
    *   `deleteItem(id: string)`
    *   `bringToFront(id: string)`, `sendToBack(id: string)`
    *   `addItem(item: CanvasItem)`
*   **Image item fields (confirm):** add `isInverted?: boolean` (or `style?.invert` if style map is introduced for images).

### 2. Flow Rendering (within `ContentLayer`)
* **Rule:** Images are flow objects like text; they must not overlap text.
* **Rendering:** In the flow container, render image items **in order** alongside text items.
* **Layering:** Content (text+image) stays below `CanvasLayer`; pen/laser is always top.
* **Component:** `<ImageBlock item={item} isSelected={selectedId === item.id} />`

### 3. Image Block Component (`ImageBlock.tsx`)
*   **Visuals:** Match `design_drafts/task_011_image_handles.html`.
    *   Handles (TL, TR, BL, BR) + Rotation Stick.
    *   Context Toolbar (Invert, Layer, Delete).
*   **Logic (Custom Hook `useTransform`):**
    *   **Resize:** On pointer down on handles -> calculate new `w, h` (Maintain aspect ratio by default).
    *   **Move:** Reorder within flow using layer up/down actions.
*   **Invert:** Toggle CSS `filter: invert(1)` via `item.isInverted` (preferred).
*   **Rotate:** Deferred (requires non-overlapping layout guarantees).

### 4. File Input (Drag & Drop)
*   **Global Drop Zone:** Add `onDrop` / `onDragOver` to `main` in `AppLayout`.
*   **Handler:**
    1.  Prevent default.
    2.  Get `e.dataTransfer.files[0]`.
    3.  Create `Blob` / `Object URL`.
    4.  Create `ImageItem`:
        *   `type: 'image'`
        *   `src`: The Object URL.
        *   `w, h`: Load image in background to get natural dimensions, then scale to fit viewport if needed.
    5.  `addStroke` (rename to `addItem`) to store.

**Note:** `AppLayout` is a server component → the drop zone must be a client wrapper (e.g., `CanvasDropZone`) to avoid converting the whole layout to client.

### 5. Clipboard Paste (Required)
* **Desktop:** `Ctrl+V` image paste should insert an image item.
* **Tablet Helper:** Provide a paste helper modal with a contenteditable box for long-press paste.

### 5. Local Auto-Save (Important)
* Images **must be excluded** from local auto-save (localStorage).
* Show a warning once when manual save occurs with images present:\n  \"이미지 항목은 로컬 자동복구에 저장되지 않습니다. .slate로 저장해 주세요.\"

### 6. Data Persistence (File IO)
*   **Export (.slate):**
    *   We need to store the actual image data, not just the blob URL.
    *   **Strategy:** In `useFileIO.exportSlate`, fetch the blob from the URL, add to ZIP `assets/`, update `board.json` to reference `assets/img.webp`.
*   **Import:**
    *   Unzip `assets/`.
    *   Create Object URLs for each asset.
    *   Update `board.json` items to point to these new URLs.

## Deliverables
*   `src/components/canvas/CanvasStage.tsx` (Drop Zone + selection clearing).
*   `src/components/canvas/objects/ImageBlock.tsx`.
*   Updated `ContentLayer.tsx` (Flow render for images).
*   Updated `useCanvasStore.ts` (Selection & Item Actions).
*   Updated `useFileIO.ts` (Asset handling).

## Acceptance Criteria
1.  **Drop:** Dropping an image file creates an image on the canvas.
2.  **Select:** Clicking an image shows handles. Clicking background deselects.
3.  **Manipulate:** Can move, resize (aspect locked), and rotate.
4.  **Save/Load:** Images persist correctly in `.slate` files.
