# Task 277: React Error Boundary 구축 — 셸 레이어 (2/2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

Supersedes: task_273 (분할 2/2; task_276이 먼저 완료되어야 함)

---

## Goal (Base Required)
- What to change:
  - AppLayout: 주요 영역(캔버스 영역, 툴바, 패널 영역)을 ErrorBoundary로 래핑
  - WindowHost: 각 패널(window)을 개별 ErrorBoundary로 래핑
  - 셸 레이어 크래시를 영역별로 격리
- What must NOT change:
  - 정상 동작 시 렌더링 결과 변경 없음 (에러 미발생 시 투명)
  - AppLayout, WindowHost의 props/API 변경 없음
  - 레이아웃 계산 및 포지셔닝 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/layout/AppLayout.tsx` (write) — 주요 영역에 ErrorBoundary 래핑
- `v10/src/features/chrome/layout/windowing/WindowHost.tsx` (write) — 각 패널에 개별 ErrorBoundary 래핑

Out of scope:
- ErrorBoundary 컴포넌트 생성 → task_276에서 완료
- ExtensionSlot, ExtensionRuntimeBootstrap 래핑 → task_276에서 완료
- Error logging/reporting 서비스 연동
- retry/recovery 로직

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
  - `v10/src/ui/components/ErrorBoundary.tsx`는 task_276에서 생성됨
  - task_276 완료 후에만 이 태스크 시작 가능
- Boundary rules:
  - AppLayout, WindowHost는 `ui/components/ErrorBoundary`를 import
  - ErrorBoundary 내부에서 store hook 사용 불가 → fallback은 정적 메시지
- Compatibility:
  - AppLayout은 현재 useLocalStore(role), useChromeStore, useUIStore를 사용 — 변경 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W2-boundary-shell
- Depends on tasks: [task_276]
- Enables tasks: [v10/AI_READ_ME.md Error Boundary 정책 항목 추가]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: none
  - AppLayout.tsx: task_266 COMPLETED 이후 변경 없음. task_277 단독 소유.
  - WindowHost.tsx: 다른 PENDING 태스크와 충돌 없음.
- Cross-module dependency: YES (features/layout → ui/components)
- Parallelizable sub-units: 0
  - AppLayout 래핑 후 WindowHost 래핑 (순차, 단 의존성은 없음 — 동시 가능)
- Estimated single-agent duration: ~15min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (task_276 완료 후 즉시 Wave 2로 투입 가능)
- Rationale:
  - 파일 2개, 단순 래핑 작업. 내부 병렬 없이 1개 에이전트 순차 실행 + DYNAMIC 슬롯 재활용.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - task_277 only
- Assigned roles:
  - Implementer-A: AppLayout + WindowHost 래핑
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan:
  - `AppLayout.tsx`, `WindowHost.tsx`는 Implementer-A 단독 소유
- Parallel slot plan:
  - 내부 병렬 없음 (single-agent sequential execution)
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC (batch wave slot reuse)
  - Slot priority rule (DYNAMIC only):
    - dependency-first (task_276 완료 직후 투입)
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 1 executor + 0 reviewer (task local)
  - Ready-queue refill trigger:
    - task_276 완료 이벤트 시 즉시 실행 큐 등록
  - Agent close/reuse policy:
    - 완료 즉시 close 후 슬롯 반납
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
  - [x] Structure changes: 없음 (신규 파일 없음)
  - [x] Semantic/rule changes:
    - v10/AI_READ_ME.md에 "Error Boundary 정책" 항목 추가:
      - ErrorBoundary SSOT: `v10/src/ui/components/ErrorBoundary.tsx`
      - 적용 경계: ExtensionSlot, ExtensionRuntimeBootstrap, AppLayout 주요 영역, WindowHost 패널

---

## Acceptance Criteria (Base Required)

- [x] AC-1: AppLayout에서 캔버스 영역이 ErrorBoundary로 래핑됨
- [x] AC-2: AppLayout에서 툴바/패널 영역이 ErrorBoundary로 래핑됨
- [x] AC-3: WindowHost에서 각 패널이 개별 ErrorBoundary로 래핑됨 (패널별 격리)
- [x] AC-4: 정상 동작 시 렌더링 결과 변화 없음
- [ ] AC-5: `npm run lint` 통과
- [ ] AC-6: `npm run build` 통과
- [x] AC-7: v10/AI_READ_ME.md에 Error Boundary 정책 항목이 추가됨

---

## Manual Verification Steps (Base Required)

1) Step: AppLayout ErrorBoundary 래핑 확인
   - Command / click path: `grep -n "ErrorBoundary" v10/src/features/chrome/layout/AppLayout.tsx`
   - Expected result: import + 주요 영역 JSX 래핑 확인
   - Covers: AC-1, AC-2

2) Step: WindowHost 패널별 래핑 확인
   - Command / click path: `grep -n "ErrorBoundary" v10/src/features/chrome/layout/windowing/WindowHost.tsx`
   - Expected result: 패널 map/render 내부에 ErrorBoundary 래핑 확인
   - Covers: AC-3

3) Step: 정상 렌더링 회귀 확인
   - Command / click path: `npm run dev` → 호스트 모드 → 캔버스/툴바/패널 정상 표시 확인
   - Expected result: 기존과 동일
   - Covers: AC-4

4) Step: 빌드 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-5, AC-6

5) Step: AI_READ_ME.md 업데이트 확인
   - Command / click path: `grep -n "Error Boundary" v10/AI_READ_ME.md`
   - Expected result: 항목 존재
   - Covers: AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - AppLayout.tsx에서 올바른 래핑 경계를 잡지 못하면 레이아웃 영역 전체가 fallback으로 대체됨
    → 영역 단위로 개별 ErrorBoundary (캔버스 하나, 툴바 하나, 패널 하나)
  - WindowHost에서 패널별이 아닌 전체를 하나의 ErrorBoundary로 감싸면 격리 효과 없음
    → 패널 렌더링 map 내부에서 개별 래핑 확인 필수
- Roll-back:
  - AppLayout, WindowHost에서 ErrorBoundary 래핑 제거
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.
> Prerequisite: task_276 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/windowing/WindowHost.tsx`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_277_error_boundary_shell_layer.md`

Commands run:
- `grep -n "ErrorBoundary" v10/src/features/chrome/layout/AppLayout.tsx`
- `grep -n "ErrorBoundary" v10/src/features/chrome/layout/windowing/WindowHost.tsx`
- `grep -n "Error Boundary" v10/AI_READ_ME.md`
- `./scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint: Not run (deferred by user instruction: no full lint/build in this turn)
- Build: Not run (deferred by user instruction: no full lint/build in this turn)
- Script checks: PASS (`[check_layer_rules] PASS (no layer violations)`)

## Failure Classification (Codex fills when any gate fails)

- No newly introduced failing gate.
- Deferred gates (lint/build) are user-requested deferrals and are non-blocking for this scoped implementation step.

Manual verification notes:
- Step 1 (AC-1, AC-2): `grep -n "ErrorBoundary" v10/src/features/chrome/layout/AppLayout.tsx`
  - import 확인: line 33
  - 캔버스/패널/툴바 래핑 확인: lines 580, 592, 610, 650 (closing tags at 590, 607, 630, 669)
- Step 2 (AC-3): `grep -n "ErrorBoundary" v10/src/features/chrome/layout/windowing/WindowHost.tsx`
  - import 확인: line 6
  - docked/windowed 패널 개별 래핑 확인: lines 138, 224 (closing tags at 146, 232)
- Step 3 (AC-4): ErrorBoundary는 정상 경로에서 children을 그대로 반환하므로 기존 레이아웃/동작 경로를 유지함 (no-error path transparent).
- Step 4 (AC-5, AC-6): lint/build는 사용자 제약으로 미실행.
- Step 5 (AC-7): `grep -n "Error Boundary" v10/AI_READ_ME.md` → line 53에 정책 섹션 추가 확인.
- Guardrail check: `./scripts/check_layer_rules.sh` → `[check_layer_rules] PASS (no layer violations)`

Notes:
- task_273 분할로 생성됨. task_276(ErrorBoundary 생성 + 확장 레이어)이 먼저 완료되어야 함.
