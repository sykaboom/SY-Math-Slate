# Hotfix 072: FileIO Blob Buffer Typing

Status: COMPLETED
Date: 2026-02-03
Owner: Codex

## Reason
Vercel build failed with TypeScript error: `Uint8Array<ArrayBufferLike>` not assignable to `BlobPart`.

## Scope
- v10/src/features/hooks/useFileIO.ts

## Change
- Switched JSZip asset read from `uint8array` to `arraybuffer` and used that in `new Blob([...])`.

## Commands
- None (not requested).

## Verification
- Not run (build/tests not requested).
