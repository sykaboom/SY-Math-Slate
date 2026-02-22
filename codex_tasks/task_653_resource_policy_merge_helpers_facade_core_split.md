# Task 653: resource policy merge helpers facade-core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `resourcePolicyMerge/helpers.ts`를 facade/core로 분리해 JSON merge helper 밀집도를 낮춘다.
- What must NOT change:
  - clone/merge patch 의미를 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/helpers/core.ts`
- `codex_tasks/task_653_resource_policy_merge_helpers_facade_core_split.md`

Out of scope:
- resourcePolicyMerge 호출부/적용 레이어 변경
- budget/env/doc 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기존 selector/types 경계 유지.
- Compatibility:
  - helper export API 그대로 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W44
- Depends on tasks:
  - `task_651`
- Enables tasks:
  - `task_654`
- Parallel group:
  - G-P6-SLICE-W44-B
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
  - NO
- Rationale:
  - 단일 helper 계층 분리라 직렬이 안전.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
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

- [x] AC-1: `helpers.ts`가 facade로 축소된다.
- [x] AC-2: 신규 `helpers/core.ts`로 기존 merge helper 구현이 이동한다.
- [x] AC-3: `npm run lint` + `npm run build` 통과.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - lint PASS
   - Covers: AC-3

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - build PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - JSON patch 처리 미세 회귀 위험.
- Roll-back:
  - 분리 커밋 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/helpers/core.ts`
- `codex_tasks/task_653_resource_policy_merge_helpers_facade_core_split.md`

Commands run (only if user asked or required by spec):
- `bash -n scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_v10_large_file_budget.sh`
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
