# Task 584: large-file budget wave25 utils/shortcut/input split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave25 분해 결과를 large-file budget/guard script/AI docs에 반영한다.
- What must NOT change:
  - runtime semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/workflow/large_file_budget.env`
- `scripts/check_v10_large_file_budget.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md` (if changed by generator)
- `codex_tasks/task_584_large_file_budget_wave25_utils_shortcut_input_split.md`

Out of scope:
- feature behavior 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget/doc/script layer only
- Compatibility:
  - existing budget script output format 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W25
- Depends on tasks:
  - `task_581`, `task_582`, `task_583`
- Enables tasks:
  - next wave
- Parallel group:
  - G-P6-SLICE-W25-D
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - wave25 budgets/doc guard 동기화.

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

- Docs to update:
  - `v10/AI_READ_ME.md`
  - `v10/AI_READ_ME_MAP.md`

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `large_file_budget.env`에 wave25 budget key와 `BUDGET_WAVE`가 반영된다.
- [x] AC-2: `check_v10_large_file_budget.sh`가 wave25 key를 검증한다.
- [x] AC-3: lint/build + end verification PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS with wave25 row
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build && cd .. && bash scripts/run_repo_verifications.sh --stage end`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - env/script key mismatch 시 budget gate fail.
- Roll-back:
  - wave25 keys 제거 + wave24 budget 복구.

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
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_584_large_file_budget_wave25_utils_shortcut_input_split.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`
- `node scripts/gen_ai_read_me_map.mjs`

Manual verification notes:
- budget wave is now `W-P6-SLICE-W25`; wave25 row is printed and validated.
