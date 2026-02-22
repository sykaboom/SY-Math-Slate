# Task 485: Extract Fullscreen Ink Runtime Helper (Remove Duplicate Logic)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `AppLayout.tsx`와 `CanvasModeTools.tsx`에 중복된 fullscreen enter/exit 로직을 공용 helper/hook으로 추출한다.
- What must NOT change:
  - fullscreen 진입/복귀 UX 동작과 실패 처리 메시지는 동일하게 유지한다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- 신규 helper 1개 (예: `v10/src/features/chrome/shared/fullscreenInkRuntime.ts`)

Out of scope:
- fullscreen 정책 변경
- toolbar mode 정책 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - helper는 `features/chrome/shared/*` 같은 중립 경로에 두고, `layout -> toolbar` 의존을 만들지 않는다.
  - store 타입/shape 변경 금지.
- Compatibility:
  - 기존 fullscreen fallback/native 경로를 동일하게 유지.

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
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/features/chrome/layout/AppLayout.tsx` (potential future conflict)
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
  - `AppLayout.tsx`를 건드리는 다른 태스크와 동시 실행 금지
- Rationale:
  - 동작 동일성 요구가 높은 중간 난도 refactor로 단일 소유가 안전하다.

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
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: fullscreen enter/exit 로직의 핵심 분기가 공용 helper로 단일화된다.
- [ ] AC-2: `AppLayout`, `CanvasModeTools` 모두 helper를 사용한다.
- [ ] AC-3: `scripts/check_layer_rules.sh` 통과.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` 통과.
- [ ] AC-5: `node scripts/gen_ai_read_me_map.mjs` 실행 후 문서 동기화 상태가 유지된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
    - `rg -n "fullscreenInkRuntime|requestFullscreen\\(|exitFullscreen\\(" v10/src/features/chrome/layout/AppLayout.tsx v10/src/features/chrome/toolbar/CanvasModeTools.tsx v10/src/features/chrome/shared`
   - Expected result:
    - 중복 inline 구현이 줄고 helper 호출 중심으로 변경
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - 앱에서 fullscreen 진입/종료 2회 반복
   - Expected result:
     - 기존과 동일하게 동작
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
  - 문서 이벤트/escape 동작이 미세하게 달라질 수 있음.
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
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- `v10/src/features/chrome/shared/fullscreenInkRuntime.ts`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `rg -n "fullscreenInkRuntime|requestFullscreen\\(|exitFullscreen\\(" v10/src/features/chrome/layout/AppLayout.tsx v10/src/features/chrome/toolbar/CanvasModeTools.tsx v10/src/features/chrome/shared`
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`
- `node scripts/gen_ai_read_me_map.mjs`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - `scripts/check_layer_rules.sh`: PASS
  - `node scripts/gen_ai_read_me_map.mjs`: PASS (updated `v10/AI_READ_ME_MAP.md`)
  - required `rg` scan: PASS

Manual verification notes:
- `rg` output confirms fullscreen runtime API calls are centralized in `v10/src/features/chrome/shared/fullscreenInkRuntime.ts` and both call sites now import the helper.
- CLI 환경 특성상 앱 UI에서 fullscreen 진입/종료 2회 반복 수동 클릭 검증은 미실행.
- 실행한 필수 게이트(AC-3~AC-5)는 모두 통과.

Notes:
- Failure classification: none observed in executed gates (newly introduced: none, pre-existing blocking: none, pre-existing non-blocking: none).
