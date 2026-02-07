# Task 089: Lint Debt Cleanup Batch 1 (Error-First)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-08

---

## Goal
- What to change:
  - 현재 누적된 ESLint `error` 항목을 우선 제거한다.
  - 동작 변경 없이 lint 규칙 위반만 정리한다.
  - 이후 warning 정리는 후속 배치로 분리한다.
- What must NOT change:
  - 기능/UX 동작 변경 금지.
  - 신규 dependency 추가 금지.
  - 스키마/프로토콜 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_089_lint_debt_cleanup_batch1.md`
- `v10/src/core/math/rules.ts`
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/canvas/PasteHelperModal.tsx`
- `v10/src/features/canvas/animation/RichTextAnimator.tsx`
- `v10/src/features/hooks/useSequence.ts`

Out of scope:
- warning-only 파일 수정
- `v10/src/features/layout/**` 수정
- UI 스타일/레이아웃 변경
- 로직 리팩터링 확장

---

## Design Artifacts (required for layout/structure changes)
- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox`: N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints
- New dependencies allowed: NO
- Boundary rules:
  - 동작 동일성 유지
  - layer rule 위반 금지
  - 임시 우회 코드(`eslint-disable` 남발) 금지

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`cd v10 && npm run lint` 실제 에러 리포트)
- [x] Sunset criteria: N/A

---

## Documentation Update Check
- [ ] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md` 반영 확인
- [ ] Semantic/rule changes:
  - `v10/AI_READ_ME.md` 업데이트 필요성 확인

---

## Acceptance Criteria (must be testable)
- [ ] AC-1: Scope 내 6개 파일의 기존 ESLint `error`가 제거된다.
- [ ] AC-2: `cd v10 && npm run lint` 실행 시 `error`가 0건이다.
- [ ] AC-3: 동작 변경(런타임 기능 변경)이 없다.
- [ ] AC-4: Scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) Lint error check
   - Command / path: `cd v10 && npm run lint`
   - Expected result: `error` 0건
   - Covers: AC-1, AC-2

2) Scope audit
   - Command / path: `git status --short`, `git diff --name-only`
   - Expected result: scope 목록 파일만 변경
   - Covers: AC-4

3) Behavior sanity
   - Command / click path: 주요 편집/재생 플로우 smoke check
   - Expected result: 사용자 관점 동작 변화 없음
   - Covers: AC-3

---

## Risks / Roll-back Notes
- Risks:
  - lint 수정 중 로직 변화가 섞일 위험
  - 특정 rule 대응이 구조 변경으로 번질 위험
- Roll-back:
  - 파일 단위로 작은 커밋 유지
  - 문제 파일만 선택 revert 가능하도록 작업

---

## Approval Gate (mandatory)
- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: PENDING

Changed files:
- `codex_tasks/task_089_lint_debt_cleanup_batch1.md`

Commands run:
- None

Notes:
- Error-first cleanup batch. Warnings are deferred to follow-up batch.
