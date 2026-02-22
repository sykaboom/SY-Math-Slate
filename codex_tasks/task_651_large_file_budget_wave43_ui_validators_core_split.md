# Task 651: large-file budget wave43 ui validators core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - W43 분할 결과를 budget/env/doc 체인에 반영한다.
- What must NOT change:
  - 기존 wave1~42 budget 검증 체인 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/workflow/large_file_budget.env`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_651_large_file_budget_wave43_ui_validators_core_split.md`

Out of scope:
- checker script 구조 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - env/doc만 조정.
- Compatibility:
  - 기존 checker 포맷/행동 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W43
- Depends on tasks:
  - `task_649`
  - `task_650`
- Enables tasks:
  - follow-up W44
- Parallel group:
  - G-P6-SLICE-W43-Z
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~10min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - budget/doc 동기화는 직렬이 안전하다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - N/A
- [ ] Semantic/rule changes:
  - `v10/AI_READ_ME.md` 최신 wave 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `BUDGET_WAVE`가 `W-P6-SLICE-W43`으로 갱신된다.
- [x] AC-2: W43 대상 budget threshold가 tighten된다.
- [x] AC-3: `bash scripts/check_v10_large_file_budget.sh` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS + `budget_wave=W-P6-SLICE-W43`
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - threshold 과도 축소 시 budget gate fail.
- Roll-back:
  - env/doc 변경 revert.

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
- `v10/AI_READ_ME.md`
- `codex_tasks/task_651_large_file_budget_wave43_ui_validators_core_split.md`

Commands run (only if user asked or required by spec):
- `bash -n scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

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
