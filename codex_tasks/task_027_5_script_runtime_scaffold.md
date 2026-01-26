# Task 027.5: Script Runtime Scaffold (Manifest + Trigger Registry)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 027

## Context
We want Google Apps Script–style automation later. This task adds **types and registries only** for scripts and triggers. No execution, no sandbox, no UI.

## Goals
1) Define a **Script manifest** type.  
2) Define a **Trigger registry** to register and list scripts by trigger.  
3) Keep everything **inactive by default**.

## Non-goals
- No script execution.
- No sandbox/VM.
- No UI changes.
- No new dependencies.

## Scope (touched files)
- `v10/src/core/extensions/runtime.ts` (new)

## Requirements
1) **Script Manifest**
   - `id`, `name`, `version`
   - `triggers`: list of trigger names (string)
   - `permissions`: list of capability scopes (string)
   - `entry?`: optional entry point (future use)
2) **Registry**
   - `registerScript(manifest)`
   - `listScripts()`
   - `getScriptsByTrigger(trigger)`
3) **No execution**
   - Registry stores metadata only.

## Acceptance Criteria
1) Types compile and registry is importable.
2) No runtime side effects.
3) No UI changes.

## Closeout Notes
- Script manifest + trigger registry scaffold added in `core/extensions/runtime.ts`.
