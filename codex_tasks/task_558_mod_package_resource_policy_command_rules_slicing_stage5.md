# Task 558: mod package resource-policy command rules slicing (stage5)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/resourcePolicy/commandRules.ts`를 facade + parser internals로 분리한다.
  - command rule parsing semantics를 유지한다.
- What must NOT change:
  - invalid-resource-policy error path/message contract 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/` (new)
- `codex_tasks/task_558_mod_package_resource_policy_command_rules_slicing_stage5.md`

Out of scope:
- shortcut/inputBehavior parser semantics 변경
- validateDefinition pipeline 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - resourcePolicy commandRules 내부 분리만 허용
- Compatibility:
  - `parseCommandRules` signature/export 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W18
- Depends on tasks:
  - `task_557`
- Enables tasks:
  - `task_560`
- Parallel group:
  - G-P6-SLICE-W18-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~8
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
  - 단일 guard parser 분리이며 회귀 영향 범위가 작다.

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

- [x] AC-1: `commandRules.ts`는 facade export only.
- [x] AC-2: command rule parser behavior/message/path contract 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract/check_v10_large_file_budget PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts`
   - Expected result:
     - facade export only.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && bash scripts/check_v10_large_file_budget.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - command rule parser에서 optional field 처리 누락.
- Roll-back:
  - `commandRules.ts` 단일 파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/parse.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators.ts`
- `codex_tasks/task_558_mod_package_resource_policy_command_rules_slicing_stage5.md`

Commands run:
- `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade 파일(`commandRules.ts`)은 export-only로 축소되었고 parser/validator가 `commandRules/*`로 분리됨.
- commandId/operation/overrideAllowed validation semantics 및 fail path/message 유지 확인.
- lint/build/mod-contract/large-file budget PASS.
