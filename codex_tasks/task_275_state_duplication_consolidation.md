# Task 275: useLocalStore 데드 스테이트 제거

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

Previous version: 이전 스펙(2026-02-17)의 globalStep/sharedViewport 중복 주장이 사실과 다름을 확인하여 재작성.

---

## 사실 검증 기록 (Spec 재작성 근거)

직접 코드 확인 결과 (Read 도구, 2026-02-18):

```
[ FAIL ] globalStep이 useLocalStore에 있음
         → 실제: useLocalStore.ts 60줄 전체에 globalStep 없음.
           globalStep은 useSyncStore.ts:57에만 정의됨.

[ FAIL ] sharedViewport 중복 → useViewportStore로 SSOT 통합
         → 실제: 세 viewport 필드는 다른 의미:
           - useSyncStore.sharedViewport: 네트워크로 host↔student 동기화되는 공유 상태
           - useLocalStore.localViewport: 학생 클라이언트 전용 로컬 뷰포트 (프라이빗)
           - useViewportStore.viewport: 호스트 렌더링 상태
           병합 시 세션 경계 파괴 → 통합 불가.

[ PASS ] useLocalStore에 외부 호출자 없는 데드 필드 존재
         → isPanelOpen: 외부에서 state.isPanelOpen 읽는 파일 0개
         → localViewport: 외부에서 state.localViewport 읽는 파일 0개
         → setPanelOpen: 외부에서 호출하는 파일 0개
         → setLocalViewport: 외부에서 호출하는 파일 0개
         (grep -r setPanelOpen/setLocalViewport/localViewport in src/**/* 확인)

[ PASS ] INITIAL_VIEWPORT 상수가 useLocalStore.ts:19에만 남아 있음
         (localViewport 제거 후 불필요)
```

---

## Goal (Base Required)
- What to change:
  - `useLocalStore.ts`에서 외부 호출자가 없는 데드 스테이트/메서드를 제거
  - 제거 대상 (확인됨):
    - `isPanelOpen: boolean` 필드 및 초기값
    - `localViewport: SharedViewportState` 필드 및 초기값
    - `setPanelOpen(isOpen: boolean)` setter
    - `setLocalViewport(viewport: SharedViewportState)` setter
    - `INITIAL_VIEWPORT` 상수 (localViewport에만 사용됨)
    - `normalizeFinite` 헬퍼 (cloneViewport에만 사용됨)
    - `cloneViewport` 헬퍼 (localViewport setter에만 사용됨)
    - interface에서 위 항목들의 타입 선언
  - 결과: useLocalStore는 역할 식별(role + trustedRoleClaim) 전용 스토어로 단순화됨
- What must NOT change:
  - `role: LocalRole`, `trustedRoleClaim: LocalRole | null` 및 관련 setter 유지
  - useLocalStore를 import하는 모든 파일의 동작 결과 (role/trustedRoleClaim 접근만 사용)
  - 다른 store 파일 변경 없음

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/store/useLocalStore.ts` (write) — 데드 스테이트 7개 항목 제거

Out of scope:
- useSyncStore, useViewportStore, useChromeStore, useUIStoreBridge 변경 없음
- useLocalStore를 import하는 컴포넌트 변경 없음 (role/trustedRoleClaim만 사용 중)
- isPanelOpen/localViewport를 사용하는 다른 스토어 작업

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - useLocalStore는 store 레이어에 유지 (이동 없음)
  - SharedViewportState import (`from "./useSyncStore"`)도 제거 (localViewport 제거 후 불필요)
- Compatibility:
  - 제거 대상 필드/메서드의 외부 호출자가 0개임을 grep으로 재확인 후 구현

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W1-store-cleanup
- Depends on tasks: []
- Enables tasks: [useLocalStore 단순화로 인한 이후 role 관련 리팩토링 용이]
- Parallel group: G1-core
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 1
- Files shared with other PENDING tasks: none
  - useLocalStore.ts는 task_274, 276, 277과 충돌 없음
- Cross-module dependency: NO (단일 파일 내 정리)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~15min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES
  - 다른 PENDING 태스크와 파일 충돌 없어 Wave 1 병렬 가능
- Rationale:
  - 파일 1개, 데드 코드 삭제. 내부는 단일 에이전트 순차 실행, 배치 웨이브에서만 병렬.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - task_275 only
- Assigned roles:
  - Implementer-A: useLocalStore 데드 스테이트 제거
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan:
  - `useLocalStore.ts`는 Implementer-A 단독 소유
- Parallel slot plan:
  - 내부 병렬 없음 (single-agent sequential execution)
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC (batch wave slot reuse)
  - Slot priority rule (DYNAMIC only):
    - shortest-job-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 1 executor + 0 reviewer (task local)
  - Ready-queue refill trigger:
    - task 완료 이벤트 시 슬롯 즉시 반납
  - Agent close/reuse policy:
    - 완료 즉시 close 후 다음 runnable task에 slot 재사용
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
  - [ ] Structure changes: 없음 (파일 삭제/생성 없음)
  - [x] Semantic/rule changes:
    - v10/AI_READ_ME.md에 "useLocalStore 역할" 명시 권장:
      - useLocalStore SSOT: role (LocalRole) + trustedRoleClaim (LocalRole | null)
      - viewport/panel 상태는 useLocalStore 소관 아님

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `useLocalStore.ts`에서 `isPanelOpen` 필드/setter/초기값이 제거됨
- [x] AC-2: `useLocalStore.ts`에서 `localViewport` 필드/setter/초기값이 제거됨
- [x] AC-3: `useLocalStore.ts`에서 `INITIAL_VIEWPORT`, `normalizeFinite`, `cloneViewport`가 제거됨
- [x] AC-4: `useLocalStore.ts`에서 `SharedViewportState` import가 제거됨
- [x] AC-5: 남은 인터페이스에 role, trustedRoleClaim, setRole, setTrustedRoleClaim, clearTrustedRoleClaim만 존재
- [ ] AC-6: `npm run lint` 통과 (미사용 import 없음) — 사용자 지시로 본 작업에서 미실행
- [ ] AC-7: `npm run build` 통과 (외부 참조 없으므로 빌드 오류 없음) — 사용자 지시로 본 작업에서 미실행

---

## Manual Verification Steps (Base Required)

1) Step: 제거 대상 필드 부재 확인
   - Command / click path: `grep -n "isPanelOpen\|localViewport\|setPanelOpen\|setLocalViewport\|INITIAL_VIEWPORT" v10/src/features/store/useLocalStore.ts`
   - Expected result: 매치 없음 (0 lines)
   - Covers: AC-1, AC-2, AC-3

2) Step: 남은 인터페이스 확인
   - Command / click path: `cat v10/src/features/store/useLocalStore.ts` (전체 확인)
   - Expected result: role, trustedRoleClaim 관련 5개 항목만 존재
   - Covers: AC-5

3) Step: 외부 참조 없음 재확인 (구현 전)
   - Command / click path: `grep -r "setPanelOpen\|setLocalViewport\|localViewport\|isPanelOpen" v10/src --include="*.ts" --include="*.tsx" | grep -v useLocalStore.ts`
   - Expected result: 매치 없음
   - Covers: 사실 검증 재확인

4) Step: 빌드 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - grep으로 확인했지만 동적 속성 접근(state["isPanelOpen"])으로 참조하는 경우가 있을 수 있음
    → build 게이트가 타입 오류로 이를 잡아줌 (TypeScript strict mode)
  - SharedViewportState import 제거 시 다른 타입 참조가 있는지 확인 필요
    → useLocalStore.ts에서 SharedViewportState는 localViewport 타입으로만 사용됨. 제거 안전.
- Roll-back:
  - useLocalStore.ts 원본으로 복원
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.
> 구현 전 AC-5의 grep 재확인 필수 (외부 호출자 0개 확인).

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/store/useLocalStore.ts`
- `codex_tasks/task_275_state_duplication_consolidation.md`

Commands run:
- `sed -n '1,260p' codex_tasks/task_275_state_duplication_consolidation.md`
- `sed -n '1,320p' v10/src/features/store/useLocalStore.ts`
- `rg -n "setPanelOpen|setLocalViewport|localViewport|isPanelOpen" v10/src -g '*.ts' -g '*.tsx' -g '!features/store/useLocalStore.ts'`
- `rg -n "useLocalStore" v10/src -g '*.ts' -g '*.tsx'`
- `for f in $(rg -l "useLocalStore" v10/src -g '*.ts' -g '*.tsx'); do rg -n "isPanelOpen|localViewport|setPanelOpen|setLocalViewport" "$f" && echo "-- $f"; done` (구현 전/후 각 1회)
- `grep -n "isPanelOpen\\|localViewport\\|setPanelOpen\\|setLocalViewport\\|INITIAL_VIEWPORT" v10/src/features/store/useLocalStore.ts`
- `sed -n '1,220p' v10/src/features/store/useLocalStore.ts`

## Gate Results (Codex fills)

- Lint: SKIPPED (사용자 지시: full lint/build 미실행)
- Build: SKIPPED (사용자 지시: full lint/build 미실행)
- Script checks: PASS (task-local grep/rg 검증 통과)

## Failure Classification (Codex fills when any gate fails)

- N/A

Manual verification notes:
- 구현 전 외부 참조 검증:
  - `useLocalStore`를 import하는 파일만 대상으로 제거 대상 심볼 검색 수행.
  - 결과: 매치 파일은 `v10/src/features/store/useLocalStore.ts` 1개뿐 (외부 호출자 없음 확인).
- 구현 후 부재 검증:
  - `grep -n "isPanelOpen\\|localViewport\\|setPanelOpen\\|setLocalViewport\\|INITIAL_VIEWPORT" v10/src/features/store/useLocalStore.ts`
  - 결과: 출력 0줄 (AC-1/2/3 충족).
- 구현 후 인터페이스 검증:
  - `sed -n '1,220p' v10/src/features/store/useLocalStore.ts`
  - 결과: `role`, `trustedRoleClaim`, `setRole`, `setTrustedRoleClaim`, `clearTrustedRoleClaim`만 존재 (AC-5 충족).
- role/trustedRoleClaim 동작 보존:
  - 초기값/세터 로직 변경 없이 유지됨을 코드 diff로 확인.

Notes:
- 2026-02-17 스펙의 globalStep/sharedViewport 중복 주장이 사실과 다름을 직접 코드 읽기로 확인.
- 실제 문제: useLocalStore에 외부 호출자 없는 데드 스테이트 존재.
- 재작성 후 scope 1파일로 단순화됨.
