# Task 522: Mod Package validateDefinition/uiAndResourcePolicy Slicing Stage 2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts`를 facade + ui/resource parser 모듈로 분해한다.
  - `parseUiPolicy`, `parseResourcePolicy` exported API 유지.
- What must NOT change:
  - validation fail path/code/message semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/index.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts` (new)
- `codex_tasks/task_522_mod_package_validate_ui_resource_policy_slicing_stage2.md`

Out of scope:
- validateDefinition index flow 변경
- guards/utils 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `uiAndResourcePolicy.ts`는 facade export-only(<40 lines).
- Compatibility:
  - `validateDefinition/index.ts`에서 import 동작 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W7
- Depends on tasks:
  - `task_520`
- Enables tasks:
  - `task_523`
- Parallel group:
  - G-P6-SLICE-W7
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - guard validation 경로 보존이 핵심.

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

- [x] AC-1: `uiAndResourcePolicy.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: `parseUiPolicy`, `parseResourcePolicy` API 유지.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "export const parseUiPolicy|export const parseResourcePolicy" v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy*`
   - Expected result:
     - API 심볼 존재.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - validation fail path string drift 가능.
- Roll-back:
  - `uiAndResourcePolicy.ts` + 신규 `uiAndResourcePolicy/*` 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts`
- `codex_tasks/task_522_mod_package_validate_ui_resource_policy_slicing_stage2.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts`
- `rg -n \"export const parseUiPolicy|export const parseResourcePolicy\" v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy*`
- `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/run_repo_verifications.sh --stage end`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - n/a
