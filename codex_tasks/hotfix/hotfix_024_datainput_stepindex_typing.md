# Hotfix 074: DataInputPanel StepIndex Typing

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with a TypeScript error in `DataInputPanel` (accessing `stepIndex` on a union type).

## Scope
- v10/src/features/layout/DataInputPanel.tsx

## Change
- Narrowed `flowItems` via a type predicate to `TextItem | ImageItem` so `stepIndex` access is type-safe.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
