# Task 104: DataInputPanel Compromise UX Slice 2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-10

---

## Goal
- What to change:
  - DataInputPanel 블록 리스트를 기본 접힘(요약) + 선택 확장 방식으로 바꿔 스크롤 부담을 줄인다.
  - `간단/상세` 모드 토글을 pill 형태로 바꿔 선택 상태 인지성을 올린다.
  - Footer 액션 위계를 정리해 `적용`을 주 액션으로 강조하고 보조 액션을 분리한다.
  - Break 블록을 content 블록과 즉시 구분되는 스타일로 경량화한다.
- What must NOT change:
  - `syncBlocksFromRawText` 기반 비파괴 동기화 로직 변경 금지.
  - 저장 포맷/계약 및 `apply`, `auto layout`, `restore` 동작 의미 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_104_datainput_panel_compromise_ux_slice2.md`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Out of scope:
- `v10/src/features/chrome/layout/dataInput/blockDraft.ts`
- `v10/src/features/chrome/layout/dataInput/segmentCommands.ts`
- `v10/src/features/platform/hooks/**`
- `v10/src/features/chrome/toolbar/**`
- `v10/src/core/**`

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: YES
- [x] SVG path in `design_drafts/`:
  - `design_drafts/layout_datainput_1440x1080.svg`
  - `design_drafts/layout_drafting_room_768x1024.svg`
  - `design_drafts/layout_drafting_room_1024x768.svg`
  - `design_drafts/layout_writer_shell_820x1180.svg`
  - `design_drafts/layout_writer_shell_1180x820.svg`
- [x] SVG includes explicit `viewBox` (width / height / ratio label)
- [x] Tablet viewports considered (if applicable):
  - 768x1024 / 820x1180 / 1024x768 / 1180x820
- [x] Codex must verify SVG file exists before implementation

Redline notes (numeric):
- 블록 카드 접힘 높이 목표: `>= 64px`
- 터치 타겟 최소: `44x44` (모드 토글/헤더 핵심 액션/푸터 버튼)
- Break 블록 시각 구분: 경량 높이 `32~40px` 체감 + dashed 경계
- Footer 위계: 2열 그리드(보조/주요)에서 `적용` 시각 우선순위 1

---

## Dependencies / Constraints

- New dependencies allowed: NO
  - If YES, list and justify explicitly.
- Boundary rules:
  - UI 표현/상호작용 레이어(`DataInputPanel.tsx`) 내에서만 처리.
  - 데이터 변환 로직/스토어 인터페이스 변경 금지.
- Compatibility:
  - 기존 mobile tab 분기(`Input/Blocks`)는 유지.
  - unmatched block 복원/폐기 가드 유지.

---

## Speculative Defense Check (guardrail)

- [ ] Any defensive branches added: NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - N/A
  - Sunset criteria (when and how to remove):
    - N/A

---

## Documentation Update Check

- [ ] Structure changes (file/folder add/move/delete):
  - N/A
- [ ] Semantic / rule changes (layers, invariants, core flows):
  - `v10/AI_READ_ME.md` 업데이트 불필요 (규칙/계약 불변)

---

## Acceptance Criteria (must be testable)

- [x] AC-1: 블록 리스트가 기본 접힘 상태로 렌더되며, 블록별 열기/닫기가 동작한다.
- [x] AC-2: 접힘 상태에서 각 content 블록에 `Step + 한 줄 프리뷰`가 노출된다.
- [x] AC-3: `간단/상세` 토글이 pill 형태로 바뀌고 선택 상태가 시각적으로 명확하다.
- [x] AC-4: Footer 액션이 보조/주요 위계로 재배치되고 `캔버스에 적용`이 주 액션으로 강조된다.
- [x] AC-5: Break 블록이 content 블록과 즉시 구분되는 스타일로 표시된다.
- [x] AC-6: mobile tab(`xl:hidden`) 분기와 unmatched restore/discard + apply guard 동작이 유지된다.
- [x] AC-7: `cd v10 && npm run lint`에서 error 0.
- [x] AC-8: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

1) Step:
   - Command / click path:
     - `ls design_drafts | rg "layout_datainput_1440x1080.svg|layout_drafting_room_768x1024.svg|layout_drafting_room_1024x768.svg|layout_writer_shell_820x1180.svg|layout_writer_shell_1180x820.svg"`
   - Expected result: 5개 SVG 존재
   - Covers: AC-1, AC-3, AC-4, AC-5

2) Step:
   - Command / click path:
     - `rg -n "expandedBlock|preview|action_mode_compact|action_mode_advanced|xl:hidden|unmatched|캔버스에 적용|border-dashed" v10/src/features/chrome/layout/DataInputPanel.tsx`
   - Expected result: 접힘/프리뷰/토글/푸터 위계/Break 구분/기존 가드 경로 확인
   - Covers: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result: lint error 0
   - Covers: AC-7

4) Step:
   - Command / click path:
     - `git status --short -- v10/src/features/chrome/layout/DataInputPanel.tsx codex_tasks/task_104_datainput_panel_compromise_ux_slice2.md`
   - Expected result: scope 내 변경만 존재
   - Covers: AC-8

---

## Risks / Roll-back Notes

- Risks:
  - 기본 접힘으로 인해 초기 1회 탭 수가 증가할 수 있음.
  - 기존 사용자가 익숙한 즉시 전체 노출 패턴과 체감 차이가 생길 수 있음.
- Roll-back:
  - `v10/src/features/chrome/layout/DataInputPanel.tsx` 단일 파일 revert로 즉시 복구 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `codex_tasks/task_104_datainput_panel_compromise_ux_slice2.md`

Commands run (only if user asked or required by spec):
- `ls -1 design_drafts`
- `sed -n '1,260p' design_drafts/layout_datainput_1440x1080.svg`
- `sed -n '1,260p' design_drafts/layout_drafting_room_768x1024.svg`
- `sed -n '1,260p' design_drafts/layout_drafting_room_1024x768.svg`
- `sed -n '1,80p' design_drafts/layout_writer_shell_820x1180.svg`
- `sed -n '1,80p' design_drafts/layout_writer_shell_1180x820.svg`
- `nl -ba v10/src/features/chrome/layout/DataInputPanel.tsx | sed -n '1,480p'`
- `nl -ba v10/src/features/chrome/layout/DataInputPanel.tsx | sed -n '480,1120p'`
- `rg -n "expandedBlockId|blockPreview|action_mode_compact|action_mode_advanced|xl:hidden|unmatched|캔버스에 적용|border-dashed" v10/src/features/chrome/layout/DataInputPanel.tsx`
- `cd v10 && npm run lint`
- `ls design_drafts | rg "layout_datainput_1440x1080.svg|layout_drafting_room_768x1024.svg|layout_drafting_room_1024x768.svg|layout_writer_shell_820x1180.svg|layout_writer_shell_1180x820.svg"`
- `git status --short -- v10/src/features/chrome/layout/DataInputPanel.tsx codex_tasks/task_104_datainput_panel_compromise_ux_slice2.md`

Manual verification notes:
- AC-1: Passed. `expandedBlockId` 기반 단일 블록 접힘/확장 토글 경로 확인.
- AC-2: Passed. 접힘 카드에 `Step` + `blockPreview` 한 줄 표시 확인.
- AC-3: Passed. `action_mode_compact`/`action_mode_advanced` pill 토글 적용 확인.
- AC-4: Passed. Footer 2단 그리드로 보조/주요 액션 위계 분리 확인.
- AC-5: Passed. Break 카드 `border-dashed` + 경량 스타일 적용 확인.
- AC-6: Passed. `xl:hidden` 탭 분기와 unmatched 복원/폐기 + apply guard 유지 확인.
- AC-7: Passed. lint `0 errors` (`5 warnings` are pre-existing).
- AC-8: Passed. scope 내 파일만 변경 확인.

Notes:
- Skill trigger path `/home/sykaboom/.codex/skills/local/sy-slate-architecture-guardrails/SKILL.md` is missing in current runtime; fallback applied using repository guardrail rules.
