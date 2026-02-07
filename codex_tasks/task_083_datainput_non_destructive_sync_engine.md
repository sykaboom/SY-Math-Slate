# Task 083: DataInput Non-Destructive Sync Engine (Draft Model Stabilization)

Status: COMPLETED
Owner: Codex (implementation)
Target: v10/
Date: 2026-02-07

## Goal
- What to change:
  - Implement non-destructive sync between raw text edits and block draft state.
  - Preserve user-added media/style segments whenever semantic line identity remains stable.
  - Stabilize draft/apply workflow so users can edit source text without losing previous block work.
- What must NOT change:
  - No large layout/structure redesign (handled by `task_082` and later layout slices).
  - No persistence schema/version changes in this task.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `v10/src/features/layout/dataInput/blockDraft.ts`
- `v10/src/features/layout/dataInput/types.ts`
- `v10/src/features/layout/dataInput/segmentCommands.ts` (only if needed for compatibility)
- `v10/src/features/layout/DataInputPanel.tsx`
- `codex_tasks/task_083_datainput_non_destructive_sync_engine.md`

Out of scope:
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/features/layout/Prompter.tsx`
- Any cross-app exchange contract/versioning updates

## Design Artifacts (required for layout/structure changes)
- [x] Layout/structure changes included: NO (logic-first slice)
- [x] SVG path in `design_drafts/`: not required for this slice
- [x] SVG includes `viewBox` with explicit width/height and ratio label: N/A
- [x] Codex must verify SVG file exists before implementation: N/A

## Non-destructive sync policy (locked)
- Raw text re-parse must attempt stable matching before replacement.
- Matching priority:
  1) stable block identity key (if available)
  2) normalized line text equality
  3) nearest positional fallback (bounded)
- If no reliable match exists, create a new block and preserve unmatched old blocks until explicit user discard/apply decision.
- Never silently drop media/style payload on simple raw-text edits.

## Data safety constraints
- All draft state must remain JSON-safe.
- No DOM/Function references in persisted/apply payload.
- Sanitization pipeline for HTML content must remain intact.

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): N/A
- [x] Sunset criteria defined (when to remove): N/A

## Dependencies / constraints
- New dependencies allowed? NO
- Must preserve layer rules from `v10/AI_READ_ME.md`.
- Keep behavior backward compatible with existing `stepBlocks` expectations.
- Must remain compatible with modal drafting flow introduced by `task_082`.

## Documentation Update Check
- [x] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인 (해당 없음: 파일/폴더 구조 변경 없음)
- [x] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인 (해당 없음: 레이어/핵심 플로우 규칙 문서 변경 없음)

## Acceptance criteria (must be testable)
- [x] Editing raw text does not reset unrelated media/style segments for matched blocks.
- [x] Apply/Cancel semantics are explicit and do not cause silent data loss.
- [x] Unmatched blocks are handled deterministically (explicit new block or preserved old block with clear policy).
- [x] No regression in existing block insertion/removal behavior.
- [x] Only scoped files are modified.

## Manual verification steps (since no automated tests)
- Start with mixed content (text + math + image/video placeholders + styled segments).
- Modify one raw line and verify only corresponding block content updates.
- Verify existing media/style in other blocks remains unchanged.
- Perform apply/cancel cycles and confirm deterministic outcomes.
- Confirm no runtime errors in DataInput open/edit/apply flow.

## Risks / roll-back notes
- Risk: over-aggressive matching may bind wrong block after large reorder.
- Risk: conservative matching may leave too many unmatched blocks for user resolution.
- Roll-back: revert dataInput logic files only and keep prior replacement behavior.

## Dependencies on other tasks
- Recommended after `task_082` implementation (stable modal workspace first).
- Can be implemented independently if needed, but manual QA must include both tablet and desktop DataInput paths.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/features/layout/dataInput/types.ts`
- `v10/src/features/layout/dataInput/blockDraft.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `codex_tasks/task_083_datainput_non_destructive_sync_engine.md`

Commands run (only if user asked):
- `sed -n` (spec + target files inspection)
- `rg` (scope and logic checks)
- `apply_patch` (non-destructive sync implementation + spec closeout)

Notes:
- Added `syncBlocksFromRawText` with matching priority:
  - stable id token (`[#block-id]` if present)
  - normalized text equality
  - bounded positional fallback (distance <= 2)
- Introduced explicit unmatched preservation path:
  - unmatched blocks are kept in temporary state
  - user must choose restore/discard before apply
  - apply is disabled while unmatched blocks remain
- Manual verification note:
  - Runtime/browser interaction checks were not executed in this turn because dev server commands were not requested.
  - Static inspection confirms scoped-file-only changes and JSON-safe state handling.
