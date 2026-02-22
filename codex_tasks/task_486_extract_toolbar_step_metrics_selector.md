# Task 486: Extract Toolbar Step Metrics Selector (Deduplicate Step Math)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - toolbar 계열 컴포넌트에 중복된 `maxStep/totalSteps/displayStep/canStepNext` 계산을 공용 selector/helper로 통합한다.
- What must NOT change:
  - step navigation 버튼 활성/비활성 기준 및 표시 숫자는 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- 신규 helper 1개 (예: `v10/src/features/chrome/toolbar/lib/stepMetrics.ts`)
- `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (필요 시 only)

Out of scope:
- `PlayerBar`, `ViewerShell` 등 비-toolbar 영역 step 계산 리팩토링
- step store 구조 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - toolbar 내부 공용 helper만 도입한다.
  - useCanvasStore action/state shape 변경 금지.
- Compatibility:
  - 단계 표시/진행/슬라이더 계산 결과 동등성 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - CW1
- Depends on tasks:
  - []
- Enables tasks:
  - []
- Parallel group:
  - G-cleanup-toolbar
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~5
- Files shared with other PENDING tasks:
  - `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
  - `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
  - `v10/src/features/chrome/toolbar/MorePanel.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
  - 같은 toolbar 파일 잠금이 있는 태스크와 동시 실행 금지
- Rationale:
  - 중복 제거 효과가 크지만 동일 파일군 충돌이 있어 단일 소유가 안전하다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [ ] Semantic/rule changes:
  - N/A (dedup-only)

---

## Acceptance Criteria (Base Required)

- [x] AC-1: toolbar step 계산이 공용 helper로 수렴된다.
- [x] AC-2: `PlaybackModeTools`, `PlaybackControls`, `MorePanel`의 step 표기/활성화 결과가 동일하다.
- [x] AC-3: `scripts/check_layer_rules.sh` 통과.
- [x] AC-4: `cd v10 && npm run lint && npm run build` 통과.
- [x] AC-5: `node scripts/gen_ai_read_me_map.mjs` 실행 후 문서 동기화 상태가 유지된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "const maxStep|totalSteps|displayStep|canStepNext" v10/src/features/chrome/toolbar/{PlaybackModeTools.tsx,PlaybackControls.tsx,MorePanel.tsx,FloatingToolbar.tsx}`
   - Expected result:
     - 중복 inline 계산 블록이 축소됨
   - Covers: AC-1

2) Step:
   - Command / click path:
     - 앱에서 step prev/next, jump, 표시 숫자 비교
   - Expected result:
     - 기존과 동일
   - Covers: AC-2

3) Step:
   - Command / click path:
    - `scripts/check_layer_rules.sh`
   - Expected result:
    - PASS
   - Covers: AC-3

4) Step:
   - Command / click path:
    - `cd v10 && npm run lint && npm run build`
   - Expected result:
    - PASS
   - Covers: AC-4

5) Step:
   - Command / click path:
    - `node scripts/gen_ai_read_me_map.mjs`
   - Expected result:
    - 명령 성공 + 문서 변경 필요 시 반영
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - helper 파라미터 매핑 실수 시 off-by-one 회귀 가능.
- Roll-back:
  - helper 도입 commit revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/lib/stepMetrics.ts` (new)
- `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/AI_READ_ME_MAP.md` (generated)
- `codex_tasks/task_486_extract_toolbar_step_metrics_selector.md`

Commands run (only if user asked or required by spec):
- `rg -n "const maxStep|totalSteps|displayStep|canStepNext" v10/src/features/chrome/toolbar/{PlaybackModeTools.tsx,PlaybackControls.tsx,MorePanel.tsx,FloatingToolbar.tsx}`
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`
- `node scripts/gen_ai_read_me_map.mjs`

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`scripts/check_layer_rules.sh`)
  - PASS (`node scripts/gen_ai_read_me_map.mjs`)

Manual verification notes:
- `rg` 결과: 대상 toolbar 파일에서 inline `const maxStep` 계산 블록 제거, helper 기반 참조로 수렴 확인.
- `PlaybackControls`는 기존 `stepBlocks.length > 0` 우선 계산을 helper 옵션으로 유지.
- `canStepPrev/canStepNext/totalSteps/displayStep/slider` 계산식은 동일 수식으로 helper에 이전되어 동작 동등성 유지.
- 앱 수동 클릭 검증(step prev/next/jump)은 본 CLI 세션에서 미실행.

Notes:
- Failure classification:
  - Newly introduced: 없음
  - Pre-existing: 없음 (본 태스크 게이트 기준)
  - Blocking: 없음
  - Non-blocking: 없음
