# Task 077: Speculative Defense Audit (No Code Changes)

Status: COMPLETED
Owner: Codex (audit)
Target: v10/ (review only)
Date: 2026-02-06

## Goal
- Review recent v10 code paths for “just in case” defensive branches without evidence.
- Produce a short list of candidates for removal (if any) or confirm none found.

## Scope (review only)
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/core/sanitize/richTextSanitizer.ts`
- `v10/src/core/persistence/buildPersistedDoc.ts`
- `v10/src/features/platform/hooks/usePersistence.ts`
- `v10/src/features/platform/hooks/useFileIO.ts`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/layout/autoLayout.ts`
- `v10/src/features/editor/canvas/ContentLayer.tsx`

## Findings
### 1) Defensive normalization in migration is justified
- `migrateToV2.ts` contains extensive type guards and default values for persisted data.
- Evidence: `v10/src/core/migrations/migrateToV2.ts` normalizes unknown input for pages/items/segments.
- Rationale: persisted/imported data is untrusted by design, so these branches are required.

### 2) rich text sanitization is necessary, not speculative
- `richTextSanitizer.ts` removes unsafe tags and allowlists classes/tags.
- Evidence: `v10/src/core/sanitize/richTextSanitizer.ts` filters tags and classes.
- Rationale: user-supplied HTML from Data Input and persistence paths must be sanitized.

### 3) Persisted doc builder has evidence-backed options
- `buildPersistedDoc.ts` supports image filtering for autosave vs export.
- Evidence: `v10/src/core/persistence/buildPersistedDoc.ts`.
- Rationale: autosave explicitly excludes images (existing behavior).

### 4) DataInput selection guards are UX safety, not speculative
- Selection guards prevent invalid range operations and are required for DOM stability.
- Evidence: `v10/src/features/chrome/layout/dataInput/segmentCommands.ts`.

## Candidate removals
- None found in reviewed scope that meet “speculative without evidence” criteria.

## Recommendations
- Continue enforcing the new “Speculative Defense” guardrails.
- If a branch is introduced for a hypothetical format/tool, require evidence + sunset.

---

## Implementation Log (Codex)
Status: COMPLETED
Changed files:
- None (audit only)

Commands run:
- None

Notes:
- Audit found no speculative defenses to remove in the reviewed scope.
