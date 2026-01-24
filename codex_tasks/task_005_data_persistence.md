# Task 005: Data Persistence & Store Expansion

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 004.5 (Canvas Polish)

## Context
Currently, the canvas state (`strokes`) is ephemeral and single-page only. To support the "Math Slate" vision, we need to restructure the store to support multiple pages (Board > Pages) and persist this data to LocalStorage. We also prepare the DB layer (Prisma) for future sync.

## Goals
1.  **Refactor Store:** Update `useCanvasStore` to support a Multi-Page structure (`pages: Record<id, strokes>`).
2.  **Local Persistence:** Implement auto-save/load to `localStorage` with basic schema validation.
3.  **DB Prep:** Define Prisma Schema and initialize the Singleton Client.

## Requirements

### 1. Store Refactoring (`useCanvasStore.ts`)
*   **State Structure Update:**
    *   `strokes`: Remove this flat array.
    *   `pages`: `Record<string, Stroke[]>` (Map pageId to strokes).
    *   `pageOrder`: `string[]` (Array of pageIds).
    *   `currentPageId`: `string`.
*   **Actions:**
    *   `addStroke(stroke)`: Adds to the *current page's* array.
    *   `nextPage()`, `prevPage()`: Switch `currentPageId`. Create new page if next doesn't exist.
*   **Impact:** Update `useCanvas.ts` to read strokes from `pages[currentPageId]`.

### 2. Local Persistence (`usePersistence.ts`)
*   **Hook Logic:**
    *   Watch `useCanvasStore` state changes.
    *   Debounce `localStorage.setItem('v10_board_data', JSON.stringify(data))`.
    *   On mount, `localStorage.getItem(...)`.
    *   **Validation:** Check if parsed data has `pages` and `pageOrder`. If invalid/missing, initialize with defaults.
*   **UI Trigger:** Update the "Save" button in `FloatingToolbar` to trigger a manual save toast (or rely on auto-save).

### 3. Prisma Schema & Client (`v10/src/lib/prisma.ts`)
*   **Schema (`schema.prisma`):**
    ```prisma
    model Board {
      id        String   @id @default(uuid())
      title     String   @default("Untitled Board")
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      pages     Page[]
    }

    model Page {
      id        String   @id @default(uuid())
      boardId   String
      board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
      order     Int
      content   String   // JSON blob of Stroke[]
      
      @@unique([boardId, order]) // Ensure unique page order per board
    }
    ```
*   **Singleton Client (`src/lib/prisma.ts`):**
    *   Standard Next.js + Prisma Singleton pattern (to avoid connection exhaustion in dev).

## Deliverables
*   Updated `useCanvasStore.ts` (Multi-page ready).
*   Updated `useCanvas.ts` (Compiles without error).
*   New `src/hooks/usePersistence.ts`.
*   New `src/lib/prisma.ts` & updated `schema.prisma`.
*   Run `npx prisma generate` inside `v10/`.

## Risk Management
*   **Breaking Change:** Changing `strokes` to `pages` will break `CanvasLayer` rendering loop. Ensure `useCanvas` is updated to pull the correct array.
*   **Hydration Mismatch:** When loading from LocalStorage, ensure Zustand doesn't cause React Hydration errors (use `useEffect` for loading).
