# Task 582: mod-package resource-shortcut operations slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourceShortcutMerge/merge/operations.ts`를 facade + remove/upsert internals로 분해한다.
- What must NOT change:
  - shortcut conflict diagnostic semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations/`
- `codex_tasks/task_582_mod_package_resource_shortcut_operations_slicing_stage2.md`

Out of scope:
- shortcut merge run ordering 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors lane 내부 분해 only
- Compatibility:
  - `applyShortcutRule` signature unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W25
- Depends on tasks:
  - `task_580`
- Enables tasks:
  - `task_584`
- Parallel group:
  - G-P6-SLICE-W25-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~5
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
  - remove/upsert diagnostic branch 분리.

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

- [x] AC-1: `operations.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [x] AC-2: remove/upsert diagnostic 로직이 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations.ts`
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
  - shortcut diagnostics winner/loser emission 순서 drift 가능.
- Roll-back:
  - 기존 단일 `operations.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations/remove.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations/upsert.ts`
- `codex_tasks/task_582_mod_package_resource_shortcut_operations_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade file line count is `19`; remove/upsert branches are isolated in `operations/*`.
