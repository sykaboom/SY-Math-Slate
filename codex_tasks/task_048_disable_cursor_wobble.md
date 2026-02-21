# Task 048: Hide Cursor Wobble Animation

**Status:** COMPLETED  
**Priority:** LOW  
**Assignee:** Codex CLI  
**Dependencies:** Task 047

## Context
The cursor (AnchorIndicator) currently has a "wobble" animation (`chalkWobble`). While it adds some character, it can be visually distracting during precise navigation or long sessions. We want to disable it for now, but keep the code intact for an easy rollback if decided later.

## Goals
1) Disable the physical wobble animation of the cursor.
2) Ensure the change is easily reversible (Hide, don't Delete).

## Scope (touched files)
- `v10/src/features/editor/canvas/AnchorIndicator.tsx`

## Requirements
1) **Comment out CSS Animation:** In the `<style>` block of `AnchorIndicator.tsx`, comment out the `.chalk-anchor-wobble` class definition.
2) **Retain Class Name in JSX:** Keep the `chalk-anchor-wobble` class in the JSX but ensure it has no effect (which is achieved by commenting out the CSS).
3) **Rollback Path:** If we want to re-enable it, we should only need to uncomment the CSS block.

## Acceptance Criteria
1) The cursor (chalk indicator) stays perfectly still when active.
2) No console errors or styling breakages.
3) The animation code is still present in the file (commented out).

## Manual Verification
1) Open the app and navigate to any step.
2) Confirm the chalk indicator is stationary (no slight 2px shifting).

## Closeout Notes
- Changed files:
  - `v10/src/features/editor/canvas/AnchorIndicator.tsx`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
