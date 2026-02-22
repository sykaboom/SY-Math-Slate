# Task 564: mod package validate ui-policy sections slicing (stage5)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections.ts`를 facade + section modules로 분리한다.
  - uiPolicy section parsing semantics를 유지한다.
- What must NOT change:
  - invalid-ui-policy fail path/message 및 parseUiPolicy 결과 계약 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections/` (new)
- `codex_tasks/task_564_mod_package_validate_ui_policy_sections_slicing_stage5.md`

Out of scope:
- `parseUiPolicy` orchestration 순서 변경
- resourcePolicy parser 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - uiPolicy sections 내부 분리만 허용
- Compatibility:
  - `parseAllowToolbarContributionGroups`, `parseAllowPanelSlots`, `parseToolbarItems`, `parsePanelItems` export path 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W20
- Depends on tasks:
  - `task_563`
- Enables tasks:
  - `task_566`
- Parallel group:
  - G-P6-SLICE-W20-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5~9
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
  - section parser 분리이며 회귀 위험이 제한적.

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

- [x] AC-1: `uiPolicy/sections.ts`는 facade export only.
- [x] AC-2: groups/slots/items parse semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract/check_v10_large_file_budget PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections.ts`
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
  - section merge helper wiring 누락.
- Roll-back:
  - sections.ts 단일 파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections/common.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections/groupsAndSlots.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections/items.ts`
- `codex_tasks/task_564_mod_package_validate_ui_policy_sections_slicing_stage5.md`

Commands run:
- `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections.ts`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- `sections.ts`는 facade export-only로 축소되었고 groups/slots/items parser가 `sections/*`로 분리됨.
- `parseUiPolicy`가 기대하는 section parser semantics 및 fail contract 유지 확인.
- lint/build/mod-contract/large-file budget PASS.
