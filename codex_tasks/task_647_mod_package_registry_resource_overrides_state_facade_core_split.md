# Task 647: mod package registry resource-overrides state facade-core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `registry/resourceOverrides/state.ts`를 facade/core로 분리해 sanitize/상태 갱신 로직을 분리한다.
- What must NOT change:
  - runtime resource overrides 저장/조회 결과를 바꾸지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/state.ts`
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/state/core.ts`
- `codex_tasks/task_647_mod_package_registry_resource_overrides_state_facade_core_split.md`

Out of scope:
- layer sanitize 정책 변경
- budget/env/doc 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기존 `layer.ts` sanitize 경로 유지.
- Compatibility:
  - 기존 공개 API 시그니처 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W42
- Depends on tasks:
  - `task_645`
- Enables tasks:
  - `task_648`
- Parallel group:
  - G-P6-SLICE-W42-B
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
  - 상태 경로 분리는 단일 직렬 작업이 안전하다.

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

- [x] AC-1: `resourceOverrides/state.ts`가 facade 역할로 축소된다.
- [x] AC-2: 신규 `resourceOverrides/state/core.ts`에 상태 갱신 구현이 분리된다.
- [x] AC-3: `npm run lint`, `npm run build` 통과.

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
  - spread/delete 처리 순서 변경 시 상태 회귀.
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
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/state.ts`
- `v10/src/core/runtime/modding/package/registry/resourceOverrides/state/core.ts`
- `codex_tasks/task_647_mod_package_registry_resource_overrides_state_facade_core_split.md`

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
