# Task 074: SVG Gate Policy (Template + AGENTS)

Status: COMPLETED
Owner: Codex (spec)
Target: root docs
Date: 2026-02-06

## Goal
- What to change:
  - Add a "Design Artifacts" section to `codex_tasks/_TEMPLATE_task.md` requiring SVG for layout/structure changes.
  - Add a hard gate in `AGENTS.md` that Codex must verify SVG exists before implementing layout/structure changes.
- What must NOT change:
  - No production code changes.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `codex_tasks/_TEMPLATE_task.md`
- `AGENTS.md`

Out of scope:
- Any v10 production code edits
- Any design_drafts/ SVG creation (policy only)

## Dependencies / constraints
- New dependencies allowed? NO
- Must be consistent with `GEMINI_CODEX_PROTOCOL.md`
- Gate applies only to layout/structure changes

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] `_TEMPLATE_task.md`에 Design Artifacts 섹션이 추가됨.
- [ ] 해당 섹션에 “레이아웃/구조 변경 시 SVG 경로 필수”가 명시됨.
- [ ] `AGENTS.md`에 “SVG 없으면 구현 금지” 규칙이 추가됨.

## Manual verification steps (since no automated tests)
- 템플릿과 AGENTS 문서에서 새 규칙이 보이는지 확인.

## Risks / roll-back notes
- Risk: 간단한 수정에도 SVG 요구로 느껴질 수 있음.
- Roll-back: 적용 범위를 더 좁게 정의.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `codex_tasks/_TEMPLATE_task.md`
- `AGENTS.md`

Commands run (only if user asked):
- None

Notes:
- Added SVG gate to template and AGENTS rules.
