# Task 072: Forward Compatibility + Refactor Invariants

Status: COMPLETED
Owner: Codex (spec)
Target: root docs
Date: 2026-02-06

## Goal
- What to change:
  - Add explicit forward-compatibility and refactor invariants to `PROJECT_BLUEPRINT.md`.
  - Add execution guardrails to `AGENTS.md` so future changes cannot break contracts or create spaghetti.
- What must NOT change:
  - No production code changes.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `PROJECT_BLUEPRINT.md`
- `AGENTS.md`

Out of scope:
- Any v10 production code edits
- Any runtime behavior changes

## Dependencies / constraints
- New dependencies allowed? NO
- Must remain consistent with `GEMINI_CODEX_PROTOCOL.md` and `PROJECT_CONTEXT.md`
- Forward-compatibility rules must be phrased as invariants (non-optional)

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `PROJECT_BLUEPRINT.md`에 “Forward Compatibility / Protocol Integrity” 섹션이 추가됨.
- [ ] 해당 섹션에 “버전 증가 + 마이그레이션 필수” 규칙이 명시됨.
- [ ] “계약/스키마 하위 호환 유지” 규칙이 명시됨.
- [ ] “리팩토링 시 어댑터/경계 유지, 스파게티 금지” 규칙이 명시됨.
- [ ] `AGENTS.md`에 동일한 실행 규칙(짧은 가드레일)이 추가됨.

## Manual verification steps (since no automated tests)
- 문서에서 새 섹션과 규칙이 명시되어 있는지 확인.
- 기존 규칙과 충돌 없이 읽히는지 확인.

## Risks / roll-back notes
- Risk: 규칙이 과하게 제한적으로 느껴질 수 있음.
- Roll-back: 규칙을 완화하거나 범위를 구체화.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `PROJECT_BLUEPRINT.md`
- `AGENTS.md`

Commands run (only if user asked):
- None

Notes:
- Added forward-compatibility and refactor invariants to docs.
