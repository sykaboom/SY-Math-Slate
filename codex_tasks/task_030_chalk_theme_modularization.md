# Task 030: Chalk Theme Modularization (Cursor/Actor/Marker)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 029

## Context
Chalk cursor, actor, and end-marker visuals are currently hardcoded across multiple files. We need a single theme source to enable future customization and external extension without reworking UI logic.

## Goals
1. Centralize chalk-related visuals into a reusable **theme module**.
2. Ensure cursor/actor/marker share consistent sizes, colors, and offsets.
3. Keep behavior unchanged (visuals should look identical).

## Non-goals
- No new customization UI yet.
- No new persistence or settings storage.
- No behavior changes to animation timing.

## Scope (touched files)
- `v10/src/core/themes/chalkTheme.ts` (new)
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/features/canvas/actors/ChalkActor.tsx`
- `v10/src/app/globals.css`

## Requirements
1. Create `chalkTheme.ts` exporting:
   - `tipOffset`, `baselineOffset`
   - `wobbleDurationMs`, `actorBobDurationMs`
   - `markerSize`, `markerOffset`, `markerColors`
2. AnchorIndicator uses theme constants (no inline magic numbers).
3. ChalkActor uses theme constants (sizes/offsets/gradients).
4. End-marker styles in CSS are derived from theme (CSS variables set on `:root` or `.chalk-theme` class).
5. No visible UI change from current behavior.

## Acceptance Criteria
1. Cursor/actor/marker still look the same as current build.
2. Chalk-related values live in a single module (theme).
3. No new dependencies.

## Manual Verification
1. Play animation: cursor still appears correctly.
2. End-marker still shows after last step.
3. No console errors.

## Closeout
- **Changed files:**
  - `v10/src/core/themes/chalkTheme.ts`
  - `v10/src/features/canvas/AnchorIndicator.tsx`
  - `v10/src/features/canvas/actors/ChalkActor.tsx`
  - `v10/src/app/globals.css`
- **Commands run:** none
- **Manual verification:** not run (not requested).
