# Task 526: selectors/resourceCommandMerge Slicing Stage 1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/selectors/resourceCommandMerge.ts`를 facade + merge modules로 분해한다.
  - `mergeCommandsByResourceLayerLoadOrder` API 유지.
- What must NOT change:
  - overrideAllowed/blocked/winner-loser diagnostics semantics 변경 금지.

---

## Scope (Base Required)
Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/index.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/helpers.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge.ts` (new)
- `codex_tasks/task_526_selectors_resource_command_merge_slicing_stage1.md`

Out of scope:
- caller logic 변경

---

## Dependencies / Constraints (Base Required)
- New dependencies allowed: NO
- `resourceCommandMerge.ts` facade export-only(<40 lines).

---

## DAG / Wave Metadata (Base Required)
- Wave ID: W-P6-SLICE-W8
- Depends on tasks: `task_523`
- Enables tasks: `task_527`
- Parallel group: G-P6-SLICE-W8
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Acceptance Criteria (Base Required)
- [x] AC-1: `resourceCommandMerge.ts` facade(<=40 lines)
- [x] AC-2: `mergeCommandsByResourceLayerLoadOrder` API 유지
- [x] AC-3: lint/build/check_mod_contract PASS

---

## Manual Verification Steps (Base Required)
1) `wc -l v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts`
2) `rg -n "mergeCommandsByResourceLayerLoadOrder" v10/src/core/runtime/modding/package/selectors`
3) `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`

---

## Risks / Roll-back Notes (Base Required)
- Risks: blockedCommandIds 계산 drift
- Roll-back: resourceCommandMerge 관련 파일 동시 revert

---

## Approval Gate (Base Required)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge.ts`
- `codex_tasks/task_526_selectors_resource_command_merge_slicing_stage1.md`
Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts`
- `rg -n "mergeCommandsByResourceLayerLoadOrder" v10/src/core/runtime/modding/package/selectors`
- `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/run_repo_verifications.sh --stage end`
Gate Results:
- Lint: PASS
- Build: PASS
- Script checks: PASS
Failure Classification:
- Pre-existing failures: none
- Newly introduced failures: none
- Blocking: NO
- Mitigation: n/a
