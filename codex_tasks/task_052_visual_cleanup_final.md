# Task 052: Remaining Visual Cleanup (Neon Colors SSOT)

**Status:** COMPLETED  
**Priority:** LOW  
**Assignee:** Codex CLI  
**Dependencies:** Task 051

## Context
After the previous cleanup, a few hardcoded RGBA values for Neon Pink and Neon Cyan remain in `CanvasStage.tsx` and `globals.css`. We need to unify these using CSS variables to ensure consistency across the application.

## Goals
1) Define RGB variables for both Neon Pink and Neon Cyan in `globals.css`.
2) Replace all remaining hardcoded RGBA/Hex values for these colors in the visual stage components.

## Scope (touched files)
- `v10/src/app/globals.css`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/objects/ImageBlock.tsx` (if applicable)

## Requirements
1) **Define RGB Tokens:** In `v10/src/app/globals.css` (inside `:root`):
   - Add `--neon-cyan-rgb: 0, 255, 255;`
   - (Ensure `--neon-pink-rgb: 255, 16, 240;` exists from Task 051).
2) **Replace in CanvasStage:**
   - Replace `rgba(0,255,255,0.08)` with `rgba(var(--neon-cyan-rgb), 0.08)`.
   - Replace `rgba(255,16,240,0.08)` with `rgba(var(--neon-pink-rgb), 0.08)`.
3) **Replace in ImageBlock:**
   - Replace hardcoded `rgba(0,255,255,0.5)` with `rgba(var(--neon-cyan-rgb), 0.5)`.

## Risks & Rollback
- **Risk:** Typo in variable names will cause gradients/shadows to disappear.
- **Rollback:** Revert to hardcoded RGBA values.

## Acceptance Criteria
1) Visual appearance of background gradients and image shadows remains unchanged.
2) `grep` search for "255,16,240" or "0,255,255" in `v10/src` (excluding globals.css) returns no results.

## Manual Verification
1) Open the app and check the background gradients (top-left Cyan, bottom-right Pink).
2) Confirm they are still visible and match the design.

## Closeout Notes
- Changed files:
  - `v10/src/app/globals.css`
  - `v10/src/features/editor/canvas/CanvasStage.tsx`
  - `v10/src/features/editor/canvas/objects/ImageBlock.tsx`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
- Acceptance caveat: `v10/src/features/chrome/layout/OverviewStage.tsx` still contains `rgba(0,255,255,0.08)` but is outside the scope list.
