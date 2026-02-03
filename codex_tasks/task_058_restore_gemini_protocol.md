# Task 058: Restore Gemini-Codex protocol

Status: COMPLETED
Owner: Codex (planner/spec) / Codex (implementation)
Target: root/
Date: 2026-02-01

## Goal
- What to change: Restore the Gemini-Codex collaboration protocol (Gemini writes specs; Codex implements) and update all references to use `GEMINI_CODEX_PROTOCOL.md`.
- What must NOT change: No production code changes.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- GEMINI_CODEX_PROTOCOL.md
- WORKFLOW_PROTOCOL.md (remove)
- AGENTS.md
- PROJECT_CONTEXT.md
- v10/AI_READ_ME.md
- codex_tasks/task_058_restore_gemini_protocol.md

Out of scope:
- Any code changes
- Updates to other markdown files

## Dependencies / constraints
- New dependencies allowed? NO
- Boundary rules: N/A (documentation-only)

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `GEMINI_CODEX_PROTOCOL.md` exists with Gemini/Codex roles and workflow.
- [ ] References in `AGENTS.md`, `PROJECT_CONTEXT.md`, and `v10/AI_READ_ME.md` point to `GEMINI_CODEX_PROTOCOL.md`.
- [ ] `WORKFLOW_PROTOCOL.md` is removed.
- [ ] `AGENTS.md` no longer forbids reading `GEMINI.md`.

## Manual verification steps (since no automated tests)
- Search for `WORKFLOW_PROTOCOL.md` references and ensure none remain.
- Search for `GEMINI_CODEX_PROTOCOL.md` references and confirm they are correct.

## Risks / roll-back notes
- Risk: Removing `WORKFLOW_PROTOCOL.md` may break external references.
- Rollback: Restore `WORKFLOW_PROTOCOL.md` and revert doc references.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- GEMINI_CODEX_PROTOCOL.md
- AGENTS.md
- PROJECT_CONTEXT.md
- v10/AI_READ_ME.md
- codex_tasks/task_058_restore_gemini_protocol.md

Commands run (only if user asked):
- None (not requested)

Notes:
- Restored Gemini-Codex protocol and removed WORKFLOW_PROTOCOL.md.
