# Task 494: Legacy Alias Isolation + Runtime Matrix Cleanup

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - toolbar mode <-> modId legacy alias fallback 로직을 `core/runtime/modding/package/legacyAlias.ts`로 격리한다.
  - runtime regression matrix의 activation_policy 패턴을 구식 placeholder에서 실제 selector 경로로 교체한다.
- What must NOT change:
  - package map 우선, legacy alias fallback-only 동작 유지.
  - alias fallback telemetry 이벤트(`mod.alias_fallback_hit`) 계약 유지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/legacyAlias.ts` (new)
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/index.ts`
- `codex_tasks/workflow/mod_package_runtime_regression_matrix.csv`
- `scripts/check_mod_contract.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_494_legacy_alias_isolation_and_matrix_cleanup.md`

Out of scope:
- alias 완전 제거
- toolbar UI 동작/레이아웃 변경
- mod package schema 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - alias fallback 구현은 core/runtime/modding/package 내부에만 존재해야 한다.
  - feature 계층에서 alias mapping 상수 재정의 금지.
- Compatibility:
  - fallback source 코드(`legacy.toolbar-mode-to-mod-id`, `legacy.mod-id-to-toolbar-mode`) 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-MEDIUM-01
- Depends on tasks:
  - `task_493`
- Enables tasks:
  - `task_495` alias retire plan lock
- Parallel group:
  - G-ALIAS-ISOLATION
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
  - YES (core package + workflow check)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - selector/guard script/matrix를 동시에 맞추는 단일 직렬 작업이 안전하다.

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
- [x] Semantic/rule changes:
  - alias fallback 격리 파일 경로 및 regression matrix 패턴 정합 변경을 `v10/AI_READ_ME.md`에 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: legacy alias mapping 상수가 `selectors.ts`에서 제거되고 `legacyAlias.ts`로 격리된다.
- [x] AC-2: selectors의 alias fallback source 결과가 기존 문자열과 동일하게 유지된다.
- [x] AC-3: `mod_package_runtime_regression_matrix.csv` activation_policy 패턴이 실제 selector 함수명으로 교체된다.
- [x] AC-4: `bash scripts/check_mod_contract.sh` + `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "COMPAT_TOOLBAR_MODE_TO_MOD_ID|COMPAT_MOD_ID_TO_TOOLBAR_MODE|legacy\.toolbar-mode-to-mod-id|legacy\.mod-id-to-toolbar-mode" v10/src/core/runtime/modding/package`
   - Expected result:
     - mapping 상수는 `legacyAlias.ts`에만 존재.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `sed -n '1,40p' codex_tasks/workflow/mod_package_runtime_regression_matrix.csv`
   - Expected result:
     - activation_policy pattern이 `selectActiveModPackageActivationModIdResolutionForToolbarMode`로 기록.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - alias helper 경로 분리 시 selectors import 누락 가능.
- Roll-back:
  - `legacyAlias.ts` 도입 커밋 revert로 즉시 원복 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "응 진행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/legacyAlias.ts` (new)
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/index.ts`
- `codex_tasks/workflow/mod_package_runtime_regression_matrix.csv`
- `scripts/check_mod_contract.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_494_legacy_alias_isolation_and_matrix_cleanup.md`

Commands run (only if user asked or required by spec):
- `rg -n "task_494|legacy alias|alias isolation|compat" codex_tasks v10/docs/architecture -S`
- `sed -n '1,220p' v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md`
- `rg -n "COMPAT_TOOLBAR_MODE_TO_MOD_ID|COMPAT_MOD_ID_TO_TOOLBAR_MODE|legacy\\.toolbar-mode-to-mod-id|legacy\\.mod-id-to-toolbar-mode" v10/src/core/runtime/modding/package`
- `sed -n '1,40p' codex_tasks/workflow/mod_package_runtime_regression_matrix.csv`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: alias mapping 상수는 `legacyAlias.ts`로 이동, `selectors.ts` 직접 상수 정의 제거.
- AC-2 PASS: fallback source 문자열(`legacy.toolbar-mode-to-mod-id`, `legacy.mod-id-to-toolbar-mode`) 유지.
- AC-3 PASS: runtime regression matrix activation_policy 패턴을 canonical selector 함수로 교체.
- AC-4 PASS: `check_mod_contract.sh` + `lint/build` 통과.

Notes:
- runtime matrix가 구식 placeholder 패턴을 더 이상 사용하지 않으므로 `check_mod_contract.sh`의 activation_policy compat warn 경로를 제거했다.
