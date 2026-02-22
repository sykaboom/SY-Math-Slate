# Task 549: mod package selection conflicts slicing (stage4)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/packageSelection/conflicts.ts`를 facade + conflict selector 모듈로 분리한다.
  - conflict summary semantics를 유지한다.
- What must NOT change:
  - declared/reverse/registered/missing conflict 계산 규칙 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/` (new)
- `codex_tasks/task_549_mod_package_selection_conflicts_slicing_stage4.md`

Out of scope:
- activation/sorting selectors 로직 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - packageSelection/conflicts 내부 분리만 허용
- Compatibility:
  - exported selector names/types 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W15
- Depends on tasks:
  - `task_548`
- Enables tasks:
  - `task_551`
- Parallel group:
  - G-P6-SLICE-W15-A
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
  - selector-only slicing으로 회귀 위험 낮음.

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

- [x] AC-1: `conflicts.ts`는 facade re-export only.
- [x] AC-2: conflict summary semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts.ts`
   - Expected result:
     - facade re-export only.
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
  - reverse conflict 계산 경로 누락.
- Roll-back:
  - conflicts.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/normalize.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/summary.ts`
- `codex_tasks/task_549_mod_package_selection_conflicts_slicing_stage4.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts.ts`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 단일 export only로 축소되었고, conflict normalize/summary 로직은 `conflicts/*` 내부로 분리됨.
- lint/build/mod-contract 모두 PASS.
