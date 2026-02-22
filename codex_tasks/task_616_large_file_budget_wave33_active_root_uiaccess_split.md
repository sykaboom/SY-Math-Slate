# Task 616: large-file budget wave33 active/root/ui-access split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - W33 split 결과를 `large_file_budget.env` + budget check script에 반영한다.
- What must NOT change:
  - 기존 wave1~32 검증 로직/출력 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/workflow/large_file_budget.env`
- `scripts/check_v10_large_file_budget.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_616_large_file_budget_wave33_active_root_uiaccess_split.md`

Out of scope:
- unrelated budget lane threshold 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget guard chain only
- Compatibility:
  - prior wave checks 모두 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W33
- Depends on tasks:
  - `task_613`
  - `task_614`
  - `task_615`
- Enables tasks:
  - follow-up W34
- Parallel group:
  - G-P6-SLICE-W33-Z
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
  - budget/env/script 동시 갱신은 직렬이 안전.

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

- [ ] AC-1: `BUDGET_WAVE`가 `W-P6-SLICE-W33`로 갱신된다.
- [ ] AC-2: wave33 row가 budget script 출력/검증에 포함된다.
- [ ] AC-3: 신규 split 파일 max 키가 env/script에 반영된다.
- [ ] AC-4: lint/build/check_v10_large_file_budget PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS + wave33 line 출력
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - budget script key mismatch로 false fail 가능.
- Roll-back:
  - wave33 key set/print/check 블록 revert.

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
- `codex_tasks/task_616_large_file_budget_wave33_active_root_uiaccess_split.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `BUDGET_WAVE=W-P6-SLICE-W33` 반영 확인.
- wave33 helper 키/print/check 블록 추가 및 PASS 확인.
- `AI_READ_ME.md` 최신 slicing wave를 W33로 동기화.
