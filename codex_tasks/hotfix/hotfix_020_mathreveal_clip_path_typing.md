# Hotfix 070: MathRevealBlock Clip Path Typing

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: `webkitClipPath` does not exist on `CSSStyleDeclaration`.

## Scope
- v10/src/features/editor/canvas/animation/MathRevealBlock.tsx

## Change
- Replaced direct `webkitClipPath` assignment with `style.setProperty("-webkit-clip-path", value)`.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
