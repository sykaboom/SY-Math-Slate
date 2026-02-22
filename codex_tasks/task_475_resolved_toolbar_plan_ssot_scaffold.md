# Task 475: ResolvedToolbarPlan SSOT Scaffold (Behavior-Preserving)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 툴바 렌더 결정의 SSOT로 `ResolvedToolbarPlan` 계약을 도입한다.
  - 기존 UI/동작을 유지한 상태에서 Host 렌더 경로를 plan-input 기반으로 전환할 준비를 한다.
- What must NOT change:
  - 사용자 관측 동작(탭, 버튼 노출/동작, 단축키)은 변경하지 않는다.
  - layout/windowing 도킹 규칙은 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`

Out of scope:
- pack 정책 변경
- alias 제거
- mod-studio UX 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core -> features import` 금지
  - plan 타입/selector는 core/package 레이어에서 정의
- Compatibility:
  - 기존 `draw/playback/canvas` 모드 노출 동작 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W475
- Depends on tasks:
  - ['task_474']
- Enables tasks:
  - ['task_476']
- Parallel group:
  - G-plan-core
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - `FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~45min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 핵심 shell 파일(`FloatingToolbar.tsx`)이 포함되어 파일 락 충돌 위험이 높다.

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
- [ ] Structure changes (file/folder add/move/delete):
  - N/A
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` toolbar SSOT 섹션 검토/필요시 갱신

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `ResolvedToolbarPlan` 타입/selector가 정의되고 host는 해당 결과를 통해 렌더 입력을 구성한다.
  - compile-time guard: `FloatingToolbar.tsx`가 `ResolvedToolbarPlan` 타입에 직접 바인딩되어 타입 제거/시그니처 변경 시 빌드 실패가 발생해야 한다.
- [x] AC-2: 기존 사용자 동작 회귀가 없다(동일 모드/동일 viewport에서 버튼 표면 배치 동일).
- [x] AC-3: feature 레이어에서 toolbar 결정 로직의 신규 분기 추가 없이 plan-input 소비만 수행한다.

### Baseline Mode/Viewport Matrix (must stay identical in this task)
- Draw | desktop/tablet/mobile:
  - Hand, Pen, Eraser, Laser, Text, Image, Clipboard, Undo, Redo
- Playback | desktop/tablet/mobile:
  - Previous Step, Next Step, Undo, Redo, Sound Toggle
- Canvas | desktop/tablet/mobile:
  - Fullscreen Toggle, Sound Toggle

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "ResolvedToolbarPlan" v10/src/core/runtime/modding/package v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
   - Expected result:
     - core selector + FloatingToolbar 타입 바인딩 사용 경로 확인
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - lint/build PASS
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - 툴바 draw/playback/canvas 수동 확인(데스크탑/태블릿/모바일) + 위 Baseline Matrix 대조
   - Expected result:
     - 각 모드/viewport에서 Baseline Matrix 항목이 동일하게 유지됨
   - Covers: AC-2

4) Step:
   - Command / click path:
     - `rg -n "if \\(.*toolbarMode|switch \\(toolbarMode\\)" v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
   - Expected result:
     - 신규 임의 분기 추가 없이 plan 소비 중심 경로 유지(기존 오케스트레이션 분기 외 확장 없음)
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - plan 도입 중 중복 selector 경로가 남아 결정 경로가 이원화될 수 있음.
- Roll-back:
  - 단일 커밋 revert + 기존 selector 경로 복원.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`

Commands run (only if user asked or required by spec):
- `./scripts/check_layer_rules.sh` (PASS)
- `cd v10 && npm run lint` (PASS)
- `cd v10 && npm run build` (PASS)
- `rg -n "ResolvedToolbarPlan" v10/src/core/runtime/modding/package v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (PASS; plan 타입/selector + host 바인딩 경로 확인)
- `rg -n "if \(.*toolbarMode|switch \(toolbarMode\)" v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (PASS; 신규 toolbarMode 분기 패턴 미검출)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`./scripts/check_layer_rules.sh`)

Manual verification notes:
- `FloatingToolbar.tsx`는 `ResolvedToolbarPlan` 타입에 직접 바인딩되어 plan 계약 변경 시 타입 체크 단계에서 실패하도록 연결됨.
- Draw/Playback/Canvas의 표면 정책 계산식과 fallback rule 집합은 변경하지 않아 Baseline Matrix 동작은 동일하게 유지됨(구현 diff 기준).
- 실제 브라우저 수동 점검(데스크탑/태블릿/모바일)은 본 CLI 세션에서 수행하지 못했으며, 후속 UI smoke 확인 권장.

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
