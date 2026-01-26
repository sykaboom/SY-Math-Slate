# Task 012: Overview (Zoom-Out Presentation Mode)

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 011 (Image Object)

## Context
We need an **overview / zoom-out presentation mode** that shows **all pages as one continuous board** (no page boundaries). The goal is to let instructors **replay the whole solution flow at once**. Text/images are read-only in this mode, but **pen/laser remain usable as a temporary overlay** for presentation.

## Goals
1. **Overview Mode:** Toggle a mode that renders **all pages** as one continuous board.
2. **Zoom-Out Control:** Provide zoom controls (overview-only).
3. **Read-Only Content:** Text/Image are non-interactive in overview mode.
4. **Temporary Ink Overlay:** Pen/Laser allowed but **not persisted** (presentation-only).

## Requirements

### 1. Store Update (`useUIStore.ts`)
* **State:**
  * `isOverviewMode: boolean`
  * `overviewZoom: number` (default 0.3~0.5, min 0.2, max 1.0)
  * `overviewViewportRatio: "16:9" | "4:3"`
* **Actions:**
  * `toggleOverviewMode()`
  * `setOverviewZoom(zoom: number)`
  * `setOverviewViewportRatio(ratio: "16:9" | "4:3")`

### 2. Overview Component (`src/components/layout/OverviewStage.tsx`)
* **Structure:** Render **all pages stacked vertically** into a single flow container.
* **No page boundaries** visible, no grid background, no page numbers.
* **Zoom:** Apply CSS `scale()` to the overview container.
* **Interaction:** Text/Image are non-interactive. Pen/Laser remain active, drawn to a **temporary overlay canvas**.
* **Layout (fixed):** 2 rows × N columns, **column-major fill**:
  * page1 (row1,col1), page2 (row2,col1), page3 (row1,col2), page4 (row2,col2), ...
  * CSS grid: `grid-template-rows: repeat(2, auto); grid-auto-flow: column;`
* **Viewport ratio:** Each page frame uses the selected ratio (16:9 or 4:3). Frames are invisible but control layout.
* **Rule:** The viewport ratio applies to **normal mode pages as well** (page sizing is consistent across modes).

### 3. Overlay Ink (Temporary)
* Use a **separate overlay canvas** that is **not persisted**.
* When overview mode exits, **clear overlay**.

### 4. UI Integration (`FloatingToolbar.tsx`)
* Add an **Overview toggle** button.
* When overview is active:
  * Show zoom controls for overview.
  * Disable selection/resize UI for text/image.
  * Viewport ratio selector (16:9 / 4:3).
* **UI safety:** Menus/preview UI must not overlap the canvas content.

## Deliverables
* `src/components/layout/OverviewStage.tsx`
* Updated `useUIStore.ts` (overview state)
* Page layout mapping to preserve **per-page column counts** when composing overview
* Updated canvas handling for **temporary overlay ink**
* Toolbar toggle for Overview mode

## Notes
* Overview is **presentation-only**; ink overlay is not saved.
* This is not a true “infinite canvas.”
