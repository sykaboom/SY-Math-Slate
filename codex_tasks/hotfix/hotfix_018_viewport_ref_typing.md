# Hotfix 068: Viewport Ref Typing for Build

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: `RefObject<HTMLDivElement | null>` not assignable to `RefObject<HTMLDivElement>`.

## Scope
- v10/src/features/canvas/viewport/useViewportInteraction.ts

## Change
- Widened hook parameter type to accept `HTMLDivElement | null`.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
