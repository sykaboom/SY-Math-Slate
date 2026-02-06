# Hotfix 069: ContentLayer StepIndex Typing

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: `CanvasItem` not assignable to `{ stepIndex?: number }` in `ContentLayer`.

## Scope
- v10/src/features/canvas/ContentLayer.tsx

## Change
- Widened `getStepIndex` to accept `CanvasItem` and safely read `stepIndex` using an `in` check.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
