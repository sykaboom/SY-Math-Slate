# Task 276: React Error Boundary 구축 — 확장 레이어 (1/2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

Supersedes: task_273 (scope 축소 분할; 원본은 SUPERSEDED 처리)

---

## Goal (Base Required)
- What to change:
  - 재사용 가능한 `ErrorBoundary` React class component 생성
  - ExtensionSlot: 각 슬롯 컴포넌트 렌더링을 ErrorBoundary로 래핑
  - ExtensionRuntimeBootstrap: 최상위 JSX 반환 전체를 ErrorBoundary로 래핑
  - 에러 발생 시 해당 영역만 격리, 앱 전체 크래시 방지
- What must NOT change:
  - 정상 동작 시 렌더링 결과 변경 없음 (에러 미발생 시 투명)
  - 기존 컴포넌트 API/props 변경 없음
  - ExtensionSlot, ExtensionRuntimeBootstrap 의 비즈니스 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/ui/components/ErrorBoundary.tsx` (create) — React class component ErrorBoundary
- `v10/src/features/extensions/ui/ExtensionSlot.tsx` (write) — 슬롯 렌더링 ErrorBoundary 래핑
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx` (write) — 부트스트랩 전체 ErrorBoundary 래핑

Out of scope:
- AppLayout, WindowHost ErrorBoundary 래핑 → task_277 에서 처리
- Error logging/reporting 서비스 연동 (향후 별도 태스크)
- retry/recovery 로직 (1차는 fallback UI 표시만)
- store 또는 비즈니스 로직 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
  - React ErrorBoundary는 class component API 사용 (추가 패키지 불필요)
- Boundary rules:
  - ErrorBoundary 컴포넌트는 `ui/components/`에 위치 (순수 UI 레이어)
  - ExtensionSlot, ExtensionRuntimeBootstrap은 ErrorBoundary를 import만 함
  - ErrorBoundary 내부에서 Zustand store hook 사용 불가 (class component 제약)
    → fallback UI는 순수 HTML/CSS만
- Compatibility:
  - React class component getDerivedStateFromError + componentDidCatch 패턴 사용

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W1-boundary-ext
- Depends on tasks: []
- Enables tasks: [task_277]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 3 (1 create + 2 write)
- Files shared with other PENDING tasks: none
  - task_274 (registerCoreCommands), task_275-revised (useLocalStore)와 파일 충돌 없음
- Cross-module dependency: YES (ui/components → features/extensions 방향 import)
- Parallelizable sub-units: 0
  - ErrorBoundary 컴포넌트 생성 먼저 → ExtensionSlot, ExtensionRuntimeBootstrap 래핑 (순차)
- Estimated single-agent duration: ~20min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES
  - task_274, 275-revised와 파일 충돌 없어 Wave 1 병렬 가능
  - task_277은 이 태스크 완료 후 진행 (depends on task_276)
- Rationale:
  - 파일 3개, 단순 순차(생성→래핑). 내부 병렬 없이 1개 에이전트로 처리하고 배치 웨이브 병렬만 허용.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - task_276 only
- Assigned roles:
  - Implementer-A: ErrorBoundary 생성 + extension layer 래핑
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan:
  - `ErrorBoundary.tsx`, `ExtensionSlot.tsx`, `ExtensionRuntimeBootstrap.tsx`는 Implementer-A 단독 소유
- Parallel slot plan:
  - 내부 병렬 없음 (single-agent sequential execution)
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC (batch wave slot reuse)
  - Slot priority rule (DYNAMIC only):
    - dependency-first (task_277 unblock)
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 1 executor + 0 reviewer (task local)
  - Ready-queue refill trigger:
    - task 완료 시 task_277를 runnable로 전환
  - Agent close/reuse policy:
    - 완료 즉시 close 후 task_277 슬롯으로 재사용
  - Heartbeat policy:
    - Soft ping threshold: ~90s
    - Reassignment threshold: 4~6m (무출력 + 무diff)
    - Long-running exceptions: lint/build/typecheck
  - Reassignment safety rule:
    - 2회 ping 무응답 + lock-critical 작업 아님 + long-run 예외 아님
- Delegated closeout metrics:
  - Peak active slots: 1
  - Average active slots: 1
  - Slot refill count: 1
  - Reassignment count: 0 (target)

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
    - v10/AI_READ_ME.md에 "Error Boundary 정책" 항목 추가 권장 (task_277 완료 후)

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `v10/src/ui/components/ErrorBoundary.tsx`가 존재하고 default export됨
- [x] AC-2: ErrorBoundary가 React.Component를 상속하며 getDerivedStateFromError를 구현함
- [x] AC-3: fallback props를 받아 에러 시 fallback UI를 렌더링함
- [x] AC-4: ExtensionSlot에서 각 슬롯 컴포넌트(renderedComponents, renderedDeclarative)가 ErrorBoundary로 래핑됨
- [x] AC-5: ExtensionRuntimeBootstrap의 return JSX 최상위가 ErrorBoundary로 래핑됨
- [x] AC-6: 정상 동작 시 렌더링 결과 변화 없음
- [ ] AC-7: `npm run lint` 통과 (deferred by user instruction: do not run full lint/build)
- [ ] AC-8: `npm run build` 통과 (deferred by user instruction: do not run full lint/build)

---

## Manual Verification Steps (Base Required)

1) Step: ErrorBoundary 파일 존재 및 export 확인
   - Command / click path: `ls v10/src/ui/components/ErrorBoundary.tsx`
   - Expected result: 파일 존재
   - Covers: AC-1

2) Step: ErrorBoundary class 구현 확인
   - Command / click path: `grep -n "getDerivedStateFromError\|componentDidCatch" v10/src/ui/components/ErrorBoundary.tsx`
   - Expected result: 두 메서드 모두 존재
   - Covers: AC-2, AC-3

3) Step: ExtensionSlot 래핑 확인
   - Command / click path: `grep -n "ErrorBoundary" v10/src/features/extensions/ui/ExtensionSlot.tsx`
   - Expected result: import + JSX 래핑 확인
   - Covers: AC-4

4) Step: ExtensionRuntimeBootstrap 래핑 확인
   - Command / click path: `grep -n "ErrorBoundary" v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
   - Expected result: import + JSX 래핑 확인
   - Covers: AC-5

5) Step: 빌드 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-7, AC-8

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ErrorBoundary class component에서 hooks 사용 불가
    → fallback UI에서 store 접근 금지 (순수 정적 메시지만)
  - ErrorBoundary는 비동기 에러(Promise rejection)를 잡지 못함
    → 동기 render 에러만 격리됨 (설계상 의도된 제약)
  - ExtensionRuntimeBootstrap.tsx가 크므로 (코드 확인 필요) 래핑 위치 주의
    → 함수형 컴포넌트 반환 직전의 최상위 JSX를 래핑
- Roll-back:
  - ErrorBoundary.tsx 삭제 + ExtensionSlot, ExtensionRuntimeBootstrap에서 래핑 제거
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/ui/components/ErrorBoundary.tsx` (new)
- `v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `codex_tasks/task_276_error_boundary_extension_layer.md`

Commands run:
- `ls v10/src/ui/components/ErrorBoundary.tsx`
- `grep -n "getDerivedStateFromError\|componentDidCatch" v10/src/ui/components/ErrorBoundary.tsx`
- `grep -n "ErrorBoundary" v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `grep -n "ErrorBoundary" v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `./scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint: Not run (deferred by user instruction)
- Build: Not run (deferred by user instruction)
- Script checks: PASS (`grep`/`ls` evidence + `check_layer_rules`)

## Failure Classification (Codex fills when any gate fails)

- No newly introduced failing gate.
- Deferred gates (lint/build) are user-requested deferrals, non-blocking for this scoped implementation step.

Manual verification notes:
- Step 1 (AC-1): `ls v10/src/ui/components/ErrorBoundary.tsx` => file exists.
- Step 2 (AC-2, AC-3): `grep -n "getDerivedStateFromError\|componentDidCatch" ...` => lines 28, 32 confirmed.
- Step 3 (AC-4): `grep -n "ErrorBoundary" v10/src/features/extensions/ui/ExtensionSlot.tsx` => import + wrapper usage at lines 18, 58, 73.
- Step 4 (AC-5): `grep -n "ErrorBoundary" v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx` => import + top-level return wrapper at lines 64, 949.
- Step 5 (AC-7, AC-8): lint/build intentionally not executed per user constraint in this turn.
- Guardrail check: `./scripts/check_layer_rules.sh` => PASS (no layer violations).

Notes:
- task_273 분할로 생성됨. task_273은 SUPERSEDED.
- Shell 레이어(AppLayout, WindowHost)는 task_277에서 처리.
