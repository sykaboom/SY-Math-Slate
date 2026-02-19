# Task 298: PlayerBar 모바일 반응형 개선 (과밀/가로 넘침)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- PlayerBar.tsx:94: 외부 래퍼 w-[min(780px,92vw)] — 모바일(375px)에서 92vw = ~345px
- PlayerBar.tsx:95: flex items-center gap-3 — 단일 행, 줄바꿈 없음
- 포함 요소 (좌→우):
    1. Play/Pause 버튼 (h-11 w-11 = 44px)
    2. Stop 버튼 (h-9 w-9 = 36px)
    3. 진행 바 + 스텝 카운터 (flex-1 + min-w-[60px])
    4. Speed 팝오버 버튼 (canTiming 조건부)
    5. Delay 팝오버 버튼 (canTiming 조건부)
    6. PublicToggle 버튼 (readOnly가 아닐 때)
    7. ShareButton (readOnly가 아닐 때)
    8. Exit(X) 버튼 (h-9 w-9)
  → 345px에 8개 요소 — 물리적으로 불가능한 배치
- canTiming = isCapabilityEnabled("playback.timing") 조건부이므로
  timing 기능 비활성화 시 4, 5번 없음 → 6개 요소로 줄어듦 (그래도 협소)
```

---

## Goal (Base Required)

- What to change:
  - `PlayerBar.tsx` — 모바일 뷰포트에서 Secondary 요소(Speed/Delay/PublicToggle/ShareButton) 숨김 또는 2행 레이아웃
    구체적 전략: 가장 좁은 뷰포트(< sm)에서 Speed/Delay 팝오버 숨김, Share 그룹을 별도 행으로 분리
- What must NOT change:
  - Play/Stop/진행 바/스텝 카운터/Exit 버튼 — 모바일에서도 표시 유지 (핵심 컨트롤)
  - readOnly 모드 동작 변경 없음
  - 데스크톱(780px)에서 기존 레이아웃 유지

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/layout/PlayerBar.tsx` — 반응형 레이아웃 수정

Out of scope:
- PlayerBar 기능 추가/제거
- 별도 MobilePlayerBar 컴포넌트 신규 생성
- PublicToggle/ShareButton 컴포넌트 변경

---

## 변경 설계

```
전략(고정안): 모바일 2행 + 데스크톱 1행

- 외부 래퍼 `w-[min(780px,92vw)]` 유지
- 내부 컨테이너:
  - `< sm`: `flex-col`, 2행
  - `sm+`: `flex-row`, 기존 1행 유지
- 1행(항상 표시): Play/Pause, Stop, 진행바, 스텝 카운터, Exit
- 2행(`!readOnly`): PublicToggle + ShareButton
- Speed/Delay 팝오버:
  - `< sm`: 숨김 (`hidden sm:flex`)
  - `sm+`: 기존 동작 유지
- `flex-wrap` 방식은 사용하지 않음 (제어 불가능한 줄바꿈 방지)
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules: features/layout 레이어, 변경 없음
- Compatibility:
  - sm 브레이크포인트(640px) 기준으로 분기 — Tailwind 기존 설정 활용
  - readOnly=true 경우 Play/Stop/진행 바/Exit만 표시 → 이미 단순 배치이므로 문제 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P1
- Depends on tasks: [없음 — 독립]
- Enables tasks: [없음]
- Parallel group: G-hotfix-P1 (task_299, task_300, task_301과 병렬 가능)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 1
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~20min
- Recommended mode: DELEGATED
- Batch-eligible: YES (독립 파일, P1 그룹 내 병렬 가능)
- Rationale: 1파일 레이아웃 수정. P0 태스크 완료 후 P1 그룹 시작.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- [ ] Tablet viewport checks:
  - 375x667 (iPhone SE): 행 분리로 2행 표시 확인
  - 768x1024 (iPad portrait): sm 이상이므로 1행 유지 확인
  - 820x1180 (iPad Air): 1행 유지
  - 1024x768 (tablet landscape): 1행 유지

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_298 only
- File ownership lock plan: PlayerBar.tsx 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: P0 태스크(293~297) 완료 후
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO (레이아웃만, 구조/레이어 변경 없음)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 375px 뷰포트에서 PlayerBar 버튼이 잘리거나 겹치지 않음
- [ ] AC-2: 375px에서 Play/Stop/스텝 카운터/Exit 버튼 모두 표시됨
- [ ] AC-3: 375px에서 PublicToggle/ShareButton은 2행에 표시되고 Speed/Delay는 숨김
- [ ] AC-4: 768px 이상에서 기존 1행 레이아웃 유지 (회귀 없음)
- [ ] AC-5: readOnly=true 모드에서 레이아웃 회귀 없음
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 모바일 뷰포트 확인
   - DevTools → 375x667 → PlayerBar 오버플로우 없음 확인
   - PublicToggle/ShareButton 2행 표시 + Speed/Delay 숨김 확인
   - Covers: AC-1, AC-2, AC-3

2) Step: 데스크톱 회귀 없음
   - 1280px 뷰포트 → 기존 1행 레이아웃 확인
   - Covers: AC-4

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 2행 레이아웃으로 PlayerBar 전체 높이 증가 → AppLayout 하단 여백 침범 가능
    → PlayerBar는 absolute 또는 별도 footer에 위치하므로 확인 필요
  - rounded-full이 flex-col에서 어색해질 수 있음 → rounded-2xl로 변경 고려
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/layout/PlayerBar.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: N/A

Manual verification notes:
- 모바일에서 2행(`flex-col`) + 데스크톱에서 1행(`sm:flex-row`) 반응형 배치 반영.
- Share controls는 모바일 별도 행, 데스크톱 inline으로 분리.
