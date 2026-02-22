# Task 504: AppLayout Runtime Slicing Stage 1 (fullscreen/clamp extraction)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `AppLayout.tsx`에서 fullscreen ink lifecycle 및 window clamp bounds 계산 책임을 분리해 hook/runtime 모듈로 추출한다.
  - Host renderer 역할(AppLayout은 조립/렌더 중심)로 수렴시키는 첫 단계 수행.
- What must NOT change:
  - 사용자 체감 레이아웃/도킹/툴바 동작 변경 금지.
  - panel policy/role policy 계약 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/runtime/useFullscreenInkLifecycle.ts` (new)
- `v10/src/features/chrome/layout/runtime/useWindowHostClampBounds.ts` (new)
- `v10/src/features/chrome/layout/runtime/index.ts` (new)
- `codex_tasks/task_504_applayout_runtime_slicing_stage1.md`

Out of scope:
- `WindowHost` 구조 변경
- 툴바 모드/액션 정책 변경
- mod runtime/selector 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 신규 runtime hook는 `features/chrome/layout` 하위에 두고 core/features 경계 위반 금지.
  - AppLayout은 runtime 계산 결과를 소비만 하도록 제한.
- Compatibility:
  - 데스크탑/태블릿/모바일 viewport 계약(`check_v10_viewport_contract.sh`) 통과 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-APP
- Depends on tasks:
  - `task_503`
- Enables tasks:
  - `task_508`
- Parallel group:
  - G-P6-SLICE-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (layout + windowing runtime interactions)
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - `~45min`
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES (task_507과 병렬 가능)
- Rationale:
  - AppLayout 단독 파일 잠금이 필요하며 내부 분해 작업량이 큼.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - AppLayout runtime slicing (single-owner file lock)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: AppLayout owner
    - Implementer-B: runtime hook extraction
    - Implementer-C: verification
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - `AppLayout.tsx` 단일 오너 잠금
  - Parallel slot plan:
    - max 3 slots
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - critical-path-first
    - Requested orchestration mode:
      - max orchestration mode off (default)
    - Initial slot split:
      - 2 implementers + 1 verifier
    - Ready-queue refill trigger:
      - runtime hook 추출 완료 후 AppLayout rewire 투입
    - Agent close/reuse policy:
      - 완료 즉시 close
    - Heartbeat policy:
      - Soft ping threshold: 120s
      - Reassignment threshold: 300s
      - Long-running exceptions: AppLayout merge/rebase conflict
    - Reassignment safety rule:
      - 코드 손실 방지용 stash/diff 확인 후 재할당
  - Delegated closeout metrics:
    - Peak active slots:
    - Average active slots:
    - Slot refill count:
    - Reassignment count:

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: AppLayout fullscreen lifecycle 관련 effect/handler가 `useFullscreenInkLifecycle`로 이동한다.
- [x] AC-2: AppLayout clamp bounds 계산/resize observer 로직이 `useWindowHostClampBounds`로 이동한다.
- [x] AC-3: `AppLayout.tsx` 라인 수가 baseline(845) 대비 감소한다.
- [x] AC-4: `bash scripts/check_v10_viewport_contract.sh` PASS.
- [x] AC-5: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "fullscreen|ResizeObserver|clampBounds|windowHostClamp" v10/src/features/chrome/layout/AppLayout.tsx v10/src/features/chrome/layout/runtime/*.ts`
   - Expected result:
     - 관련 핵심 로직이 runtime hook 파일로 이동.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `wc -l v10/src/features/chrome/layout/AppLayout.tsx`
   - Expected result:
     - 기존 845보다 감소.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `bash scripts/check_v10_viewport_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - fullscreen 종료 동기화 타이밍 회귀 가능.
  - clamp bounds 초기 계산 타이밍 회귀 가능.
- Roll-back:
  - AppLayout + runtime hooks 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/runtime/useFullscreenInkLifecycle.ts`
- `v10/src/features/chrome/layout/runtime/useWindowHostClampBounds.ts`
- `v10/src/features/chrome/layout/runtime/index.ts`

Commands run (only if user asked or required by spec):
- `rg -n "useFullscreenInkLifecycle|useWindowHostClampBounds|ResizeObserver|fullscreenchange" v10/src/features/chrome/layout/AppLayout.tsx v10/src/features/chrome/layout/runtime/*.ts`
- `wc -l v10/src/features/chrome/layout/AppLayout.tsx`
- `bash scripts/check_v10_viewport_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- ...
