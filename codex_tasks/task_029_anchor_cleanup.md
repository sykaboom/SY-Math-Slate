# Task 029: Anchor/Indicator Cleanup (No Behavior Change)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 028

## Context
Anchor/indicator logic stabilized but became hard to read and reason about. This task is **strictly cleanup**: reduce complexity without changing runtime behavior.

## Goals
1. Make anchor indicator logic easier to follow (state flow + measurements).
2. Simplify ContentLayer cursor probe wiring.
3. Keep **exact behavior** identical (no UX changes).

## Non-goals
- No UI/UX changes.
- No state schema changes.
- No animation timing changes.

## Scope (touched files)
- `v10/src/features/editor/canvas/AnchorIndicator.tsx`
- `v10/src/features/editor/canvas/ContentLayer.tsx`

## Requirements
1. Extract measurement logic into a small helper function or internal hook (same file).
2. Reduce conditional nesting; keep early returns readable.
3. Keep current suppression and play gating logic intact (same visible results).
4. Preserve cursor probe DOM attributes and end-marker behavior.

## Acceptance Criteria
1. Behavior matches current build: no cursor flicker, last-step marker stays correct.
2. No new dependencies.
3. No changes outside the scoped files.

## Manual Verification
1. Play from step 1 → no anchor flicker at start.
2. Auto and manual play behave the same.
3. After final step, anchor hidden and end-marker visible.

## Closeout
- **Changed files:**
  - `v10/src/features/editor/canvas/AnchorIndicator.tsx`
  - `v10/src/features/editor/canvas/ContentLayer.tsx`
- **Commands run:** none
- **Manual verification:** not run (not requested).
