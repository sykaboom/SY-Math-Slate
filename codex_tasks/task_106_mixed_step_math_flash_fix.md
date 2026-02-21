# Task 106: Mixed Step Math Flash Fix

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-10

---

## Goal
- What to change:
  - 혼합 스텝(텍스트+수식) 재생 시작 시 수식이 먼저 보였다가 수식 페이즈에서 다시 나타나는 선노출 깜박임을 제거한다.
  - `RichTextAnimator`에서 active playback 준비 단계에 수식 run을 즉시 숨긴 상태로 priming 한다.
- What must NOT change:
  - text / highlight / math 페이즈 순서와 각 duration 계산 로직 변경 금지.
  - `compileAnimationPlan`의 run 분해 계약(type/mode/runs) 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_106_mixed_step_math_flash_fix.md`
- `v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`

Out of scope:
- `v10/src/features/editor/animation/runtime/playAnimationPlan.ts`
- `v10/src/features/editor/animation/plan/compileAnimationPlan.ts`
- `v10/src/features/platform/hooks/useSequence.ts`
- `v10/src/core/**`

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox` (width / height / ratio label): N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints

- New dependencies allowed: NO
  - If YES, list and justify explicitly.
- Boundary rules:
  - 수정은 `RichTextAnimator` 표시 초기화 경로에만 한정.
  - 런타임 플레이어(`playAnimationPlan`) 알고리즘은 불변.
- Compatibility:
  - 텍스트-only / 수식-only / 혼합 모드 모두 기존 완료(onDone) 시점 의미 유지.
  - skip/stop/pause 제어 계약 유지.

---

## Agent Assignment (execution planning)

- Execution mode: DELEGATED
- If delegated, chain scope:
  - `task_106` mixed-step animation hotpath fix
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: Codex
  - Implementer-B: Codex (reserved, inactive for single-file scope)
  - Implementer-C: Codex (reserved, inactive for single-file scope)
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `RichTextAnimator.tsx` 단일 소유 잠금.

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
  - N/A
- [x] Semantic / rule changes (layers, invariants, core flows):
  - N/A (animation contract 불변)

---

## Acceptance Criteria (must be testable)

- [x] AC-1: active 상태에서 plan compile 완료 직후 math run이 즉시 hidden priming되어 선노출 프레임이 발생하지 않는다.
- [x] AC-2: mixed 모드에서 math run은 text/highlight 페이즈 이후 math 페이즈에서만 visible 전환된다.
- [x] AC-3: non-active 렌더 경로는 기존처럼 전체 reveal 상태를 유지한다.
- [x] AC-4: skip/stop 시 최종 reveal 및 onDone/cleanup 계약 회귀가 없다.
- [x] AC-5: `cd v10 && npm run lint` error 0.
- [x] AC-6: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

1) Step:
   - Command / click path:
     - `rg -n "prime|prepare|visibility|opacity|isActive|revealRuns|compileAnimationPlan" v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`
   - Expected result:
     - active compile 완료 시점에 run 숨김 priming 호출 경로가 보인다.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path:
     - `rg -n "skip|stop|onDone|setPaused" v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`
   - Expected result:
     - skip/stop/onDone/pause 관련 기존 제어 경로가 유지된다.
   - Covers: AC-4

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - error 0
   - Covers: AC-5

4) Step:
   - Command / click path:
     - `git status --short -- v10/src/features/editor/canvas/animation/RichTextAnimator.tsx codex_tasks/task_106_mixed_step_math_flash_fix.md`
   - Expected result:
     - scope 내 파일만 변경
   - Covers: AC-6

---

## Risks / Roll-back Notes

- Risks:
  - 과도한 초기 숨김 처리 시 non-active 상태 가시성까지 영향을 줄 수 있음.
- Roll-back:
  - `v10/src/features/editor/canvas/animation/RichTextAnimator.tsx` revert로 즉시 복구.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received - delegated mode approval: "앞으로는 위임모드로 진행한다. 승인,구현."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`
- `codex_tasks/task_106_mixed_step_math_flash_fix.md`

Commands run (only if user asked or required by spec):
- `ls codex_tasks | rg '^task_[0-9]+' | sed -E 's/^task_([0-9]+).*/\1/' | sort -n | tail -n 12`
- `rg -n "mixed|math|reveal|phase|step|blink|flash|visible|opacity" v10/src/features/editor/animation v10/src/features/editor/canvas/animation v10/src/features/platform/hooks/useSequence.ts`
- `sed -n '1,240p' v10/src/features/editor/animation/plan/compileAnimationPlan.ts`
- `sed -n '1,520p' v10/src/features/editor/animation/runtime/playAnimationPlan.ts`
- `sed -n '1,320p' v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`
- `rg -n "tw-char|tw-visible|hl-temporary|mjx-container|visibility" v10/src/app/globals.css v10/src/**/*.css v10/src/features/editor/canvas/animation`
- `sed -n '270,330p' v10/src/app/globals.css`
- `sed -n '1,260p' v10/src/core/math/render.ts`
- `rg -n "primeRunsForActivePlayback|visibility|opacity|isActive|revealRuns|compileAnimationPlan" v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`
- `rg -n "skip|stop|onDone|setPaused" v10/src/features/editor/canvas/animation/RichTextAnimator.tsx`
- `if [ -x scripts/check_layer_rules.sh ]; then scripts/check_layer_rules.sh; else echo "N/A: scripts/check_layer_rules.sh not found"; fi`
- `cd v10 && npm run lint`
- `git status --short -- v10/src/features/editor/canvas/animation/RichTextAnimator.tsx codex_tasks/task_106_mixed_step_math_flash_fix.md`
- `git status --short --branch`

## Gate Results (Codex fills)

- Lint:
  - PASS (`0 errors, 5 warnings`)
- Build:
  - N/A
- Script checks:
  - N/A (`scripts/check_layer_rules.sh` not found)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ESLint warnings 5건 (scope 외 기존 경고)
  - 워크트리의 scope 외 변경(`v10/src/features/chrome/layout/DataInputPanel.tsx`, `codex_tasks/task_105_datainput_font_edit_ui_refine.md`)은 본 태스크 시작 전부터 존재
- Newly introduced failures:
  - 없음
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1: Passed. compile 완료 즉시 `primeRunsForActivePlayback`를 호출해 math run `visibility:hidden`, `opacity:0`을 먼저 적용하도록 확인.
- AC-2: Passed. mixed 경로에서 math run은 runtime의 math phase에서만 visibility/opacity 복원되는 기존 경로 유지 확인.
- AC-3: Passed. non-active 분기에서는 `revealRuns`를 유지해 전체 reveal 상태가 유지됨을 확인.
- AC-4: Passed. `setPaused`, `skip`, `stop`, `onDone` 제어 경로 미변경 확인.
- AC-5: Passed. lint `0 errors`.
- AC-6: Passed. 본 태스크 신규 수정은 scope 파일 2개만 반영(기존 dirty 파일은 pre-existing으로 분류).

Notes:
- 혼합 스텝 시작 시 수식 선노출 후 재등장 문제를 active compile 직후 priming으로 차단.
