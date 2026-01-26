# Task 042: Deep AI_READ_ME (single-file detailed map)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 041

## Context
`v10/AI_READ_ME.md` is currently a lightweight overview. We need a **single, highly detailed map** for AI use (vibe-coding), even if verbose.

## Goals
1) Expand `AI_READ_ME.md` into a deep, detailed reference.
2) Include layer rules, store schemas, invariants, and key flows.

## Scope (touched files)
- `v10/AI_READ_ME.md`

## Requirements
1) Add **Layer Rules** (allowed imports, forbidden patterns).
2) Add **Store Schemas** for `useCanvasStore` and `useUIStore` (fields + purpose).
3) Add **Data Flow** sections for:
   - Data Input → StepBlocks → AutoLayout → Pages/AnchorMap
   - Playback → useSequence → useAudioPlayer/useSFX
   - Persistence → doc-only save → hydrate session reset
4) Add **Invariants** (global steps, doc/session split, sanitize rules).
5) Add **JSON Examples** for doc-only persistence and session state.
6) Keep it in a single file; no external references required.

## Acceptance Criteria
1) `v10/AI_READ_ME.md` contains the new detailed sections.
2) Single-file map is sufficiently explicit for AI to follow without other docs.

## Manual Verification
1) Open `v10/AI_READ_ME.md` and confirm sections above exist.

## Closeout Notes
- Expanded `AI_READ_ME` into a single-file deep map for AI agents.
