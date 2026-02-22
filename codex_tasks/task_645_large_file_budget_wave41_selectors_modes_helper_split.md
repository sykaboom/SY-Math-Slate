# Task 645: large-file budget wave41 selectors+modes helper split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - W41 분할 결과를 budget/env/doc 체인에 반영한다.
- What must NOT change:
  - 기존 wave1~40 budget 체크 동작을 깨지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/workflow/large_file_budget.env`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_645_large_file_budget_wave41_selectors_modes_helper_split.md`

Out of scope:
- budget checker script 구조 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget/doc 체인만 변경.
- Compatibility:
  - `scripts/check_v10_large_file_budget.sh` 출력/검증 호환 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W41
- Depends on tasks:
  - `task_643`
  - `task_644`
- Enables tasks:
  - `task_646`
  - `task_647`
- Parallel group:
  - G-P6-SLICE-W41-Z
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
  - env/doc 동기화는 직렬이 안전하다.

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
  - `v10/AI_READ_ME.md` wave 최신값 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: W41 대상 threshold(`helpers/selectors`, `modes/helpers`)가 tighten된다.
- [x] AC-2: 후속 wave 상향(W42)과 호환되도록 budget 체인이 유지된다.
- [x] AC-3: `bash scripts/check_v10_large_file_budget.sh` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS + W41 tighten 항목 유지 (최신 wave 값은 상향 가능)
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - threshold 과도 축소 시 CI fail.
- Roll-back:
  - env 변경 revert 후 이전 wave 값 복원.

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
- `codex_tasks/task_645_large_file_budget_wave41_selectors_modes_helper_split.md`

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
