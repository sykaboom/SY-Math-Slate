# Task 515: Mod Package packageSelection Slicing Stage 2 (facade + domain split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/selectors/packageSelection.ts`를 facade로 축소하고 하위 도메인 모듈로 재분리한다.
  - selector exported symbol set(이름/동작)을 유지한다.
- What must NOT change:
  - mod package selection/conflict/activation/ui-policy resolution semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/index.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess.ts` (new)
- `codex_tasks/task_515_mod_package_package_selection_slicing_stage2.md`

Out of scope:
- toolbarPlan/resource merge selectors 변경
- package registry/runtime behavior 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors 하위 모듈은 `core/runtime/modding/package` 내부 import만 허용.
  - `packageSelection.ts`는 facade export only 형태로 축소.
- Compatibility:
  - 기존 import 경로(`./packageSelection`) compile/runtime 동작 동일 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-PACKAGE-SELECTION-2
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
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 기존 selector API 보존 검증이 핵심.

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

- [x] AC-1: `packageSelection.ts`가 facade 수준(<40 lines)으로 축소된다.
- [x] AC-2: packageSelection exported symbol set이 유지된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/packageSelection.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "selectActiveModPackage|selectActiveModPackageConflictSummary|selectModPackageActivationModIdForToolbarMode|selectActiveModPackageAllowsPanelSlot" v10/src/core/runtime/modding/package/selectors`
   - Expected result:
     - 기존 selector 이름 참조가 유지된다.
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
  - selector 분리 중 circular import/누락 가능.
- Roll-back:
  - packageSelection split 파일 + facade 파일 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess.ts`
- `codex_tasks/task_515_mod_package_package_selection_slicing_stage2.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/selectors/packageSelection.ts`
- `rg -n "selectActiveModPackage|selectActiveModPackageConflictSummary|selectModPackageActivationModIdForToolbarMode|selectActiveModPackageAllowsPanelSlot" v10/src/core/runtime/modding/package/selectors`
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
