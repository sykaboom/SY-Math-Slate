# Task 509: Mod Package Selectors Slicing Stage 1 (domain module split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/selectors.ts` 단일 대형 파일(1253 lines)을 도메인별 selector 모듈로 분해한다.
  - 기존 selector API surface(export 이름/동작)는 그대로 유지한다.
- What must NOT change:
  - runtime mod/package 정책 판단 결과 변경 금지.
  - merge precedence / fallback / compat alias 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/selectors/index.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/packageSelection.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/activePackageRules.ts` (new)
- `codex_tasks/task_509_mod_package_selectors_slicing_stage1.md`

Out of scope:
- `types.ts`, `guards.ts`, `registry.ts` 계약 변경
- toolbar renderer/host logic 변경
- runtime env flag semantics 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/runtime/modding/package/selectors/*`는 feature import 금지.
  - `selectors.ts`는 최종 facade export only 형태로 축소.
- Compatibility:
  - 기존 import 경로(`@core/runtime/modding/package` 및 `./selectors`)에서 컴파일/동작 동일 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-SELECTORS-1
- Depends on tasks:
  - `task_508`
- Enables tasks:
  - `task_510`
- Parallel group:
  - G-P6-SLICE-W2
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 10
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO (core-internal split)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~55min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 단일 파일 잠금 + export compatibility 검증이 중요.

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

- [ ] AC-1: `selectors.ts`가 facade 수준(<120 lines)으로 축소된다.
- [ ] AC-2: selector exported symbol set(이름/시그니처)이 기존 대비 보존된다.
- [ ] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors.ts`
   - Expected result:
     - 120 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "from \"\\./selectors\"|from \"@core/runtime/modding/package\"" v10/src | head -n 40`
   - Expected result:
     - 기존 import 경로 유지 상태에서 compile 성공.
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
  - re-export 누락 시 런타임 import failure 가능.
  - split 과정에서 helper 함수 visibility/ordering 실수 가능.
- Roll-back:
  - selectors split 파일 + facade 파일 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/selectors/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules.ts`
- `codex_tasks/task_509_mod_package_selectors_slicing_stage1.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/selectors.ts`
- `rg -n "from \"\\./selectors\"|from \"@core/runtime/modding/package\"" v10/src | head -n 40`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
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
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...
