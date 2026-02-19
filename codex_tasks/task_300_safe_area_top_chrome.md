# Task 300: 상단 safe-area 미적용 수정 (노치 기기 상단 크롬)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- useTabletShellProfile.ts:156-157:
    shouldPadTopChromeWithSafeArea: supportsSafeAreaInsets && !isDesktop
  → 계산은 됨

- Grep(shouldPadTopChromeWithSafeArea in AppLayout.tsx): 결과 없음
  → AppLayout에서 이 값을 사용하지 않음 — 연결 누락

- AppLayout.tsx:505-509 (top chrome 헤더):
    <header
      data-layout-id="region_chrome_top"
      className="sticky top-0 z-40 border-b border-theme-border/10 bg-theme-surface/40 backdrop-blur-md"
    >
  → pt-[env(safe-area-inset-top)] 또는 이에 해당하는 padding 없음

- 하단 크롬(AppLayout:305-307):
    "... pb-[calc(env(safe-area-inset-bottom)+8px)] ..." — 하단 safe-area는 적용됨
  → 상단만 누락된 상태

- tabletShellProfile은 AppLayout에서 이미 useTabletShellProfile()로 구독 중 (확인 필요)
```

---

## Goal (Base Required)

- What to change:
  - `AppLayout.tsx` — top chrome `<header>`에 `shouldPadTopChromeWithSafeArea` 조건부로
    `pt-[env(safe-area-inset-top)]` 추가
- What must NOT change:
  - 하단 safe-area 패딩 (이미 정상 적용) 변경 없음
  - header의 기존 sticky/z-40/border/backdrop 클래스 변경 없음
  - useTabletShellProfile.ts 변경 없음

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/layout/AppLayout.tsx` — top chrome header에 safe-area padding 조건부 추가

Out of scope:
- useTabletShellProfile 변경
- ViewerShell safe-area (별도 검토 필요)
- 좌우 safe-area 추가 (landscape 모드, 별도 태스크)

---

## 변경 설계

```
[ AppLayout.tsx ]
tabletShellProfile는 AppLayout에서 이미 구독 중.

// 기존 header class 문자열을 topChromeClassName으로 분리:
const topChromeClassName = tabletShellProfile.shouldPadTopChromeWithSafeArea
  ? "sticky top-0 z-40 border-b border-theme-border/10 bg-theme-surface/40 pt-[env(safe-area-inset-top)] backdrop-blur-md"
  : "sticky top-0 z-40 border-b border-theme-border/10 bg-theme-surface/40 backdrop-blur-md";

<header className={topChromeClassName}>
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules: features/layout 레이어 변경 없음
- Compatibility:
  - `env(safe-area-inset-top)`: iOS Safari 11.2+, Chrome Android 69+ 지원
  - 노치 없는 기기: safe-area-inset-top = 0 → padding 없음 (영향 없음)
  - shouldPadTopChromeWithSafeArea = supportsSafeAreaInsets && !isDesktop
    → 데스크톱에서 미적용, 모바일/태블릿에서만 적용

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P1
- Depends on tasks: [task_293 (AppLayout host live wiring), task_296 (student kiosk policy leak)]
- Enables tasks: [없음]
- Parallel group: G-hotfix-P1 (task_298, task_299, task_301과 병렬 가능)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 1
- Files shared with other PENDING tasks: `AppLayout.tsx` (task_293, task_296과 공유)
- Cross-module dependency: NO (AppLayout 내부)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~15min
- Recommended mode: DELEGATED
- Batch-eligible: NO (AppLayout.tsx — task_293, task_296 완료 후 실행)
- Rationale: AppLayout.tsx 파일 충돌. P0 태스크(293, 296) 완료 후 마지막으로 실행.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- Tablet viewport checks:
  - iPhone 14 Pro (Dynamic Island): safe-area-inset-top ≈ 59px
  - iPhone SE (no notch): safe-area-inset-top = 0 → 영향 없음
  - iPad: safe-area-inset-top = 20-24px (status bar)

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_300 only
- File ownership lock plan: AppLayout.tsx 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_293 AND task_296 완료 후
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 노치 기기(iPhone 14 Pro 시뮬레이터)에서 상단 크롬이 Dynamic Island/노치 아래로 내려옴
- [ ] AC-2: 노치 없는 기기에서 상단 크롬 위치 변경 없음 (padding = 0)
- [ ] AC-3: 데스크톱에서 상단 크롬 위치 변경 없음 (shouldPadTopChromeWithSafeArea = false)
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 노치 기기 시뮬레이션
   - DevTools → iPhone 14 Pro 시뮬레이터 또는 CSS env(safe-area-inset-top) override
   - 상단 크롬이 노치와 겹치지 않음 확인
   - Covers: AC-1

2) Step: 데스크톱 회귀 없음
   - 1280px 뷰포트에서 상단 크롬 위치 변경 없음 확인
   - Covers: AC-3

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - env(safe-area-inset-top)가 Tailwind arbitrary value로 작동 안 할 수 있음
    → next.config 또는 globals.css에서 직접 CSS 변수로 처리 고려
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> task_293 AND task_296 완료 후 실행 (AppLayout.tsx 파일 충돌).

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/layout/AppLayout.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- top chrome에 `pt-[env(safe-area-inset-top)]`를 조건부 적용(`tabletShellProfile.shouldPadTopChromeWithSafeArea`).
- 기존 desktop/non-notch 레이아웃은 유지.
