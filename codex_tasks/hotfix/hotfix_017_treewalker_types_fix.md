# Hotfix 067: TreeWalker Type Signature Fix

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: `createTreeWalker` expects 1–3 arguments, but 4 were provided.

## Scope
- v10/src/core/math/render.ts

## Change
- Removed legacy 4th argument (`false`) from `document.createTreeWalker(...)` call.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
