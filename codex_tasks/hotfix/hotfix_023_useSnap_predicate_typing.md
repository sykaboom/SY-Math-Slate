# Hotfix 073: useSnap Predicate Typing

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: type predicate not assignable in `useSnap` filter.

## Scope
- v10/src/features/hooks/useSnap.ts

## Change
- Replaced predicate filter with explicit push into `AlignmentGuide[]`.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
