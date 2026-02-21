# Hotfix 071: MathRevealBlock Clip Path Cleanup

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: `webkitClipPath` does not exist on `CSSStyleDeclaration`.

## Scope
- v10/src/features/editor/canvas/animation/MathRevealBlock.tsx

## Change
- Removed all `webkitClipPath` direct assignments and used `style.setProperty("-webkit-clip-path", value)` consistently.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
