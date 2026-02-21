# Task 102: DataInput Panel Compact UX Slice 1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - DataInputPanel의 세그먼트 편집 UI 밀도를 줄여 태블릿 조작성을 개선한다.
  - 기본 모드에서 고빈도 액션 중심으로 보이고, 상세 서식은 토글로 열도록 만든다.
  - 버튼 크기를 터치 친화적으로 상향한다.
- What must NOT change:
  - 비파괴 동기화 로직(`syncBlocksFromRawText`) 훼손 금지.
  - 저장 포맷/계약 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_102_datainput_panel_compact_ux_slice1.md`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Out of scope:
- `v10/src/features/chrome/layout/dataInput/blockDraft.ts`
- `v10/src/features/chrome/layout/dataInput/segmentCommands.ts`
- `v10/src/features/chrome/toolbar/**`
- `v10/src/core/**`

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: YES
- [x] SVG path in `design_drafts/`:
  - `design_drafts/layout_drafting_room_768x1024.svg`
  - `design_drafts/layout_drafting_room_1024x768.svg`
  - `design_drafts/layout_datainput_1440x1080.svg`
- [x] SVG includes explicit `viewBox` (width / height / ratio label)
- [x] Tablet viewports considered (if applicable):
  - 768x1024 / 820x1180 / 1024x768 / 1180x820
- [x] Codex must verify SVG file exists before implementation

---

## Dependencies / Constraints

- New dependencies allowed: NO
- Boundary rules:
  - 데이터 변환/동기화 로직은 변경하지 않고 UI 표현/조작층만 조정.
- Compatibility:
  - 기존 `apply`, `auto layout`, `restore`, `unmatchedBlocks` 동작 유지.

---

## Agent Assignment (execution planning)

- Execution mode: DELEGATED
- If delegated, chain scope:
  - `task_100` ~ `task_102`
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: N/A
  - Implementer-B: N/A
  - Implementer-C: DataInput worker
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `DataInputPanel.tsx` 단일 구현자 소유.

---

## Speculative Defense Check (guardrail)

- [x] Any defensive branches added: NO

---

## Documentation Update Check

- [x] Structure changes (file/folder add/move/delete):
  - N/A
- [x] Semantic / rule changes (layers, invariants, core flows):
  - 변경 없음 (`v10/AI_READ_ME.md` 업데이트 불필요)

---

## Acceptance Criteria (must be testable)

- [x] AC-1: DataInputPanel에 `간단/상세`(compact/advanced) UI 제어가 추가된다.
- [x] AC-2: 기본(compact) 모드에서 세그먼트당 조작 밀도가 줄어 스크롤 부담이 완화된다.
- [x] AC-3: 주요 버튼 높이가 태블릿 터치 기준(약 40~44px)으로 상향된다.
- [x] AC-4: unmatched block 복원/폐기, apply/auto-layout 동작이 유지된다.
- [x] AC-5: `cd v10 && npm run lint`에서 error 0.
- [x] AC-6: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

1) SVG gate 확인:
   - Command / click path: `ls design_drafts | rg "layout_drafting_room_768x1024.svg|layout_drafting_room_1024x768.svg|layout_datainput_1440x1080.svg"`
   - Expected result: 3개 SVG 존재
   - Covers: AC-1, AC-2, AC-3

2) 코드 경로 확인:
   - Command / click path: `rg -n "compact|advanced|h-9|h-10|h-11|unmatched|handleApply|handleAutoLayout" v10/src/features/chrome/layout/DataInputPanel.tsx`
   - Expected result: compact 토글/터치 타겟/핵심 동작 경로 존재
   - Covers: AC-1, AC-2, AC-3, AC-4

3) 품질/범위 확인:
   - Command / click path: `cd v10 && npm run lint`, `git status --short -- v10/src/features/chrome/layout/DataInputPanel.tsx codex_tasks/task_102_datainput_panel_compact_ux_slice1.md`
   - Expected result: lint error 0, scope 내 변경
   - Covers: AC-5, AC-6

---

## Risks / Roll-back Notes

- Risks:
  - 서식 버튼 숨김으로 일부 고급 편집 접근성이 일시적으로 떨어질 수 있음.
- Roll-back:
  - `DataInputPanel.tsx` 단일 파일 revert로 즉시 복구 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_102_datainput_panel_compact_ux_slice1.md`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `sed -n '1,1260p' v10/src/features/chrome/layout/DataInputPanel.tsx`
- `ls design_drafts | rg "layout_drafting_room_768x1024.svg|layout_drafting_room_1024x768.svg|layout_datainput_1440x1080.svg"`
- `rg -n "compact|advanced|h-9|h-10|h-11|unmatched|handleApply|handleAutoLayout" v10/src/features/chrome/layout/DataInputPanel.tsx`
- `cd v10 && npm run lint`
- `cd v10 && npm run build` (escalated)
- `./scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS (`0 errors, 7 warnings`)
- Build:
  - PASS (escalated 실행)
- Script checks:
  - `scripts/check_layer_rules.sh` 미존재로 N/A
  - `./scripts/run_repo_verifications.sh` 실행 결과: `[verify-sh] No verification scripts matched.`

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warning 7건 (본 태스크 범위 외 기존 경고 포함)
- Newly introduced failures:
  - 없음
- Blocking:
  - 없음
- Mitigation:
  - N/A

Manual verification notes:
- `간단/상세` 전역 토글(`action_mode_compact`, `action_mode_advanced`) 추가 확인.
- 기본 모드에서 고밀도 서식(색상/사이즈) 숨김, 상세 모드에서만 노출 확인.
- 핵심 액션 버튼 높이 `h-10/h-11`로 상향, unmatched 복원/폐기 및 apply/auto-layout 동작 유지 확인.

Notes:
- 본 태스크는 데이터 패널의 정보 밀도/터치 조작성 개선 소배치다.
