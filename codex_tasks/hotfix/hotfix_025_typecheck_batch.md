# Hotfix 075: Batch Typecheck Fixes

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
`npx tsc --noEmit` reported multiple type errors that block Vercel build.

## Scope
- v10/src/features/layout/DataInputPanel.tsx
- v10/src/core/types/canvas.ts
- v10/src/features/toolbar/FloatingToolbar.tsx
- v10/src/features/toolbar/atoms/ToolButton.tsx

## Change
- Restored safe `Selection` handling in DataInputPanel highlight/math wrappers.
- Allowed `anchorMap` to be `null` in persisted doc types.
- Removed unreachable `"saved"` UI branch for save status.
- Switched ToolButton props to `HTMLMotionProps` to match Framer Motion types.

## Commands
- `cd v10 && npx tsc --noEmit`

## Verification
- Typecheck run (see command above).
