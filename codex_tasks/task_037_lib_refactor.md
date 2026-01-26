# Task 037: Core Lib Refactor (BoardSpec/Migration/Export)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 036

## Context
`v10/src/lib` contains core logic (boardSpec, migration, exportPipeline) that violates the layered architecture (`core / features / ui`). These files should live under `core` to make dependencies explicit and maintainable.

## Goals
1) Move **boardSpec** into `core/config`.
2) Move **migration** into `core/migrations`.
3) Move **exportPipeline** into a clear `core/export` namespace.
4) Update all imports to the new locations.

## Non-goals
- No behavior changes.
- No new features.
- No dependency updates.

## Scope (touched files)
- `v10/src/lib/boardSpec.ts` (move)
- `v10/src/lib/migration.ts` (move)
- `v10/src/lib/exportPipeline.ts` (move)
- Files importing these modules (boardSpec/migration)

## Requirements
1) New locations:
   - `v10/src/core/config/boardSpec.ts`
   - `v10/src/core/migrations/migrateToV2.ts`
   - `v10/src/core/export/exportPipeline.ts`
2) Update imports to use `@core/...` aliases.
3) `v10/src/lib` should end up empty (or only contain non-core legacy helpers).

## Acceptance Criteria
1) All boardSpec/migration imports resolve from `core/*`.
2) No `@/lib/*` imports remain for these modules.
3) Behavior remains unchanged.

## Manual Verification
1) `rg "@/lib/boardSpec" v10/src` returns no results.  
2) `rg "@/lib/migration" v10/src` returns no results.  

## Closeout Notes
- Core logic moved under `v10/src/core/*` with updated imports.
- `v10/src/lib` no longer hosts core modules.
