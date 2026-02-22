# Task 639: large-file budget wave39 command/shortcut entry core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - W39 split 결과를 budget env/script 및 AI readme에 반영한다.
- What must NOT change:
  - 기존 wave1~38 검증 체인 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/workflow/large_file_budget.env`
- `scripts/check_v10_large_file_budget.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_639_large_file_budget_wave39_command_shortcut_entry_core_split.md`

Out of scope:
- unrelated threshold tuning

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget guard chain only
- Compatibility:
  - 기존 wave 출력/검증 형식 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W39
- Depends on tasks:
  - `task_637`
  - `task_638`
- Enables tasks:
  - follow-up W40
- Parallel group:
  - G-P6-SLICE-W39-Z
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - env/script/doc 동기 변경은 직렬이 안전.

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

Doc targets:
- `v10/AI_READ_ME.md`

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `BUDGET_WAVE`가 `W-P6-SLICE-W39`으로 갱신된다.
- [x] AC-2: command/shortcut entry core 파일 2개가 script 존재 체크 + budget check에 반영된다.
- [x] AC-3: facade max(20) / core max(80) 키가 env+script에 동기 반영된다.
- [x] AC-4: lint/build/check_v10_large_file_budget/run_repo_verifications PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS + `budget_wave=W-P6-SLICE-W39`
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

3) Step:
   - Command / click path:
     - `bash scripts/run_repo_verifications.sh --stage end`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - env/script 키 mismatch 시 false fail 가능.
- Roll-back:
  - W39 키/파일/체크 블록 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/workflow/large_file_budget.env`
- `scripts/check_v10_large_file_budget.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_639_large_file_budget_wave39_command_shortcut_entry_core_split.md`

Commands run:
- `bash -n scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- W39 키/라인체크/신규 core 파일 존재 체크 반영 후 PASS.
- AI readme latest slicing wave W39 동기화.

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
