# Task 041: AI Map Document (v10)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 040

## Context
We need a concise “app map” so new agents can understand the v10 architecture quickly and make safe changes.

## Goals
1) Create a single AI-oriented map of the v10 app.
2) Encode layer boundaries and data flows.
3) Capture persistence and extension scaffolding decisions.

## Scope (touched files)
- `v10/AI_READ_ME.md` (new)

## Requirements
1) Include:
   - Directory map (core/ui/features/app)
   - Data model summary (global steps, stepBlocks, anchorMap, audioByStep)
   - Persistence (doc-only vs session)
   - Key flows (autoLayout, playback)
   - Extension scaffolding (registry/connectors/runtime)
   - Guardrails (no globals, sanitize HTML)
2) Keep it concise and skimmable.

## Acceptance Criteria
1) File exists and contains the sections above.
2) Uses repo aliases (`@core`, `@features`, `@ui`) in examples.

## Manual Verification
1) Open `v10/AI_READ_ME.md` and confirm sections and links.

## Closeout Notes
- Added `v10/AI_READ_ME.md` with layer map, data flow, and persistence rules.
