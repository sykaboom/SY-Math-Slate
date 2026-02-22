# Task 589: mod-package resource-policy merge run slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourcePolicyMerge/merge.ts`를 facade + layer-apply helper로 분해한다.
- What must NOT change:
  - policy merge patch precedence/diagnostic semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/applyLayer.ts`
- `codex_tasks/task_589_mod_package_resource_policy_merge_run_slicing_stage2.md`

Out of scope:
- resource policy helper contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors lane 내부 분해 only
- Compatibility:
  - `mergePolicyByResourceLayerLoadOrder` signature unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W27
- Depends on tasks:
  - `task_588`
- Enables tasks:
  - `task_592`
- Parallel group:
  - G-P6-SLICE-W27-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
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
  - policy merge loop 책임 분리.

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

- [ ] AC-1: `merge.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [ ] AC-2: layer apply/diagnostic 로직이 helper로 분리된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/merge.ts`
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
  - winner/loser diagnostics emission order drift 가능.
- Roll-back:
  - 기존 단일 `merge.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/applyLayer.ts`
- `codex_tasks/task_589_mod_package_resource_policy_merge_run_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/merge.ts v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/applyLayer.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- PASS: `merge.ts` is now 27 lines (<=40 target).
- PASS: policy layer diagnostic/patch apply responsibility moved to helper without merge-order behavior changes.
