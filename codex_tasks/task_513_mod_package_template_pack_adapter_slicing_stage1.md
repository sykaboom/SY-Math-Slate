# Task 513: Mod Package TemplatePackAdapter Slicing Stage 1 (domain module split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/templatePackAdapter.ts` 단일 대형 파일(314 lines)을 도메인별 adapter 모듈로 분해한다.
  - 기존 adapter API surface(export 이름/동작)는 그대로 유지한다.
- What must NOT change:
  - template-pack -> mod-package adaptation/validation semantics 변경 금지.
  - toolbar pack parsing 규칙/오류 조건 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/index.ts` (new)
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts` (new)
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts` (new)
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors.ts` (new)
- `codex_tasks/task_513_mod_package_template_pack_adapter_slicing_stage1.md`

Out of scope:
- `templatePackAdapter.types.ts` 계약 변경
- template pack manifest source data 변경
- runtime mod package registry/selector logic 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/runtime/modding/package/templatePackAdapter/*`는 feature import 금지.
  - `templatePackAdapter.ts`는 facade export only 형태로 축소.
- Compatibility:
  - 기존 import 경로(`@core/runtime/modding/package` 및 `./templatePackAdapter`)에서 compile/runtime 동작 동일 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-TEMPLATE-ADAPTER-1
- Depends on tasks:
  - `task_512`
- Enables tasks:
  - `task_514`
- Parallel group:
  - G-P6-SLICE-W4
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
  - NO (core-internal split)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~40min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - facade 전환 + adapter/selector function set 보존 검증이 핵심.

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

- [x] AC-1: `templatePackAdapter.ts`가 facade 수준(<40 lines)으로 축소된다.
- [x] AC-2: adapter exported symbol set(이름/시그니처)이 기존 대비 보존된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/templatePackAdapter.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "adaptTemplatePackManifestToModPackageDefinition|validateTemplatePackAdapterManifest|selectTemplatePackManifestByModPackageId" v10/src/core/runtime/modding/package`
   - Expected result:
     - 기존 이름 기반 compile/runtime 참조 유지.
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
  - parser/adaptation helper 분리 시 null-return/guard semantics drift 가능.
  - typed/untyped selector 함수 export 누락 가능.
- Roll-back:
  - adapter split 파일 + facade 파일 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/index.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors.ts`
- `codex_tasks/task_513_mod_package_template_pack_adapter_slicing_stage1.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `rg -n "adaptTemplatePackManifestToModPackageDefinition|validateTemplatePackAdapterManifest|selectTemplatePackManifestByModPackageId" v10/src/core/runtime/modding/package`
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
