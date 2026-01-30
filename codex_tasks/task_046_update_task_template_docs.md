# Task 046: task 템플릿에 AI_READ_ME 갱신 규칙 추가

Status: COMPLETED
Owner: Gemini (spec) / Codex (implementation)
Target: root/
Date: 2026-01-30

## Accomplishments
- Added "Documentation Update Check" section to `codex_tasks/_TEMPLATE_task.md`.
- Integrated mandatory checks for `AI_READ_ME` and `AI_READ_ME_MAP.md` updates into the task lifecycle.

## Goal
- What to change:
  - codex_tasks/_TEMPLATE_task.md에 “AI_READ_ME/AI_READ_ME_MAP 갱신 체크” 섹션 추가
- What must NOT change:
  - 다른 문서나 코드 변경 없음

## Scope (Codex must touch ONLY these)
Touched files/directories:
- codex_tasks/_TEMPLATE_task.md

Out of scope:
- 다른 파일 수정 없음

## Dependencies / constraints
- New dependencies allowed? NO

## Acceptance criteria (must be testable)
- [x] 템플릿에 아래 체크 항목이 추가된다:
  - [x] 구조 변경(파일/폴더 추가·이동·삭제) → AI_READ_ME_MAP 갱신 확인
  - [x] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우) → AI_READ_ME 갱신 확인

## Manual verification steps (since no automated tests)
- 템플릿 확인

## Risks / roll-back notes
- 문제 시 템플릿 변경만 롤백

---

## Implementation Log (Codex)
Status: COMPLETED
Changed files:
- codex_tasks/_TEMPLATE_task.md

Commands run (only if user asked):
- None

Notes:
- Task file was completed by Gemini; Codex verified template updates and filled the completion log.
