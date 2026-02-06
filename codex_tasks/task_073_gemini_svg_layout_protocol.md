# Task 073: Gemini SVG Layout Protocol Update

Status: COMPLETED
Owner: Codex (spec)
Target: root docs
Date: 2026-02-06

## Goal
- What to change:
  - Update `GEMINI_CODEX_PROTOCOL.md` to define Gemini as a layout-structure SVG designer and Codex as the implementer.
  - Add an SVG handoff pipeline: Gemini produces SVG, Codex implements UI from SVG; SVG is design-only, not embedded in code.
  - Define required SVG contents (viewBox, layout ratios, component relationships, alignment rules, hierarchy).
- What must NOT change:
  - Gemini must not touch production code.
  - No production code edits or new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `GEMINI_CODEX_PROTOCOL.md`

Out of scope:
- Any v10 production code edits
- Any pdf-builder repo edits
- Creating or editing SVG artifacts (this is policy only)

## Dependencies / constraints
- New dependencies allowed? NO
- Must remain consistent with `AGENTS.md` and `PROJECT_BLUEPRINT.md`
- SVGs are design artifacts stored under `design_drafts/` only

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `GEMINI_CODEX_PROTOCOL.md`에 Gemini 역할이 “구조 시각화 엔진(SVG 설계자)”로 명시됨.
- [ ] Gemini의 출력이 SVG이며 코드 수정 금지임이 명시됨.
- [ ] Codex 역할이 “구현 엔진”이며 SVG+규칙을 입력으로 코드 구현만 수행함을 명시됨.
- [ ] SVG 파이프라인(생성→저장→Codex 구현)이 명시됨.
- [ ] SVG에 필수 요소(viewBox/레이아웃 비율/정렬 기준/컴포넌트 관계/계층 구조)가 명시됨.
- [ ] SVG는 코드에 직접 포함하지 않고 설계 문서로만 사용함이 명시됨.

## Manual verification steps (since no automated tests)
- 문서에서 역할/출력/파이프라인/필수 SVG 요소가 명확히 서술되었는지 확인.

## Risks / roll-back notes
- Risk: 역할 경계가 모호하면 Gemini가 코드 변경을 시도할 수 있음.
- Roll-back: 역할/출력/금지 행위를 더 명확히 재서술.

## Open questions
- 전역 기준 뷰포트 필요 여부:
  - 현재는 “각 SVG에 viewBox와 기준 크기 명시”로 규정하고,
  - 전역 기준이 필요하면 추가 정의한다.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `GEMINI_CODEX_PROTOCOL.md`

Commands run (only if user asked):
- None

Notes:
- Added SVG layout handoff protocol and role refinements.
