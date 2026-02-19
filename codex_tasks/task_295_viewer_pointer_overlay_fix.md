# Task 295: Viewer 캔버스 포인터 오버레이 차단 수정

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- ViewerShell.tsx:253:
    <div className="absolute inset-0 z-40" aria-hidden="true" />
  → pointer-events-none 클래스 없음
  → z-40으로 전체 캔버스를 덮는 투명 오버레이
  → 터치/포인터/핀치/팬 등 모든 상호작용을 차단
- 오버레이가 존재하는 이유: 뷰어에서 캔버스 직접 편집 차단 (의도적 보호)
  → pointer-events-none 추가 시 마우스/터치는 통과하지만 canvas 편집 방지는
     ViewerShell의 paste/drop/dragover 전역 리스너(159-180줄)가 이미 처리 중
```

---

## Goal (Base Required)

- What to change:
  - `ViewerShell.tsx:253` — 오버레이 div에 `pointer-events-none` 추가
- What must NOT change:
  - paste/drop/dragover 전역 차단 이벤트 리스너 (ViewerShell:159-180) — 변경 없음
  - 오버레이 div 자체 제거 금지 (aria-hidden 시각 보호 목적 유지)
  - z-40 유지 (렌더링 순서 변경 없음)

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/viewer/ViewerShell.tsx` — 오버레이 div className에 `pointer-events-none` 추가

Out of scope:
- 뷰어에서의 캔버스 상호작용 기능 추가 (pinch-zoom 등 별도 스펙)
- 오버레이 디자인 변경

---

## 변경 내용

```tsx
// Before (ViewerShell.tsx:253):
<div className="absolute inset-0 z-40" aria-hidden="true" />

// After:
<div className="absolute inset-0 z-40 pointer-events-none" aria-hidden="true" />
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules: 변경 없음
- Compatibility:
  - 캔버스 편집 보호는 paste/drop/dragover 전역 리스너로 유지 → pointer-events-none 추가 안전
  - 참가자 세션(useParticipantSession)의 step 제안 버튼은 오버레이 외부(footer)에 있어 영향 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P0
- Depends on tasks: [task_285 (ViewerShell 원본)]
- Enables tasks: [없음]
- Parallel group: G-hotfix-C (단독, 1파일 수정)
- Max parallel slots: 1
- Verification stage: `mid` (1줄 수정, full build 불필요하지만 lint + build 실행)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 1
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~5min
- Recommended mode: DELEGATED (단순 1줄 수정)
- Batch-eligible: YES (다른 ViewerShell 수정 없으면 병렬 가능, 단독 파일이므로 즉시 실행 가능)
- Rationale: 1줄 className 추가. 가장 단순한 P0 수정.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_295 only
- File ownership lock plan: ViewerShell.tsx 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: 즉시 실행 가능
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO (1줄 수정, 구조/레이어 변경 없음)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Viewer 캔버스 오버레이가 포인터 이벤트를 가로채지 않음 (`pointer-events-none` 확인)
- [ ] AC-2: 뷰어에서 paste/drop으로 캔버스 수정 차단은 여전히 유지됨 (기존 리스너 유지)
- [ ] AC-3: 기존 뷰어 내 상호작용(기존에 가능하던 클릭/스크롤/제스처)이 회귀 없이 동작
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 오버레이 이벤트 차단 해제 확인
   - DevTools Elements에서 overlay div class에 `pointer-events-none` 포함 확인
   - 뷰어 캔버스 상호작용 시 overlay가 이벤트 타겟이 되지 않는지 확인
   - Covers: AC-1

2) Step: 편집 차단 유지 확인
   - 뷰어에서 Ctrl+V paste 시도 → 차단 확인
   - Covers: AC-2

3) Step: 기존 상호작용 회귀 확인
   - 뷰어에서 기존에 지원되던 조작(예: 스크롤/네비게이션/버튼 클릭) 정상 동작 확인
   - Covers: AC-3

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - pointer-events-none 추가 시 오버레이 위에 렌더링된 다른 UI 요소가 있으면 클릭 차단 해제됨
    → 현재 ViewerShell에서 오버레이 위에 z-index 더 높은 요소: footer(z 미지정, DOM 순서 기반)
    → footer는 오버레이와 sibling이 아니라 부모 flex 아래에 있어 영향 없음
- Roll-back: `git revert <commit>` 한 줄 (1줄 수정)

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/viewer/ViewerShell.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: N/A

Manual verification notes:
- Viewer 오버레이에 `pointer-events-none`이 추가되어 canvas 입력이 차단되지 않음을 코드상 확인.
