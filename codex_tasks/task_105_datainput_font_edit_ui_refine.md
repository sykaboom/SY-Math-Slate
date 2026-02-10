# Task 105: DataInput Font Edit UI Refine

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-10

---

## Goal
- What to change:
  - DataInputPanel 텍스트 세그먼트의 폰트 수정 UI를 조작성 중심으로 재구성한다.
  - 폰트 컨트롤을 `빠른 편집(기본)` + `상세 편집(선택)` 구조로 분리해 과밀도를 줄인다.
  - 글꼴 크기 제어를 즉시 반응하는 증감 버튼(`A-`, `A+`)으로 제공하고 현재 크기 값을 명확히 표시한다.
- What must NOT change:
  - `syncBlocksFromRawText` 기반 비파괴 동기화 로직 변경 금지.
  - 저장 포맷/계약(`TextSegment.style` 구조 포함) 변경 금지.
  - `apply`, `auto layout`, `restore`, `unmatched` 가드 동작 의미 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_105_datainput_font_edit_ui_refine.md`
- `v10/src/features/layout/DataInputPanel.tsx`

Out of scope:
- `v10/src/features/layout/dataInput/blockDraft.ts`
- `v10/src/features/layout/dataInput/segmentCommands.ts`
- `v10/src/core/config/typography.ts`
- `v10/src/features/store/**`
- `v10/src/core/**` (contracts/types 변경 금지)

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
- 폰트 제어 버튼 터치 타겟: `>= 44x44`
- 빠른 편집 영역 기본 행 수: `최대 2행`
- 제어 그룹 간 간격: `8px` 기준 유지
- 크기 증감 1회 단위: `2px`, 최소 `16px`, 최대 `72px`

---

## Dependencies / Constraints

- New dependencies allowed: NO
  - If YES, list and justify explicitly.
- Boundary rules:
  - UI 표현/상호작용 레이어(`DataInputPanel.tsx`) 내에서만 처리.
  - 텍스트 스타일은 기존 `normalizeTextSegmentStyle` 입력 제약 안에서만 갱신.
- Compatibility:
  - 기존 `간단/상세` 전역 토글 의미 유지.
  - 기존 인라인 서식(`B`, `$$`, `HL`, 색상/크기 클래스) 동작 유지.

---

## Agent Assignment (execution planning)

- Execution mode: DELEGATED
- If delegated, chain scope:
  - `task_105` (font edit UI refinement)
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: Codex
  - Implementer-B: Codex (reserved, inactive for this single-file scope)
  - Implementer-C: Codex (reserved, inactive for this single-file scope)
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `DataInputPanel.tsx` 단일 소유 잠금(Implementer-A only). 충돌 시 순차 실행 유지.

---

## Speculative Defense Check (guardrail)

- [x] Any defensive branches added: NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - N/A
  - Sunset criteria (when and how to remove):
    - N/A

---

## Documentation Update Check

- [x] Structure changes (file/folder add/move/delete):
  - N/A (구조 변경 없음 예상)
- [x] Semantic / rule changes (layers, invariants, core flows):
  - `v10/AI_READ_ME.md` 업데이트 불필요 예상 (규칙/계약 불변)

---

## Acceptance Criteria (must be testable)

- [x] AC-1: 확장된 텍스트 세그먼트에 폰트 `빠른 편집` 영역이 보이고, 현재 폰트 크기 값이 노출된다.
- [x] AC-2: `A-`/`A+` 조작으로 폰트 크기가 2px 단위로 즉시 변경되며 최소/최대 범위에서 clamp 된다.
- [x] AC-3: 폰트 패밀리 선택 UI가 현재보다 단순화되며(한 줄 구성), compact 모드 기준 과밀도가 감소한다.
- [x] AC-4: 기존 인라인 서식 버튼(`B`, `$$`, `HL`)과 advanced 색상/크기 클래스 동작이 유지된다.
- [x] AC-5: unmatched 복원/폐기, apply/auto-layout/restore 동작 회귀가 없다.
- [x] AC-6: `cd v10 && npm run lint` 결과 error 0.
- [x] AC-7: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

1) Step:
   - Command / click path:
     - `ls design_drafts | rg "layout_datainput_1440x1080.svg|layout_drafting_room_768x1024.svg|layout_drafting_room_1024x768.svg|layout_writer_shell_820x1180.svg|layout_writer_shell_1180x820.svg"`
   - Expected result: 레이아웃 게이트 SVG 5개 존재
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path:
     - `rg -n "A-|A\\+|fontSize|isAdvancedControls|TEXT_FONT_FAMILY_OPTIONS|wrapSelectionWithClass|handleApply|handleAutoLayout|unmatched" v10/src/features/layout/DataInputPanel.tsx`
   - Expected result: 폰트 빠른 편집/범위 제어/기존 핵심 동작 경로 확인
   - Covers: AC-1, AC-2, AC-3, AC-4, AC-5

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result: error 0
   - Covers: AC-6

4) Step:
   - Command / click path:
     - `git status --short -- v10/src/features/layout/DataInputPanel.tsx codex_tasks/task_105_datainput_font_edit_ui_refine.md`
   - Expected result: scope 내 파일만 변경
   - Covers: AC-7

---

## Risks / Roll-back Notes

- Risks:
  - 폰트 제어 단순화 과정에서 기존 사용자의 조작 습관과 충돌할 수 있음.
  - 크기 증감 단위가 체감과 다르면 반복 탭이 늘 수 있음.
- Roll-back:
  - `v10/src/features/layout/DataInputPanel.tsx` 단일 파일 revert로 이전 폰트 UI 복구 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received - user message: "앞으로는 위임모드로 진행한다. 승인,구현."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/layout/DataInputPanel.tsx`
- `codex_tasks/task_105_datainput_font_edit_ui_refine.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_104_datainput_panel_compromise_ux_slice2.md`
- `sed -n '1,340p' v10/src/features/layout/DataInputPanel.tsx`
- `sed -n '1,260p' /home/sykab/.codex/skills/sy-slate-architecture-guardrails/SKILL.md`
- `rg -n "간단|상세|캔버스에 적용|블록|preview|expandedBlockId|footer|action" v10/src/features/layout/DataInputPanel.tsx`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '340,920p'`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '920,1320p'`
- `ls -1 design_drafts`
- `sed -n '1,240p' v10/src/core/config/typography.ts`
- `rg -n "type TextSegmentStyle|interface TextSegmentStyle" v10/src/core/types/canvas.ts`
- `sed -n '1,260p' v10/src/core/types/canvas.ts`
- `rg -n "createTextSegment|fontSize|fontFamily|normalizeTextSegmentStyle" v10/src/features/layout/dataInput/blockDraft.ts`
- `sed -n '1,260p' v10/src/features/layout/dataInput/blockDraft.ts`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '1,140p'`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '320,420p'`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '860,1020p'`
- `rg -n "FONT_SIZE|adjustTextSegmentFontSize|A-|A\\+|폰트 크기" v10/src/features/layout/DataInputPanel.tsx`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '1,120p'`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '350,450p'`
- `nl -ba v10/src/features/layout/DataInputPanel.tsx | sed -n '880,1060p'`
- `ls design_drafts | rg "layout_datainput_1440x1080.svg|layout_drafting_room_768x1024.svg|layout_drafting_room_1024x768.svg|layout_writer_shell_820x1180.svg|layout_writer_shell_1180x820.svg"`
- `rg -n "A-|A\\+|fontSize|isAdvancedControls|TEXT_FONT_FAMILY_OPTIONS|wrapSelectionWithClass|handleApply|handleAutoLayout|unmatched" v10/src/features/layout/DataInputPanel.tsx`
- `if [ -x scripts/check_layer_rules.sh ]; then scripts/check_layer_rules.sh; else echo "N/A: scripts/check_layer_rules.sh not found"; fi`
- `cd v10 && npm run lint`
- `git status --short -- v10/src/features/layout/DataInputPanel.tsx codex_tasks/task_105_datainput_font_edit_ui_refine.md`

## Gate Results (Codex fills)

- Lint:
  - PASS (`0 errors, 5 warnings`)
- Build:
  - N/A
- Script checks:
  - N/A (`scripts/check_layer_rules.sh` 없음)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ESLint warnings 5건 (scope 외 기존 경고)
- Newly introduced failures:
  - 없음
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1: Passed. 텍스트 세그먼트에 폰트 빠른 편집 행이 노출되고 현재 크기(px) 표시 확인.
- AC-2: Passed. `A-`/`A+`로 `2px` 증감 및 `16~72px` clamp 경로(`adjustTextSegmentFontSize`) 확인.
- AC-3: Passed. 폰트 패밀리 선택을 빠른 편집 한 줄로 단순화하고 compact 모드 과밀도 감소 확인.
- AC-4: Passed. `B`, `$$`, `HL`, advanced 색상/크기 클래스 버튼 경로 유지 확인.
- AC-5: Passed. `handleApply`, `handleAutoLayout`, unmatched guard 경로 유지 확인.
- AC-6: Passed. `cd v10 && npm run lint` 결과 `0 errors`.
- AC-7: Passed. 변경 파일이 scope 내 2개 파일만 해당함.

Notes:
- 위임모드 체인(`task_105`)으로 실행했으며 단일 파일 소유 잠금 규칙을 유지했다.
