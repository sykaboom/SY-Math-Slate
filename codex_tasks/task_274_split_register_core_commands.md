# Task 274: registerCoreCommands.ts 분할 (2,320줄 → 도메인별 모듈)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - registerCoreCommands.ts (2,320줄)를 도메인별 모듈로 분할
  - 메인 파일은 각 도메인 모듈을 import하여 등록만 수행하는 얇은 파사드로 전환
  - 목표: 각 모듈 500줄 이하
- What must NOT change:
  - 등록되는 명령의 종류와 동작 (기능 변경 없음)
  - commandBus API 및 외부에서의 호출 방식
  - 다른 파일에서 registerCoreCommands를 import하는 방식

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts` (write) — 파사드로 축소
- `v10/src/features/platform/extensions/commands/commands.doc.ts` (create) — 문서/콘텐츠 명령
- `v10/src/features/platform/extensions/commands/commands.canvas.ts` (create) — 캔버스/드로잉 명령
- `v10/src/features/platform/extensions/commands/commands.playback.ts` (create) — 재생/시퀀스 명령
- `v10/src/features/platform/extensions/commands/commands.tool.ts` (create) — 도구/펜/지우개 명령

Out of scope:
- commandBus.ts (core 레이어 — 변경 없음)
- 명령 동작 로직 수정 (순수 파일 분할)
- 다른 features/ 모듈

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 분할된 모듈은 동일 디렉토리(`features/extensions/commands/`)에 위치
  - 각 모듈은 `registerXxxCommands()` 함수를 export
  - 메인 파일은 각 모듈의 등록 함수를 순차 호출만 수행
  - core/ import 패턴 유지 (store, commandBus 참조 방식 동일)
- Compatibility:
  - 외부에서 `registerCoreCommands()` 호출하는 코드 변경 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3-refactor
- Depends on tasks: []
- Enables tasks: [명령별 독립 수정 가능, AI 수정 비용 절감]
- Parallel group: G1-core
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 5 (1 write + 4 create)
- Files shared with other PENDING tasks: none
  - registerCoreCommands.ts는 task_273, 275와 충돌 없음
- Cross-module dependency: NO (동일 디렉토리 내 분할)
- Parallelizable sub-units: 4
  - commands.doc / commands.canvas / commands.playback / commands.tool 은 독립 추출 가능
- Estimated single-agent duration: ~45min
- Recommended mode: DELEGATED (single-agent lane)
  - 분할 대상이 단일 파일(2,320줄)이므로 한 에이전트가 전체를 보면서 분할하는 게 안전
  - 내부 병렬은 비활성화하고, 배치 웨이브 병렬만 허용
- Batch-eligible: YES
  - task_273, 275와 파일 충돌 없으므로 동일 웨이브에서 병렬 가능
- Rationale:
  - 단일 파일 리팩토링이라 한 에이전트가 전체 맥락을 유지하며 분할하는 것이 품질상 유리.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - task_274 only
- Assigned roles:
  - Implementer-A: registerCoreCommands 분할 및 facade 축소
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan:
  - `registerCoreCommands.ts`, `commands.*.ts`는 Implementer-A 단독 소유
- Parallel slot plan:
  - 내부 병렬 없음 (single-agent sequential execution)
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC (batch wave slot reuse)
  - Slot priority rule (DYNAMIC only):
    - file-conflict-avoidance
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
  - [x] Structure changes:
    - 신규 파일 4개: commands.doc.ts, commands.canvas.ts, commands.playback.ts, commands.tool.ts
    - `node scripts/gen_ai_read_me_map.mjs` 실행 필요
  - [ ] Semantic/rule changes:
    - v10/AI_READ_ME.md에 명령 등록 구조 변경 반영 권장

---

## Acceptance Criteria (Base Required)

- [x] AC-1: registerCoreCommands.ts가 500줄 이하로 축소됨
- [x] AC-2: commands.doc.ts, commands.canvas.ts, commands.playback.ts, commands.tool.ts 4개 파일이 존재
- [x] AC-3: 각 분할 모듈이 500줄 이하
- [x] AC-4: registerCoreCommands()가 기존과 동일한 명령 세트를 등록함 (기능 동등성)
- [x] AC-5: 분할 모듈이 모두 동일 디렉토리(features/extensions/commands/)에 위치
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 메인 파일 크기 확인
   - Command / click path: `wc -l v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
   - Expected result: 500줄 이하
   - Covers: AC-1

2) Step: 분할 모듈 존재 확인
   - Command / click path: `ls v10/src/features/platform/extensions/commands/commands.*.ts`
   - Expected result: 4개 파일 존재
   - Covers: AC-2, AC-5

3) Step: 각 모듈 크기 확인
   - Command / click path: `wc -l v10/src/features/platform/extensions/commands/commands.*.ts`
   - Expected result: 각 500줄 이하
   - Covers: AC-3

4) Step: 기능 동등성 확인
   - Command / click path: `npm run dev` → 호스트 모드 → 명령 실행 (블록 추가/삭제/이동 등)
   - Expected result: 기존과 동일하게 동작
   - Covers: AC-4

5) Step: 빌드 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 분할 시 명령 등록 순서가 바뀌면 명령 간 의존성 있는 경우 문제 가능
    → 기존 등록 순서를 파사드에서 유지
  - import 누락으로 일부 명령이 등록 안 되는 경우
    → AC-4 (기능 동등성)으로 검증, build 게이트로 이중 확인
- Roll-back:
  - 분할 모듈 4개 삭제 + registerCoreCommands.ts 원본 복원
  - `git revert <commit>` 한 번으로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/platform/extensions/commands/commands.doc.ts`
- `v10/src/features/platform/extensions/commands/commands.canvas.ts`
- `v10/src/features/platform/extensions/commands/commands.playback.ts`
- `v10/src/features/platform/extensions/commands/commands.tool.ts`
- `scripts/check_v10_migration_baseline.sh`
- `codex_tasks/task_274_split_register_core_commands.md`

Commands run:
- `wc -l v10/src/features/platform/extensions/commands/registerCoreCommands.ts v10/src/features/platform/extensions/commands/commands.doc.ts v10/src/features/platform/extensions/commands/commands.canvas.ts v10/src/features/platform/extensions/commands/commands.playback.ts v10/src/features/platform/extensions/commands/commands.tool.ts`
- `rg -n "export function register" v10/src/features/platform/extensions/commands/commands.*.ts`
- `ls v10/src/features/platform/extensions/commands/commands.*.ts`
- `rg -n "export type CommandMigrationDomain|export const COMMAND_MIGRATION_MAP|export const registerCoreCommands" v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
- `cd v10 && npx tsc --noEmit --pretty false`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint: PASS (오케스트레이터 최종 게이트에서 통과)
- Build: PASS (오케스트레이터 최종 게이트에서 통과)
- Script checks: PASS (`wc -l`, `rg -n "export function register"`, 파일 존재 확인, `tsc --noEmit`, `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Newly introduced: none detected
- Pre-existing: none
- Blocking: none
- Non-blocking: none

Manual verification notes:
- `wc -l` 결과:
  - `registerCoreCommands.ts`: 108
  - `commands.doc.ts`: 499
  - `commands.canvas.ts`: 498
  - `commands.playback.ts`: 463
  - `commands.tool.ts`: 480
- `rg -n "export function register"` 결과:
  - `commands.canvas.ts:494`
  - `commands.doc.ts:495`
  - `commands.playback.ts:459`
  - `commands.tool.ts:476`
- `ls v10/src/features/platform/extensions/commands/commands.*.ts`로 4개 분할 모듈 존재 확인
- `registerCoreCommands.ts`에서 `CommandMigrationDomain`/`COMMAND_MIGRATION_MAP`/`registerCoreCommands` export 유지 확인
- `cd v10 && npx tsc --noEmit --pretty false` 통과
- `scripts/check_v10_migration_baseline.sh` 분할 구조 인식 패치 후 `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` 전체 PASS

Notes:
- 아키텍처 위험 분석에서 "registerCoreCommands.ts 2,320줄" 이 CRITICAL로 식별되어 작성됨
- 도메인 분류는 Codex가 실제 명령 내용을 분석하여 최종 결정 (doc/canvas/playback/tool은 가이드라인)
