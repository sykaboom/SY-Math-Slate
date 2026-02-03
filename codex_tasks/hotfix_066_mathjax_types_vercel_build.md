# Hotfix 066: MathJax Type Widening for Vercel Build

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with a TypeScript error in `v10/src/core/math/loader.ts` when assigning the MathJax config object to `window.MathJax`.

## Scope
- v10/src/core/math/loader.ts

## Change
- Widened `MathJaxApi.startup` typing to accept config fields (`typeset`, `pageReady`) in addition to runtime fields (`defaultPageReady`, `promise`).

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
