# Task 051: Neon Pink Token Unification

**Status:** COMPLETED  
**Priority:** LOW  
**Assignee:** Codex CLI  
**Dependencies:** Task 050

## Context
The color `#ff10f0` (Neon Pink) is used both as a CSS variable and a hardcoded value. We will unify all instances to use the CSS variable.

## Goals
1) Use `var(--neon-pink)` as the single source for the neon pink color.
2) Include gradients that use this color.

## Scope (touched files)
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/features/layout/OverviewStage.tsx` (if applicable)
- `v10/src/app/globals.css`

## Requirements
1) **Define Tokens:** In `globals.css`:
   - Ensure `--neon-pink: #ff10f0;` exists.
   - Add `--neon-pink-rgb: 255, 16, 240;` for alpha-channel usage.
2) **Replace Hardcoding:** Change all instances of `#ff10f0` (case-insensitive) to `var(--neon-pink)`.
3) **Handle Gradients/Alpha:** 
   - If a gradient or shadow uses alpha (e.g., `rgba(255, 16, 240, 0.08)`), replace it with `rgba(var(--neon-pink-rgb), 0.08)` or `color-mix` if supported/preferred.

## Risks & Rollback
- **Risk:** CSS variable syntax error could lead to black/transparent colors.
- **Rollback:** Revert changes to `globals.css` and components.

## Acceptance Criteria
1) Visual appearance of Neon Pink elements (shadows, labels) remains the same.
2) Hex code `#ff10f0` is no longer found in the touched components.

## Manual Verification
1) Check the AnchorIndicator on a break step (Neon Pink glow).
2) Confirm the color matches the previous hardcoded look.

## Closeout Notes
- Changed files:
  - `v10/src/app/globals.css`
  - `v10/src/features/canvas/AnchorIndicator.tsx`
  - `v10/src/features/layout/OverviewStage.tsx`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
