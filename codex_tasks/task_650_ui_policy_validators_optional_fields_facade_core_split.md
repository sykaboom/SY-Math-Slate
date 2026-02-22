# Task 650: ui policy validators optional-fields facade-core split

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `applyOptionalFields.ts`를 facade/core로 분리해 optional key 처리 로직을 축약한다.
- What must NOT change:
  - optional string/order/defaultOpen 검증 동작을 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/applyOptionalFields.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/applyOptionalFields/core.ts`
- `codex_tasks/task_650_ui_policy_validators_optional_fields_facade_core_split.md`

Out of scope:
- parser 엔트리/sections 수정
- budget/env/doc 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기존 constants/utils 경계 유지.
- Compatibility:
  - 기존 export 함수 시그니처 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W43
- Depends on tasks:
  - `task_648`
- Enables tasks:
  - `task_651`
- Parallel group:
  - G-P6-SLICE-W43-B
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
  - 단일 validator 분리 작업이라 직렬이 안전하다.

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

- [x] AC-1: `applyOptionalFields.ts`가 facade로 축소된다.
- [x] AC-2: 신규 `applyOptionalFields/core.ts`에 optional 검증 구현이 이동한다.
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
  - optional 필드 처리 누락 시 validation 회귀.
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
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/applyOptionalFields.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/applyOptionalFields/core.ts`
- `codex_tasks/task_650_ui_policy_validators_optional_fields_facade_core_split.md`

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
