# Task 299: 윈도우 헤더 액션 버튼 터치 타겟 크기 수정 (28px → 36px+)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- panelAdapters.tsx:27-28:
    const PANEL_HOST_ACTION_BUTTON_CLASS =
      "inline-flex h-7 items-center ... text-[10px] ...";
  h-7 = 28px — WCAG 2.5.5 최소 44px / Apple HIG 44pt / Google Material 48dp 미달
  → WindowPanelShell의 Reset / Close 버튼 모두 적용

- ModerationConsolePanel.tsx:85:
    <Button type="button" size="sm" ... className="h-7 ...">
      Refresh
    </Button>
  h-7 = 28px — 동일 문제
```

---

## Goal (Base Required)

- What to change:
  - `panelAdapters.tsx` — `PANEL_HOST_ACTION_BUTTON_CLASS`의 `h-7`을 `h-9`(36px)으로 변경
    (WCAG 2.5.5 AA 충족 최소: 24px 이상 권고, 44px 이상 권장. 36px는 충분한 개선이며 디자인 파괴 최소화)
  - `ModerationConsolePanel.tsx` — Refresh 버튼 `h-7`을 `h-9`으로 변경
- What must NOT change:
  - 버튼 텍스트/레이블 변경 없음
  - WindowPanelShell 레이아웃 구조 변경 없음 (header flex 유지)
  - 버튼 기능(reset/close/refresh) 변경 없음

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/chrome/layout/windowing/panelAdapters.tsx` — PANEL_HOST_ACTION_BUTTON_CLASS h-7 → h-9
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx` — Refresh Button h-7 → h-9

Out of scope:
- 다른 소형 버튼 일괄 수정 (별도 감사 필요)
- 버튼 디자인 시스템 전면 개정

---

## 변경 설계

```
[ panelAdapters.tsx ]
Before:
  "inline-flex h-7 items-center rounded-md ... text-[10px] ..."
After:
  "inline-flex h-9 items-center rounded-md ... text-[10px] ..."

[ ModerationConsolePanel.tsx ]
Before:
  className="h-7 border-toolbar-border/20 ..."
After:
  className="h-9 border-toolbar-border/20 ..."
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules: 변경 없음
- Compatibility:
  - h-7 → h-9: 패널 헤더 높이가 약 8px 증가. 패널 내부 콘텐츠 영역 소폭 감소.
  - WindowPanelShell header는 `border-b ... px-3 py-2` — py-2를 py-1로 보상할 수 있음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P1
- Depends on tasks: [없음]
- Enables tasks: [없음]
- Parallel group: G-hotfix-P1 (task_298, task_300, task_301과 병렬 가능)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~10min
- Recommended mode: DELEGATED
- Batch-eligible: YES (독립 파일, P1 병렬 가능)
- Rationale: 2파일 className 변경. 단순하고 독립적.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES (터치 타겟 크기 변경)
- Tablet viewport checks:
  - 768x1024: 패널 헤더 높이 증가가 내부 스크롤에 영향 없는지 확인
  - 1024x768: 가로 모드에서 패널 압박 없는지 확인

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_299 only
- File ownership lock plan: 2개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: P0 태스크 완료 후
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

- [ ] AC-1: WindowPanelShell Reset/Close 버튼 높이 36px 이상
- [ ] AC-2: ModerationConsolePanel Refresh 버튼 높이 36px 이상
- [ ] AC-3: 패널 헤더 레이아웃 깨짐 없음 (텍스트/버튼 정렬 유지)
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 버튼 크기 확인
   - DevTools → 패널 헤더 Reset/Close 버튼 → Box Model에서 높이 ≥ 36px 확인
   - Covers: AC-1, AC-2

2) Step: 레이아웃 회귀 없음
   - 각 윈도우 패널 열기 → 헤더 정렬 정상 확인
   - Covers: AC-3

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 헤더 높이 증가로 좁은 패널에서 콘텐츠 영역 압박 가능
    → py-2를 py-1로 보상하거나 py-2 유지 (36px은 작은 증가)
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/windowing/panelAdapters.tsx`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- `h-7 -> h-9`로 액션 버튼 터치 타겟(36px 이상) 확장.
- 이벤트 핸들러/로직 변경 없이 스타일 사이즈만 조정.
