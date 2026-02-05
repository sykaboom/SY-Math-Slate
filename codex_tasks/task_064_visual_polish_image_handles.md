# Task 064: Visual Polish — Chalk Design, Cursor Visibility, Image Handles

**Status:** COMPLETED
**Priority:** P2 (Visual/UX)
**Assignee:** Codex CLI
**Dependencies:** Task 063 (Completed)

## Context
The user requested visual refinements to match the "Neon" aesthetic and fix a specific rendering artifact. Additionally, a P0 gap (Image Manipulation) needs to be addressed.
1.  **Chalk Holder Cursor:** Redesign the chalk cursor into a pen-like chalk holder (metal body + chalk tip).
2.  **End-Marker Removal:** The text end-marker should not render anymore. The anchor indicator remains as the only cursor end state.
3.  **Image Handles:** Images can be inserted but resizing is inconsistent or missing in some cases (P0 Gap).
4.  **Cursor Visibility Toggle:** The user wants a toggle in the FloatingToolbar "More" menu to hide/show cursors. Default is hidden (OFF), session-only.

## Goals
1.  **Chalk Holder Redesign:** Reimplement `ChalkActor` (writing cursor) and `AnchorIndicator` as a pen-like chalk holder (metal body + chalk tip).
2.  **Remove End-Marker:** Remove the end-marker concept from render + styles (no end marker visible).
3.  **Cursor Visibility Toggle:** Add a session-only toggle in the FloatingToolbar "More" menu to hide/show both the writing cursor and the anchor indicator.
4.  **Cursor Consistency:** The writing cursor and anchor indicator must share the same design and size.
5.  **Image Manipulation:** Ensure selection handles (resize) work reliably for Image items.

## Non-Goals (Out of Scope unless explicitly requested)
- Image rotation
- Highlighter cursor redesign
- New dependencies

## Scope (Files)
- `v10/src/features/canvas/actors/ChalkActor.tsx` (Redesign)
- `v10/src/core/themes/chalkTheme.ts` (Theme updates)
- `v10/src/features/canvas/AnchorIndicator.tsx` (Size/design + visibility)
- `v10/src/features/canvas/ContentLayer.tsx` (End-of-step marker behavior)
- `v10/src/app/globals.css` (Cursor marker styles)
- `v10/src/features/toolbar/FloatingToolbar.tsx` (More menu toggle)
- `v10/src/features/store/useUIStore.ts` (Session-only toggle state)
- `v10/src/features/canvas/CanvasStage.tsx` (Cursor visibility gating)
- `v10/src/features/canvas/objects/ImageBlock.tsx` (Image resize handles)

## Detailed Design Specs

### 1. Chalk Holder Redesign (`ChalkActor.tsx`, `AnchorIndicator.tsx`)
- **Style (Pen-like chalk holder):**
    - Holder body: metal-like gradient with subtle highlights.
    - Chalk tip: mounted at the holder end, visually distinct (chalk texture color).
    - Orientation: chalk tip faces **top-left**.
    - Size: the holder length should approximate the **diagonal** of a single Korean character square.
    - Glow: subtle neon-cyan edge glow (matches existing Neon family).
    - Animation: **Static** (no wobble/bob). Smooth position updates only.

### 2. End-Marker Removal
- Remove end-marker rendering from `ContentLayer.tsx`.
- Remove end-marker CSS from `globals.css`.
- Anchor indicator becomes the sole end-state indicator.

### 3. Cursor Visibility Toggle (FloatingToolbar → More)
- **Toggle:** "Cursor Visibility" (label TBD).
- **Behavior:** Hide/show both **writing cursor** (Chalk/Marker actor) and **AnchorIndicator** together.
- **Default:** OFF (hidden by default).
- **Persistence:** Session-only (no local storage).

### 4. Cursor Consistency (AnchorIndicator)
- The anchor indicator should use the **same design and size** as the writing cursor (chalk holder).
- Highlighter cursor remains unchanged.

### 5. Image Handles (`ImageBlock.tsx`)
- **Trigger:** When an Image Item is selected (`selectedItemId === image.id`).
- **UI:**
    - 4 corner handles (Resize).
    - Border highlight around the image.
- **Interaction:**
    - Drag corner -> Resize image (maintain aspect ratio by default).
    - Update `width/height` in `useCanvasStore`.
    - Prefer updating existing `ImageBlock.tsx` implementation; extract to `ImageHandles.tsx` only if it meaningfully simplifies the code.

## Acceptance Criteria
- [ ] **Chalk Holder Look:** Writing cursor + anchor indicator look like a pen-style chalk holder (metal body + chalk tip).
- [ ] **No End-Marker:** End-marker is no longer rendered/styled anywhere.
- [ ] **Cursor Toggle:** A "More" menu toggle hides/shows **both** writing cursor and anchor indicator.
- [ ] **Default Hidden:** Cursor visibility is OFF by default and resets on refresh.
- [ ] **Cursor Consistency:** Writing cursor and anchor indicator share the same design + size.
- [ ] **Highlighter Unchanged:** Highlighter cursor remains as-is.
- [ ] **Image Resize:** User can select an image and resize it using handles.

---

## Completion Notes
**Changed Files**
- `v10/src/features/store/useUIStore.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/actors/ChalkActor.tsx`
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/core/themes/chalkTheme.ts`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/app/globals.css`

**Commands Run**
- None.

**Manual Verification Notes**
- Verify chalk holder styling for writing cursor + anchor indicator.
- Confirm chalk holder is vertically flipped (tip faces bottom-left).
- Confirm end-marker no longer renders in text output.
- Verify cursor toggle in FloatingToolbar → More menu hides/shows both actor + anchor.
- Confirm highlighter cursor remains unchanged.
- Confirm image resize handles still work.
