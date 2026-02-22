# Task 622: mod-package conflicts summary helpers core slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - conflict summary helper lane을 facade + core helper로 분리한다.
- What must NOT change:
  - conflict summary 계산 규칙/출력 구조 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/summary/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/summary/helpers/core.ts`
- `codex_tasks/task_622_mod_package_conflicts_summary_helpers_core_slicing_stage3.md`

Out of scope:
- conflict summary selector facade 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - packageSelection conflicts summary lane 내부 분해만 수행
- Compatibility:
  - exported helper names/signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W35
- Depends on tasks:
  - `task_620`
- Enables tasks:
  - `task_624`
- Parallel group:
  - G-P6-SLICE-W35-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - helpers facade/core 분리 단일 lane 작업.

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

- [x] AC-1: `summary/helpers.ts`가 facade-only(<=40 lines)로 축소된다.
- [x] AC-2: helper 본문이 `summary/helpers/core.ts`로 이동된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/summary/helpers.ts`
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
  - helper 이동 후 import path mismatch 가능.
- Roll-back:
  - 단일 helpers.ts 구조로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/summary/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/conflicts/summary/helpers/core.ts`
- `codex_tasks/task_622_mod_package_conflicts_summary_helpers_core_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- conflict summary helper facade/core 분리 완료.
- 기존 helper export 시그니처 유지 확인.
- lint/build/repo verification PASS.
