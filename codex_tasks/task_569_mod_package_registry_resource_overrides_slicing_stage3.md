# Task 569: mod-package registry resource-overrides slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `registry/resourceOverrides.ts`를 facade+state/helper 구조로 분해한다.
- What must NOT change:
  - resource overrides get/set/clear semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/registry/resourceOverrides.ts`
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/`
- `codex_tasks/task_569_mod_package_registry_resource_overrides_slicing_stage3.md`

Out of scope:
- selectors/resource merge semantics 변경
- mod package type contracts 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - registry layer 내부에서만 분해
- Compatibility:
  - exported function names/signatures unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W21
- Depends on tasks:
  - `task_566`
- Enables tasks:
  - `task_570`
- Parallel group:
  - G-P6-SLICE-W21-C
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - singleton + sanitize helper 분리로 line budget 절감.

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

- [x] AC-1: `resourceOverrides.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: state/sanitize helper 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/registry/resourceOverrides.ts`
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
  - clone/sanitize 누락 시 mutable reference 회귀 가능.
- Roll-back:
  - split 이전 파일로 되돌리고 helper 제거.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/registry/resourceOverrides.ts`
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/layer.ts`
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/state.ts`
- `codex_tasks/task_569_mod_package_registry_resource_overrides_slicing_stage3.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/registry/resourceOverrides.ts`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `resourceOverrides.ts` line count is `8`; sanitize/state logic was split into dedicated helpers.
- get/set/register/clear/reset API semantics were preserved.
