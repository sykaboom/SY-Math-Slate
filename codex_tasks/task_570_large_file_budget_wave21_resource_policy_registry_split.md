# Task 570: Large-file Budget Wave21 (resource-policy sections + registry state/overrides split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - wave21 split에 맞춰 budget/env/script/doc을 동기화한다.
  - facade 임계치를 tighten한다.
- What must NOT change:
  - 기존 wave1~20 budget/guard semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_570_large_file_budget_wave21_resource_policy_registry_split.md`

Out of scope:
- runtime selector/guard semantics 변경
- non-budget script 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget/env/doc update only
- Compatibility:
  - existing budget keys 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W21
- Depends on tasks:
  - `task_567`, `task_568`, `task_569`
- Enables tasks:
  - next wave
- Parallel group:
  - G-P6-SLICE-W21-D
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
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - split 이후 budget gate를 wave21 기준으로 고정.

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
- [x] Structure changes (file/folder add/move/delete)
- [x] Semantic/rule changes

---

## Acceptance Criteria (Base Required)

- [x] AC-1: wave21 split 파일 budget key/존재 체크가 반영된다.
- [x] AC-2: `BUDGET_WAVE=W-P6-SLICE-W21`로 갱신되고 facade 임계치가 tighten된다.
- [x] AC-3: `bash scripts/check_v10_large_file_budget.sh` PASS.
- [x] AC-4: AI_READ_ME + MAP 최신 상태 반영.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash -n scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - syntax OK
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS + wave21 metrics line
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - map up-to-date
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - env/script key mismatch로 false FAIL 발생 가능.
- Roll-back:
  - wave21 key/print/check 블록만 revert.

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
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_570_large_file_budget_wave21_resource_policy_registry_split.md`

Commands run:
- `bash -n scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `node scripts/gen_ai_read_me_map.mjs`
- `node scripts/gen_ai_read_me_map.mjs --check`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `BUDGET_WAVE` updated to `W-P6-SLICE-W21`.
- facade budgets tightened to 40 for `resourcePolicy/sections.ts`, `registry/runtimeRegistryState.ts`, `registry/resourceOverrides.ts`.
- wave21 subfile metrics/thresholds were added and validated with PASS.
