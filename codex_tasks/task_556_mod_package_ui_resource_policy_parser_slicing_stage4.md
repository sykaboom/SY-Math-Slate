# Task 556: mod package ui/resource policy parser slicing (stage4)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `uiAndResourcePolicy/uiPolicy.ts`와 `uiAndResourcePolicy/resourcePolicy.ts`를 facade + parser 모듈로 분리한다.
  - ui/resource policy parse semantics를 유지한다.
- What must NOT change:
  - policy parse 에러 코드/path/message 계약 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/` (new)
- `codex_tasks/task_556_mod_package_ui_resource_policy_parser_slicing_stage4.md`

Out of scope:
- command/shortcut/inputBehavior parser semantics 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - uiAndResourcePolicy 내부 분리만 허용
- Compatibility:
  - exported parser names/signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W17
- Depends on tasks:
  - `task_554`
- Enables tasks:
  - `task_557`
- Parallel group:
  - G-P6-SLICE-W17-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7~12
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
  - parser facade split으로 회귀 위험 제한.

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

- [x] AC-1: `uiPolicy.ts`, `resourcePolicy.ts`는 facade re-export only.
- [x] AC-2: ui/resource policy parser semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts`
   - Expected result:
     - facade export only.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ui/resource optional field parse 분기 누락.
- Roll-back:
  - uiPolicy.ts/resourcePolicy.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/parse.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy/sections.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/parse.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/sections.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_556_mod_package_ui_resource_policy_parser_slicing_stage4.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts`
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- ui/resource policy facade는 export-only로 축소되었고 parser sections는 `uiPolicy/*`, `resourcePolicy/*`로 분리됨.
- AI_READ_ME runtime modding split 이력에 Wave17 반영.
- lint/build/mod-contract 모두 PASS.
