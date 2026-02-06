# Task 075: AI Hub Vision + Roadmap Alignment

Status: COMPLETED
Owner: Codex (spec)
Target: root docs
Date: 2026-02-06

## Goal
- What to change:
  - Update `PROJECT_CONTEXT.md` to explicitly state the AI Education Hub vision.
  - Update `PROJECT_ROADMAP.md` to integrate Tool Registry/MCP readiness into extensibility track.
  - Add contract regression/compatibility checks to stability track.
- What must NOT change:
  - No production code changes.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `PROJECT_CONTEXT.md`
- `PROJECT_ROADMAP.md`

Out of scope:
- Any v10 production code edits
- Any pdf-builder repo edits

## Dependencies / constraints
- New dependencies allowed? NO
- Must remain consistent with `PROJECT_BLUEPRINT.md` and `GEMINI_CODEX_PROTOCOL.md`
- Must reflect task_071 contract direction without redefining schemas here

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `PROJECT_CONTEXT.md`에 “AI 교육허브” 비전 문구가 추가됨.
- [ ] `PROJECT_ROADMAP.md` Track B에 Tool Registry/MCP 준비 단계가 포함됨.
- [ ] `PROJECT_ROADMAP.md` Track C에 계약/정규화 회귀 점검이 포함됨.

## Manual verification steps (since no automated tests)
- 문서에서 변경된 문구가 명시되어 있는지 확인.

## Risks / roll-back notes
- Risk: 로드맵이 과밀해 보일 수 있음.
- Roll-back: 실행 순서를 유지한 채 항목을 서브노트로 축약.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `PROJECT_CONTEXT.md`
- `PROJECT_ROADMAP.md`

Commands run (only if user asked):
- None

Notes:
- Added AI hub vision statement and roadmap alignment items.
