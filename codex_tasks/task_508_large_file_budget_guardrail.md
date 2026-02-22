# Task 508: Large-file Budget Guardrail (P6 stabilization gate)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - P6 분해 대상 파일(AppLayout, ExtensionRuntimeBootstrap, DataInputPanel)의 라인 수 예산을 고정하는 guardrail 스크립트를 추가한다.
  - `run_repo_verifications.sh` 체인에 대형 파일 budget check를 연결한다.
- What must NOT change:
  - 런타임 동작 변경 금지.
  - 기존 guardrail FAIL 기준 완화 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh` (new)
- `codex_tasks/workflow/large_file_budget.env` (new)
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_508_large_file_budget_guardrail.md`

Out of scope:
- app runtime 코드 수정
- 기존 budget 스크립트 임계값 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - shell script 기반으로 구현, npm deps 추가 금지.
- Compatibility:
  - pre-commit/pre-push 검증 체인과 충돌 없이 동작해야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-STABILIZE-BUDGET
- Depends on tasks:
  - `task_504`
  - `task_506`
  - `task_507`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-P6-STABILIZE
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO (final gate task)
- Rationale:
  - 이전 slicing 결과를 예산화해 고정하는 마무리 단계.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - N/A
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: large-file budget script가 대상 파일 라인 수를 읽고 threshold 초과 시 FAIL한다.
- [x] AC-2: `run_repo_verifications.sh`에서 large-file budget check가 실행된다.
- [x] AC-3: baseline 기준 현재 결과 PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS (현재 baseline).
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path:
     - `rg -n "check_v10_large_file_budget\.sh" scripts/run_repo_verifications.sh`
   - Expected result:
     - 검증 체인 연결 확인.
   - Covers: AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - threshold를 과도하게 낮게 잡으면 반복 FAIL 유발.
- Roll-back:
  - 신규 budget gate 제거 또는 threshold 상향.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_v10_large_file_budget.sh`
- `rg -n "check_v10_large_file_budget\\.sh" scripts/run_repo_verifications.sh`
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/run_repo_verifications.sh --stage end`

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- ...
