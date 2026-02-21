# Task 472: Task Folder Prune Wave 1 (Delete-heavy hygiene)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `codex_tasks` 내 과도한 누적 task 문서를 1차 삭제 웨이브로 정리한다.
  - 현재 실행 기준선(`task_336+`, 최신 batch plan, workflow/template/hotfix)은 보존한다.
- What must NOT change:
  - `v10/` 코드/동작/런타임 계약 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- Delete targets:
  - `codex_tasks/task_001~task_335` 범위의 root task 파일
  - `codex_tasks/cleanup/superseded_2026_02_21_fullchain/task_*.md`
  - `codex_tasks/cleanup/superseded_2026_02_21_low_quality_fullchain_v1/task_*.md`
  - stale batch plans (report 기준 구형 3개)
    - `codex_tasks/batch_dispatch_plan_2026_02_18.md`
    - `codex_tasks/batch_dispatch_plan_2026_02_20_mod_package_orchestration.md`
    - `codex_tasks/batch_dispatch_plan_2026_02_21_phase0_9.md`
- Spec/update:
  - `codex_tasks/task_472_task_folder_prune_wave1.md` (closeout 기록)

Out of scope:
- `codex_tasks/hotfix/*` 삭제
- `codex_tasks/workflow/*` 삭제
- `_TEMPLATE*`, `_PLAYBOOK*` 삭제
- `task_336+` 삭제

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 삭제 전후 카운트/보존 파일 검증 필수.
- Compatibility:
  - 실행 체인 문서(`task_336+`, 최신 relayout plan, workflow/template/playbook) 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W472
- Depends on tasks:
  - ['task_471']
- Enables tasks:
  - []
- Parallel group:
  - G-task-hygiene-delete-wave1
- Max parallel slots:
  - 6
- Verification stage for this task:
  - mid

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 450+
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO (docs-only)
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - delete list 계산/실행과 검증을 분리하면 실수 가능성을 줄일 수 있음.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - deletion list generation + post-delete verification
  - Assigned roles:
    - Implementer-A: delete execution
    - Reviewer+Verifier: preservation and counts verification
  - File ownership lock plan:
    - `codex_tasks/**` only
  - Parallel slot plan:
    - 2 slots
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - verification-first after delete execution
    - Requested orchestration mode:
      - max orchestration mode on
    - Initial slot split:
      - 1 delete + 1 verify
    - Ready-queue refill trigger:
      - delete 완료 즉시 검증 재실행
    - Agent close/reuse policy:
      - 완료 즉시 close
    - Heartbeat policy:
      - Soft ping threshold: 60s
      - Reassignment threshold: 180s
      - Long-running exceptions: 대량 파일 삭제 단일 커맨드
    - Reassignment safety rule:
      - partial delete 상태일 때 중단 금지, 완료 후 검증에서만 판정
  - Delegated closeout metrics:
    - Peak active slots: 1
    - Average active slots: 1
    - Slot refill count: 0
    - Reassignment count: 0

If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: root `task_*.md` 파일 수가 80 이하.
- [x] AC-2: `task_336+`와 `task_466~472`, 최신 relayout 배치 플랜, workflow/template/playbook 파일이 보존됨.
- [x] AC-3: `codex_tasks/cleanup/superseded_2026_02_21_*` 내 `task_*.md`가 0건.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find codex_tasks -maxdepth 1 -type f -name 'task_*.md' | wc -l`
   - Expected result:
     - 80 이하
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `find codex_tasks/cleanup/superseded_2026_02_21_fullchain -type f -name 'task_*.md' | wc -l`
     - `find codex_tasks/cleanup/superseded_2026_02_21_low_quality_fullchain_v1 -type f -name 'task_*.md' | wc -l`
   - Expected result:
     - 둘 다 0
   - Covers: AC-3

3) Step:
   - Command / click path:
    - `test -f codex_tasks/task_336_mod_package_contract_and_input_routing_foundation.md`
     - `test -f codex_tasks/task_466_runtime_modding_namespace_convergence.md`
     - `test -f codex_tasks/task_472_task_folder_prune_wave1.md`
     - `test -f codex_tasks/batch_dispatch_plan_2026_02_21_relayout_466_471.md`
     - `test -f codex_tasks/_TEMPLATE_task.md`
     - `test -f codex_tasks/_PLAYBOOK_subagent_oneclick.md`
   - Expected result:
     - 모두 존재
   - Covers: AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 삭제 범위 오판 시 참조 문서 손실 가능.
- Roll-back:
  - 단일 커밋 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- Deleted 461 files total:
  - root tasks `task_001~task_335` (338 files)
  - cleanup superseded tasks (120 files)
  - stale batch plans (3 files)
- Updated:
  - `codex_tasks/task_472_task_folder_prune_wave1.md`

Commands run (only if user asked or required by spec):
- `scripts/task_hygiene_report.sh` (pre)
- deletion script (range/path-based)
- `find codex_tasks -maxdepth 1 -type f -name 'task_*.md' | wc -l`
- `find codex_tasks/cleanup/superseded_2026_02_21_fullchain -type f -name 'task_*.md' | wc -l`
- `find codex_tasks/cleanup/superseded_2026_02_21_low_quality_fullchain_v1 -type f -name 'task_*.md' | wc -l`
- preservation `test -f ...` checks
- `scripts/task_hygiene_report.sh` (post)

## Gate Results (Codex fills)

- Lint:
  - N/A (docs/task cleanup only)
- Build:
  - N/A (docs/task cleanup only)
- Script checks:
  - PASS (`task_hygiene_report`, count/preservation checks)

Manual verification notes:
- Root `task_*.md`: `70`
- Superseded cleanup task files: `0 / 0`
- Keep-set files verified present:
  - `task_336`, `task_466~472`, relayout batch plan, template/playbook
