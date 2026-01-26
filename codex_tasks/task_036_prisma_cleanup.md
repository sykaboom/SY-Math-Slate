# Task 036: Prisma/Generated Cleanup (v10)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 034

## Context
Prisma client output currently lives under `v10/src/generated/prisma` and `v10/src/lib/prisma.ts` exists, but the app does not import or use Prisma anywhere. Keeping generated server-only code inside `src/` inflates the client build surface and increases accidental import risk.

## Goals
1) Remove unused Prisma runtime files from the client code path.  
2) Keep schema artifacts for future use without impacting the Next.js build.  
3) Make Prisma output location **non-`src/`** to avoid bundler ingestion.

## Non-goals
- No Prisma runtime usage added.
- No DB features implemented.
- No dependency changes.

## Scope (touched files)
- `v10/prisma/schema.prisma`
- `v10/prisma.config.ts` (only if needed)
- `v10/src/generated/prisma/**` (delete)
- `v10/src/lib/prisma.ts` (delete)

## Requirements
1) Update Prisma generator output to a **non-src path** (e.g., `prisma/generated`).  
2) Remove `v10/src/generated/prisma/**`.  
3) Remove `v10/src/lib/prisma.ts`.  

## Acceptance Criteria
1) No Prisma client code remains inside `v10/src/`.  
2) Schema still exists and can be generated later without re-entering `src/`.  
3) App build surface is reduced (no server-only Prisma inside client tree).

## Manual Verification
1) Confirm `v10/src/generated/prisma` no longer exists.  
2) Confirm no imports reference `v10/src/lib/prisma.ts`.  

## Closeout Notes
- Prisma client output moved out of `src/` to `prisma/generated`.
- Removed unused Prisma runtime files from `v10/src/`.
