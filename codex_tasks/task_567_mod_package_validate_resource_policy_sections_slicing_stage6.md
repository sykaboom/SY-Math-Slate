# Task 567: mod-package validate resource-policy sections slicing (stage6)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `resourcePolicy/sections.ts`를 facade로 축소하고, section parser를 하위 모듈로 분리한다.
- What must NOT change:
  - resourcePolicy parse/validate semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections/`
- `codex_tasks/task_567_mod_package_validate_resource_policy_sections_slicing_stage6.md`

Out of scope:
- `parse.ts`, `index.ts` 계약 변경
- selector/registry/runtime 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기존 relative import lane 유지
  - facade export names 유지
- Compatibility:
  - `parsePolicyPatch`, `parseCommands`, `parseShortcuts`, `parseInputBehavior` API unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W21
- Depends on tasks:
  - `task_566`
- Enables tasks:
  - `task_570`
- Parallel group:
  - G-P6-SLICE-W21-A
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
  - guard parser 내부 분해만 수행하는 저위험 내부 리팩터링.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `sections.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: split 하위 모듈로 section parse 로직이 이동한다.
- [x] AC-3: `npm run lint`, `npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections.ts`
   - Expected result:
     - <= 40
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - relative import depth 실수로 build fail 가능.
- Roll-back:
  - `sections.ts` 단일 파일 형태로 즉시 revert 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections/common.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections/policyPatch.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections/commands.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections/shortcuts.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections/inputBehavior.ts`
- `codex_tasks/task_567_mod_package_validate_resource_policy_sections_slicing_stage6.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections.ts`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `sections.ts` line count is `4`, and section parsers moved under `resourcePolicy/sections/*`.
- guard behavior/API names were preserved with facade re-export pattern.
