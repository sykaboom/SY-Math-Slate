# Task 008: Content Model Migration (V2 Structure)

**Status:** COMPLETED
**Priority:** CRITICAL
**Assignee:** Codex CLI
**Dependencies:** Task 007.5 (Stability)

## Context
Currently, the `useCanvasStore` manages pages as `Stroke[]`. To support Text/Images/Math, we must migrate to a unified **Item-Based Model** (`CanvasItem[]`). This involves breaking changes, requiring strict versioning and a centralized type definition.

## Goals
1.  **Define SSOT Types:** Create `src/types/canvas.ts` as the central type definition.
2.  **Centralize Migration:** Create `src/lib/migration.ts` for V1 -> V2 conversion.
3.  **Migrate Stores:** Update `useCanvasStore` AND `useUIStore` to use the new types.
4.  **Refactor Render:** Update `useCanvas` to filter/render strokes.

## Requirements

### 1. Type Definitions (`src/types/canvas.ts`)
*   **Action:** This file becomes the Single Source of Truth.
*   **Definitions:**
    ```typescript
    export type ItemType = 'stroke' | 'text' | 'image' | 'math' | 'unknown'; 
    export type PenType = 'ink' | 'pencil' | 'highlighter';

    // Reusable Point type (aligned with legacy)
    export interface Point {
      x: number;
      y: number;
      p?: number; // Pressure (optional)
      t?: number; // Timestamp (optional)
    }

    export interface BaseItem {
      id: string;
      type: ItemType;
      x: number;
      y: number;
      rotation?: number;
      scale?: number;
      opacity?: number;
      zIndex: number;
    }

    export interface StrokeItem extends BaseItem {
      type: 'stroke';
      path: Point[]; 
      color: string;
      width: number;
      penType: PenType;
    }
    
    // Forward compatibility
    export interface UnknownItem extends BaseItem {
      type: 'unknown';
      raw?: Record<string, unknown>;
    }

    // Placeholders
    export interface TextItem extends BaseItem { type: 'text'; content: string; }
    export interface ImageItem extends BaseItem { type: 'image'; src: string; w: number; h: number; }
    export interface MathItem extends BaseItem { type: 'math'; latex: string; }

    // Strict Union
    export type CanvasItem = StrokeItem | TextItem | ImageItem | MathItem | UnknownItem;

    export interface PersistedCanvasV2 {
      version: 2;
      pages: Record<string, CanvasItem[]>;
      pageOrder: string[];
      currentPageId: string;
    }
    ```

### 2. Migration Logic (`src/lib/migration.ts`)
*   **Function:** `migrateToV2(data: unknown): PersistedCanvasV2`
*   **Role:** Must replace and **preserve all safety logic** from `normalizeBoardData` (Task 007.5).
*   **Logic:**
    *   **Version Check:** If `version === 2`, validate structure. Preserve `UnknownItem`.
        *   For unknown items missing required fields (`id`, `x`, `y`, `zIndex`), fill safe defaults:
            *   `id`: `crypto.randomUUID()`
            *   `x`: 0, `y`: 0, `zIndex`: 0
    *   **V1 Migration:** If `version === 1` or missing:
        *   Convert `Stroke` -> `StrokeItem`:
            *   `penType`: Use existing if present. If missing, infer: `(alpha ?? 1) < 0.4` ? 'highlighter' : 'ink'.
            *   `x`: 0, `y`: 0, `zIndex`: array index.
            *   `id`: `crypto.randomUUID()`.
    *   **Stability Guard (CRITICAL):** 
        *   Recover orphaned pages (keys in `pages` but missing from `pageOrder`).
        *   Filter out invalid items (e.g. strokes with empty paths).

### 3. Store Updates
*   **`useCanvasStore.ts`:**
    *   State: `pages: Record<string, CanvasItem[]>`.
    *   Actions: Update `addStroke` to create valid `StrokeItem`.
    *   Import types from `src/types/canvas.ts`.
*   **`useUIStore.ts`:**
    *   Import `PenType` from `src/types/canvas.ts`.
    *   Ensure type consistency.

### 4. File I/O Updates (`useFileIO.ts` & `usePersistence.ts`)
*   Use `migrateToV2` for both LocalStorage load and .slate import.
*   Update `exportSlate`: Include `version: 2` in the JSON output.

### 5. Canvas Engine Update
*   `useCanvas.ts`: Filter `items.filter((i): i is StrokeItem => i.type === 'stroke')` before drawing.

## Acceptance Criteria
1.  **SSOT:** No duplicate type definitions in stores.
2.  **Migration:** Old V1 data loads correctly; strokes have correct types; orphaned pages are recovered.
3.  **Forward Compat:** Future/Unknown types are preserved.
4.  **Render:** Strokes appear correctly.

## Touched Files
*   `src/types/canvas.ts` (New)
*   `src/lib/migration.ts` (New)
*   `src/store/useCanvasStore.ts`
*   `src/store/useUIStore.ts`
*   `src/hooks/useCanvas.ts`
*   `src/hooks/useFileIO.ts`
*   `src/hooks/usePersistence.ts`
