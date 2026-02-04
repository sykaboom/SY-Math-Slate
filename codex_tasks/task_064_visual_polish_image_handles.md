# Task 064: Visual Polish — Chalk Design, Ghost Fix, Image Handles

**Status:** PENDING
**Priority:** P2 (Visual/UX)
**Assignee:** Codex CLI
**Dependencies:** Task 063 (Completed)

## Context
The user requested visual refinements to match the "Neon" aesthetic and fix a specific rendering artifact. Additionally, a P0 gap (Image Manipulation) needs to be addressed.
1.  **Chalk Cursor:** The current realistic chalk image feels out of place. It should match the "Highlighter" design language (flat, glowing, modern).
2.  **Ghost Comma:** A mysterious comma (`,`) or artifact appears at the end of text after animation completes.
3.  **Image Handles:** Images can be inserted but resizing is inconsistent or missing in some cases (P0 Gap). Existing `ImageBlock` handles should be audited before adding new components.

## Goals
1.  **Chalk Redesign:** Reimplement `ChalkActor` to share the "Neon Family Look" with `HighlighterActor`.
2.  **Fix Artifacts:** Investigate and remove the trailing comma/artifact after step completion.
3.  **Image Manipulation:** Ensure selection handles (resize) work reliably for Image items in both flow + absolute modes.

## Non-Goals (Out of Scope unless explicitly requested)
- Image rotation
- New dependencies

## Scope (Files)
- `v10/src/features/canvas/actors/ChalkActor.tsx` (Redesign)
- `v10/src/core/themes/chalkTheme.ts` (Theme updates)
- `v10/src/features/canvas/animation/AnimatedTextBlock.tsx` (Artifact investigation)
- `v10/src/features/canvas/ContentLayer.tsx` (Image selection logic)
- `v10/src/features/canvas/objects/ImageBlock.tsx` (Existing image selection + resize)
- `v10/src/app/globals.css` (If artifact is tied to end-marker or cursor CSS)
- `v10/src/features/canvas/ImageHandles.tsx` (Optional: only if extraction is required)
- `v10/src/features/store/useCanvasStore.ts` (Update image item logic)

## Detailed Design Specs

### 1. Chalk Actor Redesign (`ChalkActor.tsx`)
- **Reference:** `HighlighterActor.tsx`
- **Style:**
    - Shape: Rounded Rectangle (similar to Highlighter, maybe slightly thinner).
    - Color: White / Cyan gradient (`from-slate-50` to `to-slate-200` or subtle cyan tint).
    - Glow: `box-shadow` with Neon Cyan/White color.
    - Animation: **Static** (No `actor-bob` or wobbling). Just smooth position updates.

### 2. Ghost Comma Fix (`AnimatedTextBlock.tsx`)
- **Symptoms:** A comma or dot appears at the end of the text after animation finishes.
- **Repro:** After the **last step** finishes rendering, a mark appears at the end **every time**.
- **Visual:** The mark is the **chalk design cursor shrinking** at the end (not a punctuation glyph).
- **Action:**
    - Check for `Zero-width space` or `&nbsp;` at the end of the HTML string.
    - Inspect if the `cursor` element (if any) is being rendered with a default content like `,`.
    - Ensure `onDone` doesn't trigger a state that renders a placeholder character.
    - Verify `ContentLayer.tsx` markers (`data-flow-cursor`, `.end-marker`) and related CSS in `globals.css`.

### 3. Image Handles (`ImageHandles.tsx`)
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
- [ ] **No Artifacts:** Text animation ends cleanly without extra characters or commas.
- [ ] **Image Resize:** User can select an image (flow or absolute) and resize it using handles; aspect ratio is preserved.
- [ ] **No Rotation:** Image rotation remains out of scope in this task.

## Manual Verification Steps
- Open v10 editor, insert text, play animation to the **last step**; confirm no trailing comma/extra character on completion.
- Insert an image, select it, resize via corner handles; verify works in both flow and after switching to absolute (drag).
- Switch to chalk tool; confirm cursor matches neon/highlighter aesthetic and has no bob/wobble.

## Risks / Rollback Notes
- Risk: Adjusting markers/CSS could shift baseline alignment. Rollback by reverting the marker/CSS changes only.
- Risk: Image resize changes could affect drag/selection. Rollback by reverting `ImageBlock` changes while keeping Chalk/Ghost fixes.
