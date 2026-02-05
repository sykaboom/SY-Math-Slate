# Task 064: Visual Polish — Chalk Design, Cursor Visibility, Image Handles

**Status:** PENDING
**Priority:** P2 (Visual/UX)
**Assignee:** Codex CLI
**Dependencies:** Task 063 (Completed)

## Context
The user requested visual refinements to match the "Neon" aesthetic and fix a specific rendering artifact. Additionally, a P0 gap (Image Manipulation) needs to be addressed.
1.  **Chalk Cursor:** Simplify the chalk to a flat, glowing, modern form (same family as the Highlighter).
2.  **Ghost Comma (Clarified):** After a step finishes, the chalk cursor shrinks into a tiny marker-like icon and remains visible at the end of the text. This is the "ghost comma" artifact.
3.  **Image Handles:** Images can be inserted but resizing is inconsistent or missing in some cases (P0 Gap).
4.  **Cursor Visibility Toggle:** The user wants a toggle in the FloatingToolbar "More" menu to hide/show cursors. Default is hidden (OFF), session-only.

## Goals
1.  **Chalk Redesign:** Reimplement `ChalkActor` to share the "Neon Family Look" with `HighlighterActor`.
2.  **Fix Ghost Comma:** The end-of-step cursor must not shrink into a tiny icon. When visible, the cursor remains full-size.
3.  **Cursor Visibility Toggle:** Add a session-only toggle in the FloatingToolbar "More" menu to hide/show both the writing cursor and the anchor indicator.
4.  **Cursor Consistency:** The writing cursor and anchor indicator must share the same design and size.
5.  **Image Manipulation:** Ensure selection handles (resize) work reliably for Image items.

## Non-Goals (Out of Scope unless explicitly requested)
- Image rotation
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

### 1. Chalk Actor Redesign (`ChalkActor.tsx`)
- **Reference:** `HighlighterActor.tsx`
- **Style (Simplified):**
    - Shape: Rounded rectangle body + small rounded tip.
    - Color: White / Cyan gradient (`slate-50` → `cyan-100/200`).
    - Glow: Neon cyan/white `box-shadow`.
    - End marker: Must match actor **shape + size**.
    - Animation: **Static** (No `actor-bob` or wobbling). Just smooth position updates.

### 2. Ghost Comma Fix (End-of-step cursor shrink)
- **Symptoms:** After a step finishes, the cursor shrinks into a tiny marker-like icon and remains at the end.
- **Action:**
    - Keep the end marker but make it **full-size** and identical to the writing cursor.
    - The anchor indicator should match the writing cursor size/design (no shrink mismatch).

### 3. Cursor Visibility Toggle (FloatingToolbar → More)
- **Toggle:** "Cursor Visibility" (label TBD).
- **Behavior:** Hide/show both **writing cursor** (Chalk/Marker actor) and **AnchorIndicator** together.
- **Default:** OFF (hidden by default).
- **Persistence:** Session-only (no local storage).

### 4. Cursor Consistency (AnchorIndicator)
- The anchor indicator should use the **same design and size** as the writing cursor.
- When the tool changes (chalk vs marker), the anchor indicator should align to the same visual family.

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
- [ ] **Chalk Look:** Chalk cursor looks modern, flat, and glowing (matches Highlighter). No realistic wood/texture.
- [ ] **No Shrink:** End-of-step cursor does **not** shrink into a tiny icon. When visible, it stays full-size.
- [ ] **Cursor Toggle:** A "More" menu toggle hides/shows **both** writing cursor and anchor indicator.
- [ ] **Default Hidden:** Cursor visibility is OFF by default and resets on refresh.
- [ ] **Cursor Consistency:** Writing cursor and anchor indicator share the same design + size.
- [ ] **Image Resize:** User can select an image and resize it using handles.

---

## Completion Notes
**Changed Files**
- `v10/src/features/store/useUIStore.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/actors/ChalkActor.tsx`
- `v10/src/core/themes/chalkTheme.ts`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/app/globals.css`

**Commands Run**
- None.

**Manual Verification Notes**
- Verify cursor toggle in FloatingToolbar → More menu hides/shows both actor + anchor.
- Confirm cursor stays full-size after final step (no tiny end marker).
- Confirm no cursor flicker at step start (anchor/actor behavior).
