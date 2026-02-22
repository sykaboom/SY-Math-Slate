# Task 562: mod package resource-policy shortcut validators slicing (stage6)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/resourcePolicy/shortcutRules/validators.ts`를 facade + internal validator modules로 분리한다.
  - shortcut validator semantics를 유지한다.
- What must NOT change:
  - invalid-resource-policy fail path/message 및 parseShortcutRules 출력 구조 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/` (new)
- `codex_tasks/task_562_mod_package_resource_policy_shortcut_validators_slicing_stage6.md`

Out of scope:
- command validators semantics 변경
- parse.ts entry loop 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - shortcutRules validator internals 분리만 허용
- Compatibility:
  - `parseShortcutRuleEntry` export path 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W19
- Depends on tasks:
  - `task_560`
- Enables tasks:
  - `task_563`
- Parallel group:
  - G-P6-SLICE-W19-B
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
  - 단일 validator 체인 분해 작업이며 회귀 영향이 제한적.

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

- [x] AC-1: `shortcutRules/validators.ts`는 facade export only.
- [x] AC-2: operation/when/entry validation semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract/check_v10_large_file_budget PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators.ts`
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
  - operation/when validator wiring 누락.
- Roll-back:
  - validators.ts 단일 파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/entry.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/operation.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/when.ts`
- `codex_tasks/task_562_mod_package_resource_policy_shortcut_validators_slicing_stage6.md`

Commands run:
- `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators.ts`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade 파일(`validators.ts`)은 export-only로 축소되었고 entry/operation/when validator가 분리됨.
- parseShortcutRules의 shortcut rule validation semantics 및 fail path/message 유지 확인.
- lint/build/mod-contract/large-file budget PASS.
