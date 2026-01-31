# Task 048-2: Disable Global Actor Wobble (Follow-up)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 048

## Context
While the cursor wobble in `AnchorIndicator` was disabled in Task 048, the cursor still appears to shake because the `ChalkActor` uses a global `.actor-bob` animation defined in `globals.css`. To satisfy the user's request for a completely stationary cursor, we need to hide this animation as well.

## Goals
1) Disable the global `.actor-bob` animation.
2) Ensure the change is easily reversible (Hide, don't Delete).

## Scope (touched files)
- `v10/src/app/globals.css`

## Requirements
1) **Comment out CSS Animation:** In `v10/src/app/globals.css`, comment out the `.actor-bob` class and the `@keyframes actor-bob` block.
2) **Retain Code:** Keep the commented-out code in the file for easy rollback.

## Acceptance Criteria
1) The cursor and any actors no longer exhibit the "bobbing" or "wobbling" animation, even when moving.
2) No console errors or styling breakages.

## Manual Verification
1) Open the app and start playback or move the cursor.
2) Confirm the cursor (ChalkActor) stays physically stable and does not rotate or shift beyond its base translation.

## Closeout Notes
- Changed files:
  - `v10/src/app/globals.css`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
