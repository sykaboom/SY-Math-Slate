# Task 565: mod package input-behavior normalize slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/resourcePolicy/inputBehaviorRule/normalize.ts`를 facade + normalize internals로 분리한다.
  - inputBehavior normalize semantics를 유지한다.
- What must NOT change:
  - invalid-resource-policy fail path/message 및 parseInputBehaviorRule 결과 계약 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize/` (new)
- `codex_tasks/task_565_mod_package_input_behavior_normalize_slicing_stage3.md`

Out of scope:
- parseInputBehaviorRule orchestration 순서 변경
- command/shortcut parser 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - inputBehavior normalize 내부 분리만 허용
- Compatibility:
  - `normalizeModId`, `normalizeChain`, `buildInputBehaviorRule` export path 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W20
- Depends on tasks:
  - `task_563`
- Enables tasks:
  - `task_566`
- Parallel group:
  - G-P6-SLICE-W20-B
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
  - normalize parser 분리이며 회귀 위험이 제한적.

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

- [x] AC-1: `inputBehaviorRule/normalize.ts`는 facade export only.
- [x] AC-2: modId/chain/build normalization semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract/check_v10_large_file_budget PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize.ts`
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
  - normalize chain/modId rule wiring 누락.
- Roll-back:
  - normalize.ts 단일 파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize/modId.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize/chain.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize/rule.ts`
- `codex_tasks/task_565_mod_package_input_behavior_normalize_slicing_stage3.md`

Commands run:
- `sed -n '1,120p' v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize.ts`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- `normalize.ts`는 facade export-only로 축소되었고 modId/chain/rule normalize가 `normalize/*`로 분리됨.
- `parseInputBehaviorRule`의 normalize semantics 및 fail contract 유지 확인.
- lint/build/mod-contract/large-file budget PASS.
