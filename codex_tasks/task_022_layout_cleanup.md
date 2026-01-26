# Task 022: Layout Cleanup (Post-Footer Refactor)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 017 (cleanup), Task 020 (presentation mode)

## Context
We recently moved the Prompter + Toolbar into the layout flow (footer stack) to prevent overlay collisions. This refactor left some layout-related classes, props, and padding logic that can now be simplified.

## Goals
1) Remove unused layout props or legacy padding paths introduced by earlier overlay-safe logic.  
2) Normalize footer layout styling now that Prompter + Toolbar are in a single block.  
3) Keep current UX identical (no visual regressions beyond spacing cleanup).

## Non-goals
- No functional changes to playback, tools, or animation.
- No new features or UI redesigns.

## Scope (touched files)
- `v10/src/components/layout/AppLayout.tsx`
- `v10/src/components/layout/Prompter.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/layout/PlayerBar.tsx`
- `v10/src/components/canvas/CanvasStage.tsx`
- `v10/src/components/canvas/PageViewport.tsx`

## Requirements
1) Remove unused props/styles related to the previous overlay-safe calculation.  
2) Ensure footer spacing is consistent across edit vs presentation modes.  
3) No new CSS variables or JS layout measurement added.

## Acceptance Criteria
1) UI looks the same as current state, with equal or improved spacing.  
2) No regression in board scaling or positioning on resize.  
3) Lint/build is not required, but TypeScript should remain clean (no unused imports/vars).

## Manual Verification
1) Resize the window vertically and confirm board stays centered above the footer block.  
2) Enter Presentation Mode and confirm PlayerBar stays aligned with the footer and no overlaps occur.  
3) Ensure Prompter + Toolbar appear as a single stacked group with no unexpected scrollbars.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/components/canvas/PageViewport.tsx`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions).
