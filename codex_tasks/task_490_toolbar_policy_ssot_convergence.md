# Task 490: Toolbar Policy SSOT 수렴 (Core Resolver 단일 경로)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 툴바 최종 계획(`ResolvedToolbarPlan`) 결정 경로를 core package selector 단일 경로로 수렴한다.
  - `features/chrome/toolbar/catalog` 내 중복 정책/합성 로직(`toolbarActionSelectors`, `toolbarSurfacePolicy`)을 제거한다.
- What must NOT change:
  - 사용자 관점의 툴바 동작/표시 정책 회귀 금지.
  - 모드 입력 라우팅, 패널 시스템, command 경로 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts` (delete)
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts` (delete)
- `codex_tasks/task_490_toolbar_policy_ssot_convergence.md`

Out of scope:
- `AppLayout`/windowing runtime 정책 변경
- `toolbarModePolicy.ts` alias 제거 작업 (별도 태스크)
- 모드 패키지 스키마 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core selector는 `features/*`를 import하면 안 된다.
  - host toolbar는 core public selector 결과만 소비한다.
- Compatibility:
  - 툴바 렌더 조건(draw/playback/canvas/morePanel)은 기존 값과 동일하게 유지한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-HIGH-01
- Depends on tasks:
  - `task_488`, `task_489`
- Enables tasks:
  - `task_491` (host policy extraction)
- Parallel group:
  - G-CORE-TOOLBAR-SSOT
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
  - YES (core selector <-> feature toolbar)
- Parallelizable sub-units:
  - 0 (single critical path)
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 단일 SSOT 수렴 작업은 충돌 없는 직렬 처리로 안정성이 높다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `FloatingToolbar.tsx`가 core selector 단일 경로로 `ResolvedToolbarPlan`을 획득한다.
- [ ] AC-2: `toolbarActionSelectors.ts`, `toolbarSurfacePolicy.ts`가 제거되고, 잔여 참조가 0이다.
- [ ] AC-3: `scripts/check_mod_contract.sh` 및 `scripts/check_toolbar_contract.sh`가 PASS한다.
- [ ] AC-4: `cd v10 && npm run lint`와 `cd v10 && npm run build`가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "selectResolvedToolbarPlanInputFromRuntimeResolver|selectResolvedToolbarPlanInputFromBaseProvider" v10/src/features/chrome/toolbar/FloatingToolbar.tsx v10/src/core/runtime/modding/package/selectors.ts`
   - Expected result:
     - FloatingToolbar가 core 단일 selector를 사용한다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "toolbarActionSelectors|toolbarSurfacePolicy" v10/src/features/chrome/toolbar v10/src`
   - Expected result:
     - 삭제된 파일 참조가 남지 않는다.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && bash scripts/check_toolbar_contract.sh`
   - Expected result:
     - PASS
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - fallback selector 제거 시 일부 viewport에서 버튼 표시 회귀 가능성.
- Roll-back:
  - 삭제 파일 복구 + FloatingToolbar import 롤백 커밋으로 즉시 복구 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "순서대로 진행해보자."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/index.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts` (deleted)
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts` (deleted)
- `codex_tasks/task_490_toolbar_policy_ssot_convergence.md`

Commands run (only if user asked or required by spec):
- `rg -n "selectResolvedToolbarPlanInputFromRuntimeResolver|selectResolvedToolbarPlanInputFromBaseProvider" v10/src/features/chrome/toolbar/FloatingToolbar.tsx v10/src/core/runtime/modding/package/selectors.ts`
- `rg -n "toolbarActionSelectors|toolbarSurfacePolicy" v10/src/features/chrome/toolbar v10/src`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: `FloatingToolbar` now uses `selectResolvedToolbarPlanInputFromRuntimeResolver` from core selector path.
- AC-2 PASS: `toolbarActionSelectors.ts`, `toolbarSurfacePolicy.ts` removed and references are zero.
- AC-3 PASS: `check_mod_contract.sh`, `check_toolbar_contract.sh` PASS.
- AC-4 PASS: `npm run lint`, `npm run build` PASS.

Notes:
- (pre-existing failures vs new issues, if any)
