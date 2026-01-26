# Task 020: Presentation Mode (Auto Playback UI Separation)

**Status:** COMPLETED
**Priority:** HIGH
**Dependencies:** Task 019 (Playback Controls)

## Context
As we move towards audio/video playback features, mixing editing tools (drag handles, guides, property panels) with playback controls creates a cluttered and unsafe UX. We need a dedicated **Presentation Mode**.

## Goals
1.  **State Separation:** Implement `viewMode: 'edit' | 'presentation'` in `useUIStore`.
2.  **UI Cleanup:** In Presentation Mode, hide all editing affordances (Text Panel, Toolbar, Guides, Resize Handles, Pen/Laser controls).
3.  **Player Bar:** Introduce a dedicated bottom "Player Bar" that persists in Presentation Mode (Seekbar, Play/Pause, Prev/Next, Exit).

## Requirements
### 1. Store & Layout
- Add `viewMode` to `useUIStore` (default: `'edit'`).
- **Edit Mode:** Keep existing behavior (Floating Toolbar, Data Input Panel available).
- **Presentation Mode:**
  - Hide `FloatingToolbar`, `DataInputPanel`, `CanvasGuides`.
  - Disable all `ImageBlock` interactions (drag/resize handles hidden).
  - Disable Pen/Laser drawing input in Presentation Mode.
  - Show `PlayerBar` at the bottom (overlay).
  - Add an explicit "Present" toggle (Edit Mode) to enter Presentation Mode.

### 2. Player Bar Component
- **Location:** Fixed bottom; minimal footprint (pill or slim bar), avoid covering the board center.
- **Controls:**
  - **Progress Bar:** Visualizes current step / total steps.
  - **Transport:** Prev / Play(Pause) / Next.
  - **Exit:** Button to return to Edit Mode.
  - *Future Prep:* Volume slider placeholder, Time display (current / total).

### 3. UX Constraints (Edit Mode)
- Editing UI may overlap slightly but should **minimize board intrusion** for live drawing.
- Assume instructors pause recording when using heavier UI (image insert, panel edits).

## Deliverables
- `src/components/layout/PlayerBar.tsx` (New component).
- `src/components/layout/AppLayout.tsx` (Conditional rendering of toolbars).
- `src/components/canvas/objects/ImageBlock.tsx` (ReadOnly prop or store subscription).
- `src/store/useUIStore.ts` (State update).

## Scope (touched files)
- `v10/src/store/useUIStore.ts`
- `v10/src/components/layout/AppLayout.tsx`
- `v10/src/components/layout/PlayerBar.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/canvas/CanvasGuides.tsx`
- `v10/src/components/canvas/CanvasLayer.tsx`
- `v10/src/components/canvas/CanvasStage.tsx`

## Acceptance Criteria
1.  Clicking a "Present" toggle switches the UI to Presentation Mode.
2.  In Presentation Mode, I cannot drag images, see resize handles, or draw with pen/laser.
3.  The Player Bar appears and controls step playback (Prev/Play/Next).
4.  I can exit Presentation Mode to return to the editor.

## Manual Verification
1) Enter Presentation Mode and confirm toolbars/panels are hidden.  
2) Try drawing or dragging images; both must be disabled.  
3) Use Player Bar to navigate steps; exit back to edit mode.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/store/useUIStore.ts`
- `v10/src/components/layout/AppLayout.tsx`
- `v10/src/components/layout/PlayerBar.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/canvas/CanvasGuides.tsx`
- `v10/src/components/canvas/CanvasLayer.tsx`
- `v10/src/components/canvas/CanvasStage.tsx`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions).
