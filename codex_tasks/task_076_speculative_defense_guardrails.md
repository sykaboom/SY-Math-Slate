# Task 076: Speculative Defense Guardrails (Docs)

Status: COMPLETED
Owner: Codex (spec)
Target: root docs
Date: 2026-02-06

## Goal
- What to change:
  - Add explicit “no speculative defense” rules to `AGENTS.md`.
  - Add a checklist item to `codex_tasks/_TEMPLATE_task.md` requiring evidence or sunset criteria for defensive branches.
- What must NOT change:
  - No production code changes.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `AGENTS.md`
- `codex_tasks/_TEMPLATE_task.md`

Out of scope:
- Any v10 production code edits

## Dependencies / constraints
- New dependencies allowed? NO
- Must remain consistent with `PROJECT_BLUEPRINT.md`

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `AGENTS.md`에 “근거 없는 방어 코드 금지” 규칙이 명시됨.
- [ ] “미래 대비 분기에는 근거/만료 기준(sunset)을 명시” 규칙이 포함됨.
- [ ] `_TEMPLATE_task.md`에 defensive branch 근거/만료 체크 항목이 추가됨.

## Manual verification steps (since no automated tests)
- 문서에 새 규칙/체크리스트가 있는지 확인.

## Risks / roll-back notes
- Risk: 규칙이 지나치게 엄격하게 느껴질 수 있음.
- Roll-back: 예외 조건(보안/입력 검증)을 명시적으로 허용.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `AGENTS.md`
- `codex_tasks/_TEMPLATE_task.md`

Commands run (only if user asked):
- None

Notes:
- Added speculative defense guardrails and template checks.
