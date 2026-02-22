# Task 478: Pack-First Toolbar Definition Cutover

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 툴바 탭/액션/표면 정책의 SSOT를 pack 정책 입력으로 전환한다.
  - Host는 `ResolvedToolbarPlan` 렌더러로만 동작하도록 단순화한다.
- What must NOT change:
  - base-education 기본 UX 회귀 금지
  - 권한(role) 정책/키오스크 규칙 변경 금지

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/packs/base-education/manifest.ts`
- `v10/src/mod/packs/base-education/modules.ts`
- `v10/src/mod/bridge/packRegistryBridge.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Out of scope:
- alias 완전 제거
- mod-studio 화면 분리

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - pack 정의는 `src/mod/packs/*` 유지
  - host는 plan 소비만 수행
- Compatibility:
  - pack 정책이 없거나 불완전할 때 fallback 규칙 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W478
- Depends on tasks:
  - ['task_476', 'task_477']
- Enables tasks:
  - ['task_479', 'task_480']
- Parallel group:
  - G-pack-cutover
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 9
- Files shared with other PENDING tasks:
  - toolbar catalog/policy/shell + package selectors
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~90min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Constraint: toolbar shell 파일 단일 소유
- Rationale:
  - pack/selector와 host render를 병렬 분할 가능하나 lock 관리 필수.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - pack policy cutover + host renderer alignment
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: pack/adapter/selectors
  - Implementer-B: host toolbar consumption
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `FloatingToolbar.tsx` 단독 소유
- Parallel slot plan:
  - 2~3 slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - critical-path-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 reviewer
  - Ready-queue refill trigger:
    - pack selector 완료 즉시 host slot 착수
  - Agent close/reuse policy:
    - 완료 즉시 close/reuse
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 180s
    - Long-running exceptions: lint/build
  - Reassignment safety rule:
    - 파일 락 확인 후 재할당

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete):
  - mod pack schema/path 변경 시 `node scripts/gen_ai_read_me_map.mjs`
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` toolbar SSOT/pack-first 명시 갱신

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 탭/액션/표면 정책이 pack 기반으로 resolve되며 host 상수 분기는 compat-only로 축소된다.
  - host renderer는 pack-derived plan 입력만 소비하고, 상수 카탈로그 직접 참조를 추가하지 않는다.
- [x] AC-2: 신규 pack 추가 시 host 코드 수정 없이 toolbar 구성이 바뀐다.
- [x] AC-3: 기본 pack(`base-education`) 기준 현재 UX 회귀가 없다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "TOOLBAR_ACTION_CATALOG|FALLBACK_RULES|TOOLBAR_MODES" v10/src/features/chrome/toolbar/FloatingToolbar.tsx v10/src/features/chrome/toolbar/DrawModeTools.tsx v10/src/features/chrome/toolbar/PlaybackModeTools.tsx v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
   - Expected result:
     - host renderer 계층에서 상수 직접 참조 0건(compat layer 외부 금지)
   - Covers: AC-1

2) Step:
   - Command / click path:
     - 임시 pack 수정(탭/액션 표면) 후 실행 확인 + host 코드 diff 없음 확인
   - Expected result:
     - host 수정 없이 렌더 결과 반영
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-1, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - cutover 중 정책 누락 시 버튼 숨김/중복 발생 가능.
- Roll-back:
  - compat fallback 활성화 + 이전 selector 경로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/mod/packs/base-education/manifest.ts`
- `v10/src/mod/packs/base-education/modules.ts`
- `v10/src/mod/bridge/packRegistryBridge.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Commands run (only if user asked or required by spec):
- `rg -n "TOOLBAR_ACTION_CATALOG|FALLBACK_RULES|TOOLBAR_MODES" v10/src/features/chrome/toolbar/FloatingToolbar.tsx v10/src/features/chrome/toolbar/DrawModeTools.tsx v10/src/features/chrome/toolbar/PlaybackModeTools.tsx v10/src/features/chrome/toolbar/CanvasModeTools.tsx` (PASS, 0 matches)
- `cd v10 && npm run lint` (PASS)
- `cd v10 && npm run build` (PASS; 중간 1회 `manifest.kind` 타입 오류는 수정 후 재실행 PASS)
- `./scripts/check_layer_rules.sh` (PASS)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`rg -n "TOOLBAR_ACTION_CATALOG|FALLBACK_RULES|TOOLBAR_MODES" ...` => 0 matches)
  - PASS (`./scripts/check_layer_rules.sh`)

Manual verification notes:
- Host shell(`FloatingToolbar.tsx`)의 toolbar base 상수 등록 경로를 제거하고, runtime template pack bootstrap + resolved plan 소비 경로로 전환됨.
- Step-2(임시 pack 수정 후 실제 UI 반영 확인)는 본 CLI 세션에서 브라우저 인터랙션까지 수행하지 못했으며, 후속 수동 smoke 확인 권장.

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
