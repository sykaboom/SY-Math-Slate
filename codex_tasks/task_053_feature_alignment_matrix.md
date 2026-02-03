# Task 053: Feature alignment matrix draft (legacy/v10/math-pdf-builder)

Status: COMPLETED
Owner: Codex (planner/spec) / Codex (implementation)
Target: root/
Date: 2026-01-31

## Goal
- What to change: Create a draft feature alignment matrix that compares legacy (root), v10, and math-pdf-builder, and highlights gaps for integration planning.
- What must NOT change: No production code changes. Do not edit existing docs beyond adding the new matrix file.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- FEATURE_ALIGNMENT_MATRIX.md
- codex_tasks/task_053_feature_alignment_matrix.md

Out of scope:
- Any code changes
- Updates to existing docs (README, AI_READ_ME, etc.)

## Dependencies / constraints
- New dependencies allowed? NO
- Boundary rules: N/A (documentation-only)

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `FEATURE_ALIGNMENT_MATRIX.md` exists at repo root.
- [ ] The doc starts with a short plain-language explanation of what the matrix is for.
- [ ] The matrix includes columns for Legacy (root), v10, math-pdf-builder, and Gap/Notes.
- [ ] Status markers are consistent (e.g., ✅/🟡/❌) and explained.
- [ ] At least 25 feature rows across ≥8 categories (e.g., Input/Editing, Layout/Pagination, Rendering/Math, Media, Playback, Persistence/File I/O, Export/Print, UX/Tools, Data Model/Schema, Integration hooks).
- [ ] A “Sources” section cites local files used (paths only).
- [ ] A “Next actions” section lists top gaps derived from ❌/🟡 rows.

## Manual verification steps (since no automated tests)
- Open `FEATURE_ALIGNMENT_MATRIX.md` and verify required sections and row counts.
- Confirm that only the new file was added (no other docs modified).

## Risks / roll-back notes
- Risk: Matrix may reflect incomplete knowledge from available docs.
- Rollback: Delete `FEATURE_ALIGNMENT_MATRIX.md` and revert this task file if needed.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- FEATURE_ALIGNMENT_MATRIX.md
- codex_tasks/task_053_feature_alignment_matrix.md

Commands run (only if user asked):
- None (not requested)

Notes:
- Draft matrix created with status legend, 9 categories, and sources section.
