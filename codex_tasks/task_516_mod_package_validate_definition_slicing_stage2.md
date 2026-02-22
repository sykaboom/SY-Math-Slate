# Task 516: Mod Package validateDefinition Slicing Stage 2 (facade + validation split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/guards/validateDefinition.ts`를 facade로 축소하고 validation 단계 모듈로 재분리한다.
  - `validateModPackageDefinition`/`isModPackageDefinition` 동작을 유지한다.
- What must NOT change:
  - validation error code/path/message semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize.ts` (new)
- `codex_tasks/task_516_mod_package_validate_definition_slicing_stage2.md`

Out of scope:
- `resourcePolicy.ts`, `uiPolicy.ts`, `utils.ts` rule 변경
- mod package 타입 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards 하위 모듈은 `core/runtime/modding/package/guards` 내부 import만 허용.
  - `validateDefinition.ts`는 facade export only 형태로 축소.
- Compatibility:
  - 기존 import 경로(`./validateDefinition`) compile/runtime 동작 동일 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-VALIDATE-DEFINITION-2
- Depends on tasks:
  - `task_514`
- Enables tasks:
  - `task_517`
- Parallel group:
  - G-P6-SLICE-W5
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~40min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - validation semantics 유지가 핵심.

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

- [x] AC-1: `validateDefinition.ts`가 facade 수준(<40 lines)으로 축소된다.
- [x] AC-2: `validateModPackageDefinition`/`isModPackageDefinition` 동작이 유지된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "validateModPackageDefinition|isModPackageDefinition" v10/src/core/runtime/modding/package/guards`
   - Expected result:
     - 기존 이름 기반 참조 유지.
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
  - validation 단계 분해 중 실패 코드 path drift 가능.
- Roll-back:
  - validateDefinition split 파일 + facade 파일 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize.ts`
- `codex_tasks/task_516_mod_package_validate_definition_slicing_stage2.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition.ts`
- `rg -n "validateModPackageDefinition|isModPackageDefinition" v10/src/core/runtime/modding/package/guards`
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
