# Task 643: mod package active selectors helpers/selectors facade-core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `active/selectors/helpers/selectors.ts`를 facade/core 구조로 분리해 라인 복잡도를 낮춘다.
- What must NOT change:
  - selector 반환값/동작 의미를 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active/selectors/helpers/selectors.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active/selectors/helpers/selectors/core.ts`
- `codex_tasks/task_643_mod_package_active_selectors_helpers_selectors_facade_core_split.md`

Out of scope:
- budget threshold 조정
- 다른 selector 계열 파일 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기존 import 경계 유지 (`core/runtime/modding/package` 내부).
- Compatibility:
  - 외부 import path는 기존 `helpers/selectors.ts`를 그대로 사용해야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W41
- Depends on tasks:
  - `task_642`
- Enables tasks:
  - `task_645`
- Parallel group:
  - G-P6-SLICE-W41-A
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
  - 단일 계층 분리 작업이라 직렬이 안전하다.

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

- [x] AC-1: `helpers/selectors.ts`가 facade 역할만 담당한다.
- [x] AC-2: 신규 `helpers/selectors/core.ts`로 기존 로직이 이동된다.
- [x] AC-3: `npm run lint`와 `npm run build`가 통과한다.

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
  - named export 누락 시 컴파일 에러.
- Roll-back:
  - 해당 커밋 revert로 즉시 복구 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active/selectors/helpers/selectors.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active/selectors/helpers/selectors/core.ts`
- `codex_tasks/task_643_mod_package_active_selectors_helpers_selectors_facade_core_split.md`

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
