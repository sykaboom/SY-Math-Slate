# Task 644: mod package toolbar modes/helpers facade-core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `toolbarPlan/planResolution/sections/modes/helpers.ts`를 facade/core로 분리해 함수 밀집도를 낮춘다.
- What must NOT change:
  - draw/playback/canvas/morePanel 섹션 판정 결과를 바꾸지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes/helpers/core.ts`
- `codex_tasks/task_644_mod_package_toolbar_modes_helpers_facade_core_split.md`

Out of scope:
- toolbar 정책/리졸버 의미 변경
- budget threshold 조정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `types` 경로 및 기존 export 시그니처 유지.
- Compatibility:
  - 호출부는 수정 없이 동작해야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W41
- Depends on tasks:
  - `task_642`
- Enables tasks:
  - `task_645`
- Parallel group:
  - G-P6-SLICE-W41-B
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
  - 단일 파일군 분할이므로 직렬 진행이 안전하다.

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

- [x] AC-1: `modes/helpers.ts`가 facade로 축소된다.
- [x] AC-2: 신규 `modes/helpers/core.ts`에 섹션 빌더 구현이 분리된다.
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
  - 타입 alias 이동 누락 시 컴파일 실패.
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
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes/helpers/core.ts`
- `codex_tasks/task_644_mod_package_toolbar_modes_helpers_facade_core_split.md`

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
