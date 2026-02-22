# Task 563: Large-file Budget Wave19 (resource-policy validator split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave19 split 파일 budget 항목을 추가하고 validator facade budget을 tighten한다.
  - budget 출력에 Wave19 섹션을 추가한다.
- What must NOT change:
  - 기존 wave1~18 budget/guard semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_563_large_file_budget_wave19_resource_policy_validator_split.md`

Out of scope:
- runtime selector/guard logic semantics 변경
- non-budget scripts 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget/env/doc update only
- Compatibility:
  - pre-existing budget keys 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W19
- Depends on tasks:
  - `task_561`, `task_562`
- Enables tasks:
  - next wave
- Parallel group:
  - G-P6-SLICE-W19-C
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
  - split 후 budget/env/doc 동기화를 한 번에 고정.

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

- [x] AC-1: Wave19 split 파일 budget key/존재 체크가 스크립트에 반영된다.
- [x] AC-2: `BUDGET_WAVE`가 `W-P6-SLICE-W19`로 갱신되고 validator facade 임계치가 tighten된다.
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
     - PASS + wave19 metrics line 출력
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
  - wave19 key/print/check 블록만 revert.

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
- `codex_tasks/task_563_large_file_budget_wave19_resource_policy_validator_split.md`

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
- `GUARDS_RESOURCE_POLICY_*_VALIDATORS_MAX` facade 임계치를 40으로 tighten했고 wave19 split 키 6개 추가.
- 스크립트에 wave19 파일 존재/라인수/임계치 체크 및 summary print를 추가.
- `check_v10_large_file_budget`와 전체 end-stage verification PASS.
