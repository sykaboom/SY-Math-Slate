# Task 039: Export Pipeline Decision (Keep or Remove)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 038

## Context
`core/export/exportPipeline.ts` exists but is unused. We must decide whether to keep it as a formal extension point or remove it to avoid dead code.

## Goals
1) Decide: **keep as extension scaffold** or **remove entirely**.  
2) Ensure codebase reflects the decision (no ambiguous leftovers).

## Non-goals
- No new export features.
- No UI changes.

## Scope (touched files)
- `v10/src/core/export/exportPipeline.ts`
- `codex_tasks/task_039_export_pipeline_decision.md`

## Requirements
### Option A (Keep)
- Leave file in place.
- Add a short comment explaining it is a stub for future export plugins.

### Option B (Remove)
- Delete the file and remove any references.

## Acceptance Criteria
1) Decision is reflected in code.
2) No unused export pipeline ambiguity remains.

## Decision
- **Keep (Option A)**: retain as export extension scaffold with a stub comment.
