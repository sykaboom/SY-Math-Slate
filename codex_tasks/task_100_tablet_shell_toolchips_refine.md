# Task 100: Tablet Shell + Toolchips Refinement

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - 태블릿/웹에서 상단 크롬을 더 압축해 캔버스 가시 영역을 늘린다.
  - 하단 툴칩의 터치 타겟을 최소 44px 기준으로 맞춘다.
  - 전체화면 필기 진입 액션을 하단 툴칩에서도 즉시 접근 가능하게 만든다.
- What must NOT change:
  - canvas 렌더링 알고리즘 변경 금지.
  - 신규 dependency 추가 금지.
  - provider/contract 계층 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_100_tablet_shell_toolchips_refine.md`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/atoms/ToolButton.tsx`

Out of scope:
- `v10/src/features/hooks/**`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/core/**`

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: YES
- [x] SVG path in `design_drafts/`:
  - `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
  - `design_drafts/layout_tablet_landscape_controls_1180x820.svg`
  - `design_drafts/layout_web_chrome_resize_guard_1440x1080.svg`
- [x] SVG includes explicit `viewBox` (width / height / ratio label)
- [x] Tablet viewports considered (if applicable):
  - 768x1024 / 820x1180 / 1024x768 / 1180x820
- [x] Codex must verify SVG file exists before implementation

---

## Dependencies / Constraints

- New dependencies allowed: NO
- Boundary rules:
  - 구조 변경은 `layout`/`toolbar` 레이어에 한정.
  - 상태 저장 구조(store schema) 변경 금지.
- Compatibility:
  - 기존 `fullscreenInkMode` 동작(`native | app | off`) 유지.

---

## Agent Assignment (execution planning)

- Execution mode: DELEGATED
- If delegated, chain scope:
  - `task_100` ~ `task_102`
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: UI shell/toolbar worker
  - Implementer-B: N/A
  - Implementer-C: N/A
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `AppLayout.tsx`, `FloatingToolbar.tsx`, `ToolButton.tsx`는 단일 구현자 소유.

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

- [x] AC-1: 상단 헤더가 태블릿에서 압축 모드(정보 밀도 축소)로 동작한다.
- [x] AC-2: 주요 툴칩 버튼의 터치 타겟이 최소 44px 이상이다.
- [x] AC-3: 전체화면 필기 진입 액션이 하단 툴칩에서도 접근 가능하다.
- [x] AC-4: `cd v10 && npm run lint`에서 error 0.
- [x] AC-5: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

1) SVG gate 확인:
   - Command / click path: `ls design_drafts | rg "layout_tablet_ink_fullscreen_768x1024.svg|layout_tablet_landscape_controls_1180x820.svg|layout_web_chrome_resize_guard_1440x1080.svg"`
   - Expected result: 3개 SVG 존재
   - Covers: AC-1, AC-2, AC-3

2) 코드 확인:
   - Command / click path: `rg -n "fullscreen|h-11|h-12|ToolButton|action_enter_fullscreen_ink" v10/src/features/layout/AppLayout.tsx v10/src/features/toolbar/FloatingToolbar.tsx v10/src/features/toolbar/atoms/ToolButton.tsx`
   - Expected result: 타겟/액션 경로 확인
   - Covers: AC-1, AC-2, AC-3

3) 품질/범위 확인:
   - Command / click path: `cd v10 && npm run lint`, `git status --short -- v10/src/features/layout/AppLayout.tsx v10/src/features/toolbar/FloatingToolbar.tsx v10/src/features/toolbar/atoms/ToolButton.tsx codex_tasks/task_100_tablet_shell_toolchips_refine.md`
   - Expected result: lint error 0, scope 내 변경
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes

- Risks:
  - 툴칩 확대로 하단 혼잡이 증가할 수 있음.
- Roll-back:
  - 3개 파일 단위 revert로 즉시 복귀 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_100_tablet_shell_toolchips_refine.md`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/atoms/ToolButton.tsx`

Commands run (only if user asked or required by spec):
- `sed -n '1,360p' v10/src/features/layout/AppLayout.tsx`
- `sed -n '1,360p' v10/src/features/toolbar/FloatingToolbar.tsx`
- `sed -n '1,260p' v10/src/features/toolbar/atoms/ToolButton.tsx`
- `ls design_drafts | rg "layout_tablet_ink_fullscreen_768x1024.svg|layout_tablet_landscape_controls_1180x820.svg|layout_web_chrome_resize_guard_1440x1080.svg"`
- `cd v10 && npm run lint`
- `cd v10 && npm run build` (sandbox 제한으로 escalated 재실행 1회 포함)
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
- 상단 헤더 높이/정보 밀도 축소 확인.
- 툴칩 기본 크기 `44x44`(`ToolButton h-11 w-11`) 확인.
- 하단 툴칩에 fullscreen enter/exit 액션 경로 추가 확인.

Notes:
- 본 태스크는 태블릿 첫 화면 사용성 향상을 위한 shell/toolchip 소배치다.
