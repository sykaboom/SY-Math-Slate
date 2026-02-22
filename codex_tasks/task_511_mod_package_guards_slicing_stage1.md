# Task 511: Mod Package Guards Slicing Stage 1 (domain module split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/guards.ts` 단일 대형 파일(784 lines)을 도메인별 validation 모듈로 분해한다.
  - 기존 guard API surface(export 이름/동작)는 그대로 유지한다.
- What must NOT change:
  - ModPackage manifest validation rule/오류 코드/우선순위/실패 path semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards.ts`
- `v10/src/core/runtime/modding/package/guards/index.ts` (new)
- `v10/src/core/runtime/modding/package/guards/types.ts` (new)
- `v10/src/core/runtime/modding/package/guards/utils.ts` (new)
- `v10/src/core/runtime/modding/package/guards/uiPolicy.ts` (new)
- `v10/src/core/runtime/modding/package/guards/resourcePolicy.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition.ts` (new)
- `codex_tasks/task_511_mod_package_guards_slicing_stage1.md`

Out of scope:
- `types.ts`, `registry.ts`, `selectors.ts` 계약 변경
- template pack manifest data 변경
- runtime behavior/env flag semantics 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/runtime/modding/package/guards/*`는 feature import 금지.
  - `guards.ts`는 최종 facade export only 형태로 축소.
- Compatibility:
  - 기존 import 경로(`@core/runtime/modding/package` 및 `./guards`)에서 compile/runtime 동작 동일 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-GUARDS-1
- Depends on tasks:
  - `task_510`
- Enables tasks:
  - `task_512`
- Parallel group:
  - G-P6-SLICE-W3
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO (core-internal split)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~45min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 단일 파일 잠금 + validation semantics 보존 검증이 핵심.

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

- [x] AC-1: `guards.ts`가 facade 수준(<80 lines)으로 축소된다.
- [x] AC-2: `validateModPackageDefinition`/`isModPackageDefinition` 및 validation failure semantics가 유지된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards.ts`
   - Expected result:
     - 80 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "validateModPackageDefinition|isModPackageDefinition" v10/src/core/runtime/modding/package`
   - Expected result:
     - facade 경로/분해 모듈에서 모두 compile 가능.
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
  - helper 분리 중 validation code/path 메시지 drift 가능.
  - re-export 누락 시 import/runtime failure 가능.
- Roll-back:
  - guards split 파일 + facade 파일 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards.ts`
- `v10/src/core/runtime/modding/package/guards/index.ts`
- `v10/src/core/runtime/modding/package/guards/types.ts`
- `v10/src/core/runtime/modding/package/guards/utils.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition.ts`
- `codex_tasks/task_511_mod_package_guards_slicing_stage1.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/guards.ts`
- `rg -n "validateModPackageDefinition|isModPackageDefinition" v10/src/core/runtime/modding/package`
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
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - N/A
