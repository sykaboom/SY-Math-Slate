# Task 521: Mod Package registry Slicing Stage 1 (facade + runtime modules)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/registry.ts` 단일 대형 파일(252 lines)을 facade + runtime modules로 분해한다.
  - registry public API surface(export 이름/동작)는 유지한다.
- What must NOT change:
  - package registration/ordering/defaultEnabled 우선순위, toolbar base provider 등록, runtime resource overrides sanitize 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/registry.ts`
- `v10/src/core/runtime/modding/package/registry/index.ts` (new)
- `v10/src/core/runtime/modding/package/registry/classRegistry.ts` (new)
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts` (new)
- `v10/src/core/runtime/modding/package/registry/resourceOverrides.ts` (new)
- `codex_tasks/task_521_mod_package_registry_slicing_stage1.md`

Out of scope:
- package type 계약 변경
- selectors/guards 로직 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `registry.ts`는 facade export-only(<40 lines).
  - split 모듈은 `core/runtime/modding/package/*` 내부 참조만 허용.
- Compatibility:
  - `@core/runtime/modding/package` 및 `./registry` import 경로 compile/runtime 유지.

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
  - 6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~45min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - singleton/runtime state API 호환성이 핵심.

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

If YES:
- Docs to update:
  - `v10/AI_READ_ME.md`

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `registry.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: registry API(`registerRuntimeModPackage`, `listRuntimeModPackages`, `registerRuntimeToolbarBaseProvider`, `registerRuntimeModResourceOverrides`)가 기존 시그니처로 유지된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/registry.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "registerRuntimeModPackage|listRuntimeModPackages|registerRuntimeToolbarBaseProvider|registerRuntimeModResourceOverrides" v10/src/core/runtime/modding/package`
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
  - runtime singleton reset/clear 경로 누락 가능.
- Roll-back:
  - `registry.ts` + 신규 `registry/*` 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/registry.ts`
- `v10/src/core/runtime/modding/package/registry/index.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry.ts`
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts`
- `v10/src/core/runtime/modding/package/registry/resourceOverrides.ts`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_521_mod_package_registry_slicing_stage1.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/registry.ts`
- `rg -n \"registerRuntimeModPackage|listRuntimeModPackages|registerRuntimeToolbarBaseProvider|registerRuntimeModResourceOverrides\" v10/src/core/runtime/modding/package`
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
