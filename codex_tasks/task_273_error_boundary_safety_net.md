# Task 273: React Error Boundary 안전망 구축

Status: SUPERSEDED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

Superseded by: task_276 (확장 레이어) + task_277 (셸 레이어)
Reason: Codex 검토에서 5파일 범위가 너무 넓어 분할 권장. 2026-02-18 분할 완료.

---

## Goal (Base Required)
- What to change:
  - 확장 시스템, 동적 슬롯, 최상위 레이아웃에 React Error Boundary 추가
  - 개별 모듈 오류 시 해당 영역만 격리하고 앱 전체 크래시 방지
  - 에러 발생 시 사용자에게 fallback UI 표시 (최소: "이 영역에서 오류 발생" 메시지)
- What must NOT change:
  - 정상 동작 시 렌더링 결과 변경 없음 (에러 미발생 시 투명)
  - 기존 컴포넌트 API/props 변경 없음
  - 비즈니스 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/ui/components/ErrorBoundary.tsx` (create) — 재사용 가능한 ErrorBoundary 컴포넌트
- `v10/src/features/extensions/ui/ExtensionSlot.tsx` (write) — 슬롯 렌더링을 ErrorBoundary로 래핑
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx` (write) — 부트스트랩 초기화를 ErrorBoundary로 래핑
- `v10/src/features/layout/AppLayout.tsx` (write) — 최상위 레이아웃에 ErrorBoundary 배치
- `v10/src/features/layout/windowing/WindowHost.tsx` (write) — 각 윈도우 패널을 ErrorBoundary로 래핑

Out of scope:
- Error logging/reporting 서비스 연동 (향후 별도 태스크)
- ErrorBoundary 내부 retry/recovery 로직 (1차는 fallback만)
- store 또는 비즈니스 로직 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
  - React 자체 ErrorBoundary class component API 사용 (추가 라이브러리 불필요)
- Boundary rules:
  - ErrorBoundary 컴포넌트는 `ui/components/`에 위치 (순수 UI 레이어)
  - features/ 파일은 ErrorBoundary를 import만 함 (래핑 위치 결정)
- Compatibility:
  - React class component 패턴 사용 (functional ErrorBoundary는 React 미지원)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3-safety
- Depends on tasks: []
- Enables tasks: [확장 시스템 안정화, 플러그인 추가 안전성]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 5 (1 create + 4 write)
- Files shared with other PENDING tasks: AppLayout.tsx (task_266과 공유 가능 — 266 완료 후 실행 권장)
- Cross-module dependency: YES (ui + features/extensions + features/layout)
- Parallelizable sub-units: 0
  - ErrorBoundary 컴포넌트 생성이 먼저, 그 후 4개 파일에 래핑 적용 (순차)
- Estimated single-agent duration: ~30min
- Recommended mode: MANUAL
- Batch-eligible: YES
  - task_274, 275와 파일 충돌 없음 (274는 registerCoreCommands, 275는 store 파일)
- Rationale:
  - 터치 파일 5개지만, ErrorBoundary 생성 → 래핑 적용의 단순 순차 작업이라 단일 에이전트가 효율적.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes:
    - 신규 파일: `v10/src/ui/components/ErrorBoundary.tsx`
    - `node scripts/gen_ai_read_me_map.mjs` 실행 필요
  - [ ] Semantic/rule changes:
    - v10/AI_READ_ME.md에 "Error Boundary 정책" 항목 추가 권장

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `v10/src/ui/components/ErrorBoundary.tsx`가 존재하고 export됨
- [ ] AC-2: ExtensionSlot에서 각 슬롯 컴포넌트가 ErrorBoundary로 래핑됨
- [ ] AC-3: ExtensionRuntimeBootstrap 전체가 ErrorBoundary로 래핑됨
- [ ] AC-4: AppLayout의 주요 영역(캔버스, 툴바, 패널)이 ErrorBoundary로 래핑됨
- [ ] AC-5: WindowHost에서 각 패널이 개별 ErrorBoundary로 래핑됨
- [ ] AC-6: ErrorBoundary에 fallback UI가 표시됨 (최소: 에러 메시지 텍스트)
- [ ] AC-7: 정상 동작 시 렌더링 결과에 변화 없음
- [ ] AC-8: `npm run lint` 통과
- [ ] AC-9: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: ErrorBoundary 컴포넌트 존재 확인
   - Command / click path: `ls v10/src/ui/components/ErrorBoundary.tsx`
   - Expected result: 파일 존재
   - Covers: AC-1

2) Step: ExtensionSlot 래핑 확인
   - Command / click path: ExtensionSlot.tsx에서 ErrorBoundary import 및 사용 확인
   - Expected result: 슬롯 컴포넌트가 <ErrorBoundary>로 감싸짐
   - Covers: AC-2

3) Step: WindowHost 패널별 래핑 확인
   - Command / click path: WindowHost.tsx에서 패널 렌더링 부분에 ErrorBoundary 확인
   - Expected result: 각 패널이 개별 <ErrorBoundary>로 감싸짐
   - Covers: AC-5

4) Step: 정상 렌더링 회귀 확인
   - Command / click path: `npm run dev` → 호스트 모드 → 캔버스/툴바/패널 정상 표시 확인
   - Expected result: 기존과 동일
   - Covers: AC-7

5) Step: 빌드 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-8, AC-9

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ErrorBoundary가 class component라서 hooks 사용 불가 — fallback 내에서 store 접근 불가
    → fallback은 순수 UI만 (store 무관)
  - ErrorBoundary가 비동기 에러(Promise rejection)는 잡지 못함
    → 향후 window.onerror 또는 React 19의 async 경계로 보완 (별도 태스크)
- Roll-back:
  - ErrorBoundary.tsx 삭제 + 4개 파일에서 래핑 제거
  - `git revert <commit>` 한 번으로 복원

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- ...

Commands run:
- ...

## Gate Results (Codex fills)

- Lint: N/A
- Build: N/A
- Script checks: N/A

## Failure Classification (Codex fills when any gate fails)

- N/A

Manual verification notes:
- N/A

Notes:
- 아키텍처 위험 분석에서 "에러 경계 0개"가 HIGH 리스크로 식별되어 작성됨
