# Task 350: Toolbar Edge Snap Docking SSOT v2 (Legacy `left|center|right` 제거)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - 툴바 배치 모델을 `left|center|right` 정렬값 기반에서 제거하고, 아래 2층 SSOT 구조로 전환한다.
    - 상태 SSOT: `store`는 툴바 배치 상태만 저장 (`floating` vs `docked`, `edge`, `floatingRect/anchor`).
    - 결정 SSOT: `resolver`가 정책 + viewport + safe-area를 입력받아 실제 배치 결과(툴바 rect, canvas inset)를 계산.
  - 툴바를 드래그하여 `top|right|bottom|left` 어느 방향이든 스냅-도킹 가능하게 한다.
  - 도킹 시 Samsung Notes 스타일의 슬롯형 배치로 캔버스 가림을 줄이고, AppLayout은 resolver 결과만 렌더한다.
- What must NOT change:
  - 모드/패키지 계약(`core/mod/*`) 및 보안/권한 정책.
  - command bus 및 role-policy의 신뢰 경계.
  - 학생 kiosk에서 편집 UI 비노출 규칙.

---

## Scope (Base Required)

Touched files/directories:
- `design_drafts/task_329_toolbar_edge_snap_docking.svg` (기존 레드라인 기준 재사용)
- `v10/src/features/platform/store/useChromeStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/windowing/windowRuntime.types.ts`
- `v10/src/features/chrome/layout/windowing/windowRuntime.ts`
- `v10/src/features/chrome/layout/windowing/useWindowRuntime.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/platform/extensions/commands/commands.tool.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `scripts/check_toolbar_contract.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- 툴바 아이콘 아트/컬러 테마 재디자인.
- 새 툴 추가/삭제 (기능 카탈로그 확장).
- Mod Studio UX 개편.
- WindowHost 전면 구조 변경.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - 툴바 배치 판단은 resolver 단일 경로로 고정하고, AppLayout/FloatingToolbar에서 독자 계산 금지.
  - `mod` 계층은 레이아웃 배치 상태를 직접 import/수정하지 않는다.
  - 상태 변경은 command 경로를 우선 사용하고, 직접 set 남발 금지.
- Compatibility:
  - 과도기 read-compat 허용: 기존 `setToolbarDock(left|center|right)` 호출이 남아있으면 내부에서 `bottom` edge 정책으로 안전 매핑 가능.
  - 단, 최종 상태에서 store 타입/주요 렌더 경로는 `left|center|right`를 사용하지 않는다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-toolbar-edge-snap-v2
- Depends on tasks:
  - [`task_349`]
- Enables tasks:
  - [향후 toolbar UX 단순화/모바일 최적화 스펙]
- Parallel group:
  - G-layout-toolbar-store
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 11-12
- Files shared with other PENDING tasks:
  - `none` (현재 기준)
- Cross-module dependency:
  - YES (store + layout + toolbar + command + runtime)
- Parallelizable sub-units:
  - 2 (store/command vs layout/runtime; 최종 합류 필요)
- Estimated single-agent duration:
  - ~80min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
  - Layout/runtime 계산식과 UI 동작이 강결합이라 파일 락 충돌 위험이 큼.
- Rationale:
  - 캔버스 safe inset과 도킹 스냅 계산은 하나의 수학적 계약으로 묶여야 회귀를 막을 수 있다.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/task_329_toolbar_edge_snap_docking.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Redlines (binding for this task):
- Edge snap threshold: `24px`
- Docked strip max thickness:
  - top/bottom: `<= 72px` (safe-area 포함)
  - left/right: `<= 84px`
- Canvas safe minimum:
  - visible width `>= 320px`
  - visible height `>= 240px`

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1:
  - 툴바를 드래그했을 때 `top|right|bottom|left` 4방향 모두 스냅-도킹 가능하다.
- [x] AC-2:
  - 도킹/언도킹 시 배치 계산은 resolver 단일 경로를 타며, AppLayout은 계산 결과만 렌더한다.
- [x] AC-3:
  - store의 툴바 배치 상태 타입에서 `left|center|right`가 제거되고, 새 배치 모델(`floating/docked + edge`)로 대체된다.
- [x] AC-4:
  - FloatingToolbar UI에 `left|center|right` 선택 컨트롤이 존재하지 않는다.
- [x] AC-5:
  - 캔버스 가시 영역이 레드라인 최소치(320x240) 미만으로 내려가지 않는다.
- [x] AC-6:
  - `bash scripts/check_toolbar_contract.sh`, `cd v10 && npm run lint`, `cd v10 && npm run build`가 모두 PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - 앱 실행 후 툴바 패널을 각 edge로 드래그.
   - Expected result:
     - 4방향 모두 스냅-도킹 동작, edge 표시/상태 동기화 정상.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path:
     - 도킹 상태에서 판서/탭 전환/뷰포트 변경 반복.
   - Expected result:
     - AppLayout이 resolver 결과만 따라가며 캔버스가 가려지지 않음.
   - Covers: AC-2, AC-5

3) Step:
   - Command / click path:
     - FloatingToolbar의 Canvas/More 섹션 확인.
   - Expected result:
     - `left|center|right` UI 제거, 드래그 기반만 남아 있음.
   - Covers: AC-4

4) Step:
   - Command / click path:
     - `bash scripts/check_toolbar_contract.sh`
     - `cd v10 && npm run lint`
     - `cd v10 && npm run build`
   - Expected result:
     - 전부 PASS.
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 도킹 임계값 근처에서 jitter 발생 가능.
  - safe-area + canvas inset 계산 실수 시 소형 뷰포트에서 작업면 축소 가능.
  - legacy alias를 급히 제거하면 외부 command 호출 경로가 깨질 수 있음.
- Roll-back:
  - 본 task 커밋 단위 revert로 복구.
  - 필요 시 read-compat alias만 임시 복구하고 store/renderer는 신규 모델 유지.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_toolbar_contract.sh`
- `v10/AI_READ_ME.md`
- `v10/src/features/platform/extensions/commands/commands.tool.ts`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/windowing/windowRuntime.ts`
- `v10/src/features/chrome/layout/windowing/windowRuntime.types.ts`
- `v10/src/features/platform/store/useChromeStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`

Commands run (only if user asked or required by spec):
- `bash scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_toolbar_contract.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none observed in required gates
- Newly introduced failures:
  - none observed in required gates
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Command-level gates passed.
- Browser drag scenario는 이 CLI 환경에서 실시간 UI 상호작용으로 재현하지 못했으며, 스냅/배치는 `windowRuntime` resolver 경로와 `AppLayout` 반영 코드로 검증했다.

Notes:
- `task_329` is treated as parked legacy spec; execution contract for this scope is `task_350`.
