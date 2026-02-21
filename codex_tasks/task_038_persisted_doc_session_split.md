# Task 038: Persisted Document vs Session State Split

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 037

## Context
`PersistedCanvasV2` currently stores both **document data** and **session state** (e.g., currentStep/currentPageId). For extensibility and clean exports, persisted files should represent **document-only data**, while session state should live in store/runtime only.

## Goals
1) Introduce a document-only type (e.g., `PersistedSlateDoc`).
2) Strip session-only fields from saved snapshots.
3) Keep runtime state in Zustand only.

## Non-goals
- No feature changes.
- No UI changes.

## Scope (touched files)
- `v10/src/core/types/canvas.ts`
- `v10/src/features/platform/hooks/usePersistence.ts`
- `v10/src/features/platform/store/useCanvasStore.ts`
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/features/platform/hooks/useFileIO.ts`

## Requirements
1) Define `PersistedSlateDoc` (document-only):
   - `version`, `pages`, `pageOrder`, `pageColumnCounts?`, `stepBlocks?`, `anchorMap?`, `audioByStep?`
   - **Exclude** `currentStep` and `currentPageId`
2) Persist/save only `PersistedSlateDoc`.
3) Hydration should restore:
   - `currentStep = 0`
   - `currentPageId = first page in order`
4) Migrations should output `PersistedSlateDoc` and ignore session state if present.

## Acceptance Criteria
1) Saved payloads no longer include `currentStep`/`currentPageId`.
2) App still hydrates correctly with `currentStep = 0`.
3) File I/O uses the doc-only type.

## Manual Verification
1) Save snapshot and inspect JSON — no session fields.
2) Reload and confirm `currentStep` resets to 0, page set to first.

## Closeout Notes
- Introduced `PersistedSlateDoc` and switched persistence/file IO to doc-only payloads.
- Hydration now derives session state at runtime (step=0, first page).
