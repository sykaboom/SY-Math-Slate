# Task 050: Z-Index Tokenization

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 049

## Context
Z-Index values like 12, 14, 15, and 60 are scattered as magic numbers. We will move these to CSS variables to make the layer hierarchy explicit and maintainable.

## Goals
1) Define a centralized layer hierarchy using CSS variables.
2) Replace `z-[..]` utility classes with the new tokens.

## Scope (touched files)
- `v10/src/app/globals.css`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/canvas/CanvasGuides.tsx`
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/features/canvas/actors/ActorLayer.tsx`
- `v10/src/features/canvas/actors/ChalkActor.tsx`
- `v10/src/features/canvas/actors/HighlighterActor.tsx`
- `v10/src/features/canvas/PasteHelperModal.tsx`

## Requirements
1) **Define Tokens:** In `globals.css` (inside `:root`), add:
   - `--z-content: 12;`
   - `--z-indicator: 14;`
   - `--z-guide: 14;`
   - `--z-actor: 15;`
   - `--z-modal: 60;`
   (No need for light/dark theme overrides, layer order is constant).
2) **Apply Tokens:** Replace `className="... z-[14] ..."` with `style={{ zIndex: 'var(--z-indicator)' }}`.
   - Ensure to maintain other existing class names.

## Risks & Rollback
- **Risk:** Typo in variable names could lead to elements disappearing (z-index 0 or auto).
- **Rollback:** Revert changes to `globals.css` and restore `z-[..]` utility classes in components.

## Acceptance Criteria
1) Layering order remains unchanged (Modal > Actor > Indicator/Guides > Content).
2) No hardcoded `z-[12]`, `z-[14]`, etc., remain in the touched files.

## Manual Verification
1) Open the canvas.
2) Verify that the cursor (Actor) appears *above* the content.
3) Open the Paste Helper Modal (if accessible) and verify it overlays everything.

## Closeout Notes
- Changed files:
  - `v10/src/app/globals.css`
  - `v10/src/features/canvas/ContentLayer.tsx`
  - `v10/src/features/canvas/CanvasGuides.tsx`
  - `v10/src/features/canvas/AnchorIndicator.tsx`
  - `v10/src/features/canvas/actors/ActorLayer.tsx`
  - `v10/src/features/canvas/actors/ChalkActor.tsx`
  - `v10/src/features/canvas/actors/HighlighterActor.tsx`
  - `v10/src/features/canvas/PasteHelperModal.tsx`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
