# Task 510: Large-file Budget Wave2 (selectors split guard update)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave2 기준 대형 파일 budget에 `selectors.ts`를 추가하고 임계치를 고정한다.
  - 검증 체인에서 budget regression을 즉시 잡도록 보강한다.
- What must NOT change:
  - runtime behavior 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_510_large_file_budget_wave2_selectors.md`

Out of scope:
- app/runtime source 코드 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - shell script/env only

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-SELECTORS-2
- Depends on tasks:
  - `task_509`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-P6-SLICE-W2
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
  - guardrail finalize 단계.

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

- [ ] AC-1: `check_v10_large_file_budget.sh`가 selectors 파일도 budget 대상으로 검사한다.
- [ ] AC-2: Wave2 budget env 값 기준 PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS.
   - Covers: AC-1, AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - budget 과도 설정 시 개발 속도 저하
- Roll-back:
  - env threshold 조정 또는 selectors 항목 제거

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_510_large_file_budget_wave2_selectors.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_v10_large_file_budget.sh`
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
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...
