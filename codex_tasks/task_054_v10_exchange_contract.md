# Task 054: V10 exchange contract (living doc)

Status: COMPLETED
Owner: Codex (planner/spec) / Codex (implementation)
Target: root/
Date: 2026-01-31

## Goal
- What to change: Create a living exchange contract that defines the minimum data rules for bidirectional exchange between v10 and other apps (legacy, math-pdf-builder).
- What must NOT change: No production code changes. No updates to existing docs beyond adding the new contract file.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- V10_EXCHANGE_CONTRACT.md
- codex_tasks/task_054_v10_exchange_contract.md

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
- [ ] `V10_EXCHANGE_CONTRACT.md` exists at repo root.
- [ ] The doc states that v10 is the SSOT and this is a living contract.
- [ ] The doc defines container/package structure and required files at a high level.
- [ ] The doc defines a minimum PersistedSlateDoc structure with required fields.
- [ ] The doc lists invariant rules (global step, doc-only persistence, JSON-safe data).
- [ ] The doc includes sections for loss policy and mapping notes, marked TBD where unknown.
- [ ] The doc ends with a “Sources” section listing local files used (paths only).

## Manual verification steps (since no automated tests)
- Open `V10_EXCHANGE_CONTRACT.md` and verify required sections.
- Confirm that only the new file was added.

## Risks / roll-back notes
- Risk: Contract may be incomplete because v10 spec is still evolving.
- Rollback: Delete `V10_EXCHANGE_CONTRACT.md` and revert this task file if needed.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- V10_EXCHANGE_CONTRACT.md
- codex_tasks/task_054_v10_exchange_contract.md

Commands run (only if user asked):
- None (not requested)

Notes:
- Draft exchange contract created as a living document with TBD sections.
